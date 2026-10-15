// /api/admin/:action — everything the admin panel does, behind one shared
// password. One function file on purpose (Vercel's Hobby plan caps a
// project at 12 functions). Every action except login/logout/session
// requires a valid session cookie; every write also requires our Origin.
import { send, sendCsv, fail, readJson, str, HttpError } from '../../lib/http.js';
import { verifyPassword, createSession, sessionCookie, clearCookie, requireAdmin, readSession, cookies, checkOrigin, ipHash } from '../../lib/auth.js';
import { q, ensureReady, touchContent, getMeta, setMeta, ledgerGuardOn } from '../../lib/db.js';
import { safeUrl } from '../../lib/render.js';
import { storeImage, readImage, isUploadRef } from '../../lib/storage.js';
import {
  PEOPLE, KINDS, CATEGORIES, METHODS, receiptsEnabled, actorOf, txnFields, changedFields,
  periodRange, txnRow, istString, rupees,
} from '../../lib/expenses.js';

const STATUSES = ['new', 'contacted', 'won', 'lost', 'spam'];
const CATS = ['web', 'branding', 'marketing'];
const id = (v) => { const n = Number(v); if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, 'Invalid id'); return n; };
const bool = (v) => v === true || v === 'true';
const list = (v, max, itemMax) => (Array.isArray(v) ? v : String(v || '').split(',')).map((x) => str(x, itemMax)).filter(Boolean).slice(0, max);
const url = (v, label, required = false, allowUpload = false) => {
  const s = str(v, 500);
  if (!s) { if (required) throw new HttpError(400, `${label} is required.`); return ''; }
  if (allowUpload && isUploadRef(s)) return s;
  if (!safeUrl(s)) throw new HttpError(400, `${label} must be an https:// link${allowUpload ? ' or an uploaded image' : ''}.`);
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
  sendCsv(res, `craftware-leads-${new Date().toISOString().slice(0, 10)}.csv`,
    ['id', 'created_at', 'name', 'email', 'status', 'notes', 'message'],
    rows.map((r) => [r.id, r.created_at, r.name, r.email, r.status, r.notes, r.message]));
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
  if (has('image_url')) f.image_url = url(b.image_url, 'Preview image', !partial, true);
  if (has('image_alt')) f.image_alt = str(b.image_alt, 160);
  if (has('image_full_url')) f.image_full_url = url(b.image_full_url, 'Tall preview image', false, true) || null;
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

// ---------------- expense ledger ----------------
// Private bookkeeping for the three founders — never touches the public site
// (no touchContent/Publish). Every write names who made it (`actor`), and is
// recorded with a full before/after snapshot in the same SQL statement, so a
// change can't land without its history row.
function ledgerFilter(sp) {
  const [from, to] = periodRange(sp.get('period'));
  const pick = (v, allowed) => (allowed.includes(v) ? v : '');
  const term = str(sp.get('q'), 100);
  return {
    from, to,
    kind: pick(sp.get('kind'), KINDS),
    person: pick(sp.get('person'), PEOPLE),
    category: pick(sp.get('category'), [...CATEGORIES.debit, ...CATEGORIES.credit]),
    method: pick(sp.get('method'), METHODS),
    like: term ? `%${term.replace(/[\\%_]/g, (c) => '\\' + c)}%` : null,
    deleted: sp.get('deleted') === '1',
  };
}
function ledgerRows(f, limit) {
  return q`select * from transactions
    where (case when ${f.deleted}::boolean then deleted_at is not null else deleted_at is null end)
      and (${f.from}::timestamptz is null or occurred_at >= ${f.from}::timestamptz)
      and (${f.to}::timestamptz is null or occurred_at < ${f.to}::timestamptz)
      and (${f.kind} = '' or kind = ${f.kind}) and (${f.person} = '' or person = ${f.person})
      and (${f.category} = '' or category = ${f.category}) and (${f.method} = '' or method = ${f.method})
      and (${f.like}::text is null or description ilike ${f.like} or category ilike ${f.like})
    order by occurred_at desc, id desc limit ${limit}`;
}
const histRow = (h) => ({
  id: Number(h.id), txn_id: Number(h.txn_id), version: Number(h.version), action: h.action, actor: h.actor, at: h.at,
  reason: h.reason, user_agent: h.user_agent || '', before: h.before, after: h.after,
  changed: h.action === 'edited' ? changedFields(h.before, h.after) : [],
});

async function transactions(req, res, u) {
  if (req.method === 'GET') {
    const f = ledgerFilter(u.searchParams);
    const rows = await ledgerRows(f, 2001);
    // totals for exactly what's being looked at (deleted entries never count)
    const groups = await q`select kind, category, person, sum(amount_paise)::float8 as total, count(*)::int as n from transactions
      where deleted_at is null
        and (${f.from}::timestamptz is null or occurred_at >= ${f.from}::timestamptz)
        and (${f.to}::timestamptz is null or occurred_at < ${f.to}::timestamptz)
        and (${f.kind} = '' or kind = ${f.kind}) and (${f.person} = '' or person = ${f.person})
        and (${f.category} = '' or category = ${f.category}) and (${f.method} = '' or method = ${f.method})
        and (${f.like}::text is null or description ilike ${f.like} or category ilike ${f.like})
      group by kind, category, person`;
    const [all] = await q`select
        coalesce(sum(case when kind = 'credit' then amount_paise else -amount_paise end) filter (where deleted_at is null), 0)::float8 as balance,
        count(*) filter (where deleted_at is null)::int as live, count(*) filter (where deleted_at is not null)::int as deleted
      from transactions`;
    const months = await q`select distinct to_char((occurred_at at time zone 'UTC') + interval '330 minutes', 'YYYY-MM') as m
      from transactions where deleted_at is null order by m desc`;
    return send(res, 200, {
      ok: true, transactions: rows.slice(0, 2000).map(txnRow), truncated: rows.length > 2000,
      groups: groups.map((g) => ({ ...g, total: Number(g.total), n: Number(g.n) })),
      balance: Number(all.balance), live: Number(all.live), deletedCount: Number(all.deleted), months: months.map((r) => r.m),
      meta: { people: PEOPLE, categories: CATEGORIES, methods: METHODS, receipts: receiptsEnabled(), guard: ledgerGuardOn() },
    });
  }
  checkOrigin(req);
  const b = await readJson(req, 16 * 1024);
  const actor = actorOf(b.actor);
  const ip = ipHash(req), ua = str(req.headers['user-agent'], 300);

  if (req.method === 'POST') {
    const f = txnFields(b);
    const [row] = await q`with ins as (
        insert into transactions (kind, amount_paise, occurred_at, person, category, method, description, receipt_ref, created_by, updated_by)
        values (${f.kind}, ${f.amount_paise}, ${f.occurred_at}, ${f.person}, ${f.category}, ${f.method}, ${f.description}, ${f.receipt_ref}, ${actor}, ${actor})
        returning *),
      h as (insert into transaction_history (txn_id, version, action, actor, ip_hash, user_agent, after)
        select id, version, 'created', ${actor}, ${ip}, ${ua}, to_jsonb(ins) from ins)
      select * from ins`;
    return send(res, 200, { ok: true, transaction: txnRow(row) });
  }

  const tid = id(b.id);
  const [cur] = await q`select * from transactions where id = ${tid}`;
  if (!cur) throw new HttpError(404, 'Transaction not found');
  // someone else saved since this person opened it: don't silently overwrite
  if (b.version != null && Number(b.version) !== Number(cur.version)) {
    throw new HttpError(409, `${cur.updated_by || 'Someone'} changed this transaction since you opened it — close it and open it again to see their change.`);
  }
  const reason = str(b.reason, 300);

  if (req.method === 'PATCH') {
    if (cur.deleted_at) throw new HttpError(409, 'This transaction is deleted — restore it before editing.');
    const f = txnFields(b, cur.receipt_ref);
    if (!changedFields(cur, f).length) return send(res, 200, { ok: true, transaction: txnRow(cur), unchanged: true });
    const [row] = await q`with prev as (select * from transactions where id = ${tid} and deleted_at is null and version = ${cur.version} for update),
      upd as (update transactions t set kind = ${f.kind}, amount_paise = ${f.amount_paise}, occurred_at = ${f.occurred_at},
          person = ${f.person}, category = ${f.category}, method = ${f.method}, description = ${f.description}, receipt_ref = ${f.receipt_ref},
          version = t.version + 1, updated_at = now(), updated_by = ${actor}
        from prev where t.id = prev.id returning t.*),
      h as (insert into transaction_history (txn_id, version, action, actor, ip_hash, user_agent, reason, before, after)
        select upd.id, upd.version, 'edited', ${actor}, ${ip}, ${ua}, ${reason}, to_jsonb(prev), to_jsonb(upd) from prev, upd)
      select * from upd`;
    if (!row) throw new HttpError(409, 'This transaction changed while you were editing — open it again and redo your change.');
    return send(res, 200, { ok: true, transaction: txnRow(row) });
  }

  if (req.method === 'DELETE') {
    if (cur.deleted_at) throw new HttpError(409, 'This transaction is already deleted.');
    if (reason.length < 3) throw new HttpError(400, 'Say why it’s being deleted — the reason is kept in the history.');
    const [row] = await q`with prev as (select * from transactions where id = ${tid} and deleted_at is null and version = ${cur.version} for update),
      upd as (update transactions t set deleted_at = now(), deleted_by = ${actor}, version = t.version + 1, updated_at = now(), updated_by = ${actor}
        from prev where t.id = prev.id returning t.*),
      h as (insert into transaction_history (txn_id, version, action, actor, ip_hash, user_agent, reason, before, after)
        select upd.id, upd.version, 'deleted', ${actor}, ${ip}, ${ua}, ${reason}, to_jsonb(prev), to_jsonb(upd) from prev, upd)
      select * from upd`;
    if (!row) throw new HttpError(409, 'This transaction changed a moment ago — reload and try again.');
    return send(res, 200, { ok: true, transaction: txnRow(row) });
  }
  throw new HttpError(405, 'Method not allowed');
}

async function transactionsRestore(req, res) {
  checkOrigin(req);
  const b = await readJson(req, 16 * 1024);
  const actor = actorOf(b.actor), tid = id(b.id);
  const ip = ipHash(req), ua = str(req.headers['user-agent'], 300);
  const [row] = await q`with prev as (select * from transactions where id = ${tid} and deleted_at is not null for update),
    upd as (update transactions t set deleted_at = null, deleted_by = null, version = t.version + 1, updated_at = now(), updated_by = ${actor}
      from prev where t.id = prev.id returning t.*),
    h as (insert into transaction_history (txn_id, version, action, actor, ip_hash, user_agent, reason, before, after)
      select upd.id, upd.version, 'restored', ${actor}, ${ip}, ${ua}, ${str(b.reason, 300)}, to_jsonb(prev), to_jsonb(upd) from prev, upd)
    select * from upd`;
  if (!row) throw new HttpError(404, 'No deleted transaction with that id.');
  send(res, 200, { ok: true, transaction: txnRow(row) });
}

// one transaction's full history (?id=), or the latest activity across all
async function transactionsHistory(req, res, u) {
  const raw = u.searchParams.get('id');
  const rows = raw
    ? await q`select * from transaction_history where txn_id = ${id(raw)} order by id`
    : await q`select * from transaction_history order by id desc limit 300`;
  send(res, 200, { ok: true, history: rows.map(histRow) });
}

async function transactionsExport(req, res, u) {
  const day = new Date().toISOString().slice(0, 10);
  const money = (paise, sign = 1) => sign * Number(rupees(paise));
  if (u.searchParams.get('audit') === '1') {
    const rows = await q`select * from transaction_history order by id`;
    return sendCsv(res, `craftware-ledger-history-${day}.csv`,
      ['history_id', 'when_ist', 'transaction_id', 'version', 'action', 'by', 'reason', 'fields_changed', 'device', 'ip_hash', 'before', 'after'],
      rows.map((h) => [Number(h.id), istString(h.at), Number(h.txn_id), Number(h.version), h.action, h.actor, h.reason,
        h.action === 'edited' ? changedFields(h.before, h.after).join(' ') : '', h.user_agent || '', h.ip_hash || '',
        h.before ? JSON.stringify(h.before) : '', h.after ? JSON.stringify(h.after) : '']));
  }
  const rows = (await ledgerRows(ledgerFilter(u.searchParams), 100000)).map(txnRow);
  sendCsv(res, `craftware-ledger-${day}.csv`,
    ['id', 'date_ist', 'type', 'amount_inr', 'signed_inr', 'person', 'category', 'payment_method', 'description',
      'added_by', 'added_at_ist', 'last_changed_by', 'last_changed_at_ist', 'version', 'deleted_by', 'deleted_at_ist', 'receipt'],
    rows.map((r) => [r.id, istString(r.occurred_at), r.kind === 'credit' ? 'Money in' : 'Money out', money(r.amount_paise),
      money(r.amount_paise, r.kind === 'credit' ? 1 : -1), r.person, r.category, r.method, r.description,
      r.created_by, istString(r.created_at), r.updated_by, istString(r.updated_at), r.version,
      r.deleted_by || '', istString(r.deleted_at), r.receipt_ref ? 'yes' : '']));
}

// ---------------- images + publishing ----------------
async function upload(req, res) {
  checkOrigin(req);
  const { dataUrl, name, folder } = await readJson(req, 4.3 * 1024 * 1024);
  if (folder === 'receipts' && !receiptsEnabled()) throw new HttpError(403, 'Receipt photos are switched off.');
  send(res, 200, { ok: true, url: await storeImage(dataUrl, name, folder === 'receipts' ? 'receipts' : 'work') });
}

// admin-only view of a privately stored upload (the public site gets its own
// copy at build time)
async function image(req, res, u) {
  const { buf, type } = await readImage('upload:' + (u.searchParams.get('ref') || ''));
  res.statusCode = 200;
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(buf);
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
  transactions: { GET: transactions, POST: transactions, PATCH: transactions, DELETE: transactions },
  'transactions-restore': { POST: transactionsRestore },
  'transactions-history': { GET: transactionsHistory },
  'transactions-export': { GET: transactionsExport },
  upload: { POST: upload },
  image: { GET: image },
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
