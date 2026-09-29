// /api/admin/:action — everything the admin panel does, behind one shared
// password. One function file on purpose (Vercel's Hobby plan caps a
// project at 12 functions). Every action except login/logout/session
// requires a valid session cookie; every write also requires our Origin.
import { send, fail, readJson, str, HttpError } from '../../lib/http.js';
import { verifyPassword, createSession, sessionCookie, clearCookie, requireAdmin, readSession, cookies, checkOrigin, ipHash } from '../../lib/auth.js';
import { q, ensureReady, touchContent, getMeta, setMeta } from '../../lib/db.js';
import { safeUrl } from '../../lib/render.js';
import { storeImage } from '../../lib/storage.js';

const STATUSES = ['new', 'contacted', 'won', 'lost', 'spam'];
const CATS = ['web', 'branding', 'marketing'];
const id = (v) => { const n = Number(v); if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, 'Invalid id'); return n; };
const bool = (v) => v === true || v === 'true';
const list = (v, max, itemMax) => (Array.isArray(v) ? v : String(v || '').split(',')).map((x) => str(x, itemMax)).filter(Boolean).slice(0, max);
const url = (v, label, required = false) => {
  const s = str(v, 500);
  if (!s) { if (required) throw new HttpError(400, `${label} is required.`); return ''; }
  if (!safeUrl(s)) throw new HttpError(400, `${label} must be an https:// link.`);
  return s;
};

// ---------------- auth ----------------
async function login(req, res) {
  checkOrigin(req);
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) throw new HttpError(503, 'Admin is not configured yet (ADMIN_PASSWORD_HASH).');
  await ensureReady();
  const ip = ipHash(req);
  const [{ n }] = await q`select count(*)::int as n from auth_attempts where ip_hash = ${ip} and at > now() - interval '15 minutes'`;
  if (n >= 8) throw new HttpError(429, 'Too many attempts. Try again in 15 minutes.');
  const { password } = await readJson(req, 4096);
  if (!password || !verifyPassword(String(password).slice(0, 200), hash)) {
    await q`insert into auth_attempts (ip_hash) values (${ip})`;
    await new Promise((r) => setTimeout(r, 400)); // blunt brute force a little more
    throw new HttpError(401, 'Wrong password.');
  }
  await q`delete from auth_attempts where ip_hash = ${ip} or at < now() - interval '1 day'`;
  send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(createSession()) });
}
async function logout(req, res) { checkOrigin(req); send(res, 200, { ok: true }, { 'Set-Cookie': clearCookie() }); }
async function session(req, res) {
  let ok = false;
  try { ok = !!readSession(cookies(req)['__Host-cw_admin']); } catch { ok = false; }
  send(res, 200, { ok });
}

// ---------------- leads ----------------
async function leads(req, res, u) {
  if (req.method === 'GET') {
    const status = u.searchParams.get('status') || '';
    const term = str(u.searchParams.get('q'), 100);
    const like = term ? `%${term.replace(/[\\%_]/g, (c) => '\\' + c)}%` : null;
    const rows = await q`select id, created_at, name, email, message, status, notes, updated_at from leads
      where (${status} = '' or status = ${status})
        and (${like}::text is null or name ilike ${like} or email ilike ${like} or message ilike ${like})
      order by created_at desc limit 500`;
    const counts = await q`select status, count(*)::int as n from leads group by status`;
    return send(res, 200, { ok: true, leads: rows, counts: Object.fromEntries(counts.map((c) => [c.status, c.n])) });
  }
  checkOrigin(req);
  const body = await readJson(req);
  const leadId = id(body.id);
  if (req.method === 'PATCH') {
    const status = body.status == null ? null : String(body.status);
    if (status != null && !STATUSES.includes(status)) throw new HttpError(400, 'Invalid status');
    const notes = body.notes == null ? null : str(body.notes, 5000, { multiline: true });
    const [row] = await q`update leads set status = coalesce(${status}, status), notes = coalesce(${notes}, notes), updated_at = now() where id = ${leadId} returning id, status, notes, updated_at`;
    if (!row) throw new HttpError(404, 'Lead not found');
    return send(res, 200, { ok: true, lead: row });
  }
  if (req.method === 'DELETE') {
    await q`delete from leads where id = ${leadId}`;
    return send(res, 200, { ok: true });
  }
  throw new HttpError(405, 'Method not allowed');
}

async function leadsExport(req, res) {
  const rows = await q`select id, created_at, name, email, status, notes, message from leads order by created_at desc`;
  // spreadsheet-safe CSV: quote everything, and neutralise leading = + - @ (formula injection)
  const cell = (v) => { let s = v instanceof Date ? v.toISOString() : String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  const csv = ['id,created_at,name,email,status,notes,message', ...rows.map((r) => [r.id, r.created_at, r.name, r.email, r.status, r.notes, r.message].map(cell).join(','))].join('\r\n');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="craftware-leads-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.setHeader('Cache-Control', 'no-store');
  res.end('﻿' + csv);
}

// ---------------- projects ----------------
function projectFields(b, partial) {
  const f = {};
  const has = (k) => !partial || Object.prototype.hasOwnProperty.call(b, k);
  if (has('title')) { f.title = str(b.title, 120); if (!f.title) throw new HttpError(400, 'Title is required.'); }
  if (has('description')) f.description = str(b.description, 1200, { multiline: true });
  if (has('tags')) f.tags = list(b.tags, 12, 40);
  if (has('categories')) { f.categories = list(b.categories, 3, 20).filter((c) => CATS.includes(c)); if (!f.categories.length) f.categories = ['web']; }
  if (has('live_url')) f.live_url = url(b.live_url, 'Live link');
  if (has('image_url')) f.image_url = url(b.image_url, 'Preview image', !partial);
  if (has('image_alt')) f.image_alt = str(b.image_alt, 160);
  if (has('image_full_url')) f.image_full_url = url(b.image_full_url, 'Tall preview image') || null;
  if (has('pan_seconds')) f.pan_seconds = b.pan_seconds === '' || b.pan_seconds == null ? null : Math.min(12, Math.max(1, Number(b.pan_seconds) || 4));
  // new projects are visible + featured unless told otherwise
  const defaults = { featured: true, visible: true, in_clients: false };
  for (const k of ['featured', 'visible', 'in_clients']) if (has(k)) f[k] = b[k] === undefined ? defaults[k] : bool(b[k]);
  for (const [k, m] of [['client_name', 80], ['client_tagline', 120], ['client_deliverables', 160]]) if (has(k)) f[k] = str(b[k], m);
  return f;
}
async function projects(req, res) {
  if (req.method === 'GET') return send(res, 200, { ok: true, projects: await q`select * from projects order by position, id` });
  checkOrigin(req);
  const body = await readJson(req);
  if (req.method === 'POST') {
    const f = projectFields(body, false);
    const [{ p }] = await q`select coalesce(max(position), -1) + 1 as p from projects`;
    const [row] = await q`insert into projects (position, title, description, tags, categories, live_url, image_url, image_alt, image_full_url, pan_seconds, featured, visible, in_clients, client_name, client_tagline, client_deliverables)
      values (${p}, ${f.title}, ${f.description || ''}, ${f.tags || []}, ${f.categories || ['web']}, ${f.live_url || ''}, ${f.image_url}, ${f.image_alt || ''}, ${f.image_full_url || null}, ${f.pan_seconds ?? null}, ${f.featured ?? true}, ${f.visible ?? true}, ${f.in_clients ?? false}, ${f.client_name || ''}, ${f.client_tagline || ''}, ${f.client_deliverables || ''})
      returning *`;
    await touchContent();
    return send(res, 200, { ok: true, project: row });
  }
  const pid = id(body.id);
  if (req.method === 'PATCH') {
    const f = projectFields(body, true);
    const has = (k) => Object.prototype.hasOwnProperty.call(f, k);
    const v = (k) => (has(k) ? f[k] : null);
    const [row] = await q`update projects set
        title = coalesce(${v('title')}, title), description = coalesce(${v('description')}, description),
        tags = coalesce(${v('tags')}::text[], tags), categories = coalesce(${v('categories')}::text[], categories),
        live_url = coalesce(${v('live_url')}, live_url), image_url = coalesce(${v('image_url')}, image_url), image_alt = coalesce(${v('image_alt')}, image_alt),
        image_full_url = case when ${has('image_full_url')} then ${v('image_full_url')} else image_full_url end,
        pan_seconds = case when ${has('pan_seconds')} then ${v('pan_seconds')}::real else pan_seconds end,
        featured = coalesce(${v('featured')}, featured), visible = coalesce(${v('visible')}, visible), in_clients = coalesce(${v('in_clients')}, in_clients),
        client_name = coalesce(${v('client_name')}, client_name), client_tagline = coalesce(${v('client_tagline')}, client_tagline),
        client_deliverables = coalesce(${v('client_deliverables')}, client_deliverables), updated_at = now()
      where id = ${pid} returning *`;
    if (!row) throw new HttpError(404, 'Project not found');
    await touchContent();
    return send(res, 200, { ok: true, project: row });
  }
  if (req.method === 'DELETE') {
    await q`delete from projects where id = ${pid}`;
    await touchContent();
    return send(res, 200, { ok: true });
  }
  throw new HttpError(405, 'Method not allowed');
}

async function reorder(req, res, table) {
  checkOrigin(req);
  const { ids } = await readJson(req);
  if (!Array.isArray(ids) || ids.length > 200) throw new HttpError(400, 'Invalid order');
  const clean = ids.map(id);
  const pos = clean.map((_, i) => i);
  if (table === 'projects') await q`update projects p set position = x.pos from unnest(${clean}::bigint[], ${pos}::int[]) as x(id, pos) where p.id = x.id`;
  else await q`update testimonials t set position = x.pos from unnest(${clean}::bigint[], ${pos}::int[]) as x(id, pos) where t.id = x.id`;
  await touchContent();
  send(res, 200, { ok: true });
}

// ---------------- numbers band ----------------
async function stats(req, res) {
  if (req.method === 'GET') return send(res, 200, { ok: true, stats: await q`select * from stats order by position, key` });
  if (req.method !== 'PUT') throw new HttpError(405, 'Method not allowed');
  checkOrigin(req);
  const { stats: items } = await readJson(req);
  if (!Array.isArray(items) || !items.length || items.length > 6) throw new HttpError(400, 'Invalid numbers');
  for (const [i, s] of items.entries()) {
    const key = str(s.key, 30).replace(/[^a-z0-9_-]/gi, '') || `stat${i}`;
    const auto = s.auto === 'projects' ? 'projects' : null;
    const value = Math.max(0, Math.min(1000000, Math.round(Number(s.value) || 0)));
    const label = str(s.label, 80, { multiline: true });
    if (!label) throw new HttpError(400, 'Every number needs a label.');
    await q`insert into stats (key, position, value, suffix, label, auto) values (${key}, ${i}, ${value}, ${str(s.suffix, 4)}, ${label}, ${auto})
      on conflict (key) do update set position = excluded.position, value = excluded.value, suffix = excluded.suffix, label = excluded.label, auto = excluded.auto`;
  }
  const keep = items.map((s, i) => str(s.key, 30).replace(/[^a-z0-9_-]/gi, '') || `stat${i}`);
  await q`delete from stats where not (key = any(${keep}::text[]))`;
  await touchContent();
  send(res, 200, { ok: true, stats: await q`select * from stats order by position, key` });
}

// ---------------- testimonials ----------------
async function testimonials(req, res) {
  if (req.method === 'GET') return send(res, 200, { ok: true, testimonials: await q`select * from testimonials order by position, id` });
  checkOrigin(req);
  const b = await readJson(req);
  const fields = () => {
    const quote = str(b.quote, 600, { multiline: true }), name = str(b.name, 80);
    if (!quote || !name) throw new HttpError(400, 'A quote and the client’s name are required.');
    return { quote, name, role: str(b.role, 80), business: str(b.business, 100), visible: b.visible == null ? true : bool(b.visible) };
  };
  if (req.method === 'POST') {
    const f = fields();
    const [{ p }] = await q`select coalesce(max(position), -1) + 1 as p from testimonials`;
    const [row] = await q`insert into testimonials (position, quote, name, role, business, visible) values (${p}, ${f.quote}, ${f.name}, ${f.role}, ${f.business}, ${f.visible}) returning *`;
    await touchContent();
    return send(res, 200, { ok: true, testimonial: row });
  }
  const tid = id(b.id);
  if (req.method === 'PATCH') {
    const f = fields();
    const [row] = await q`update testimonials set quote = ${f.quote}, name = ${f.name}, role = ${f.role}, business = ${f.business}, visible = ${f.visible}, updated_at = now() where id = ${tid} returning *`;
    if (!row) throw new HttpError(404, 'Testimonial not found');
    await touchContent();
    return send(res, 200, { ok: true, testimonial: row });
  }
  if (req.method === 'DELETE') { await q`delete from testimonials where id = ${tid}`; await touchContent(); return send(res, 200, { ok: true }); }
  throw new HttpError(405, 'Method not allowed');
}

// ---------------- images + publishing ----------------
async function upload(req, res) {
  checkOrigin(req);
  const { dataUrl, name } = await readJson(req, 4.3 * 1024 * 1024);
  send(res, 200, { ok: true, url: await storeImage(dataUrl, name) });
}

async function publish(req, res) {
  const status = async () => {
    const changed = await getMeta('content_changed_at'), published = await getMeta('published_at');
    return { changed, published, pending: !!changed && (!published || changed > published), configured: !!process.env.DEPLOY_HOOK_URL };
  };
  if (req.method === 'GET') return send(res, 200, { ok: true, ...(await status()) });
  checkOrigin(req);
  const hook = process.env.DEPLOY_HOOK_URL;
  if (!hook) throw new HttpError(503, 'Publishing is not configured yet (DEPLOY_HOOK_URL).');
  const last = await getMeta('publish_requested_at');
  if (last && Date.now() - Date.parse(last) < 30000) throw new HttpError(429, 'A publish is already on its way — give it a minute.');
  const r = await fetch(hook, { method: 'POST' });
  if (!r.ok) throw new HttpError(502, 'Vercel did not accept the publish request. Try again in a minute.');
  const now = new Date().toISOString();
  await setMeta('publish_requested_at', now);
  await setMeta('published_at', now);
  send(res, 200, { ok: true, ...(await status()) });
}

const ROUTES = {
  login: { POST: login, open: true },
  logout: { POST: logout, open: true },
  session: { GET: session, open: true },
  leads: { GET: leads, PATCH: leads, DELETE: leads },
  'leads-export': { GET: leadsExport },
  projects: { GET: projects, POST: projects, PATCH: projects, DELETE: projects },
  'projects-order': { POST: (req, res) => reorder(req, res, 'projects') },
  stats: { GET: stats, PUT: stats },
  testimonials: { GET: testimonials, POST: testimonials, PATCH: testimonials, DELETE: testimonials },
  'testimonials-order': { POST: (req, res) => reorder(req, res, 'testimonials') },
  upload: { POST: upload },
  publish: { GET: publish, POST: publish },
};

export default async function handler(req, res) {
  try {
    const u = new URL(req.url, 'http://local');
    const action = (req.query && req.query.action) || u.pathname.split('/').filter(Boolean).pop();
    const route = ROUTES[action];
    if (!route) throw new HttpError(404, 'Not found');
    const fn = route[req.method];
    if (!fn) { res.setHeader('Allow', Object.keys(route).filter((k) => k !== 'open').join(', ')); throw new HttpError(405, 'Method not allowed'); }
    if (!route.open) { requireAdmin(req); await ensureReady(); }
    await fn(req, res, u);
  } catch (err) { fail(res, err); }
}
