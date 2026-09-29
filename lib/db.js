// Postgres access (Neon serverless driver in production). Every query is a
// tagged template, so values are always sent as parameters — never string-
// concatenated into SQL. Tests inject their own driver via globalThis.
import fs from 'node:fs';
import { HttpError } from './http.js';

let driver = null;
export function sql() {
  if (globalThis.__CW_TEST_SQL__) return globalThis.__CW_TEST_SQL__;
  if (driver) return driver;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new HttpError(503, 'The database is not connected yet.');
  return import('@neondatabase/serverless').then(({ neon }) => (driver = neon(url)));
}
// resolve the driver, then run a tagged-template query
export async function q(strings, ...values) {
  const run = await sql();
  return run(strings, ...values);
}

let ready = null;
export function ensureReady() {
  if (!ready) ready = (async () => { await ensureSchema(); await seedIfEmpty(); })().catch((e) => { ready = null; throw e; });
  return ready;
}

async function ensureSchema() {
  await q`create table if not exists leads (
    id bigserial primary key,
    created_at timestamptz not null default now(),
    name text not null, email text not null, message text not null,
    status text not null default 'new', notes text not null default '',
    ip_hash text, user_agent text, updated_at timestamptz not null default now())`;
  await q`create index if not exists leads_created_idx on leads (created_at desc)`;
  await q`create index if not exists leads_ip_idx on leads (ip_hash, created_at desc)`;
  await q`create table if not exists projects (
    id bigserial primary key, position int not null default 0,
    title text not null, description text not null default '',
    tags text[] not null default '{}', categories text[] not null default '{web}',
    live_url text not null default '', image_url text not null default '', image_alt text not null default '',
    image_full_url text, pan_seconds real,
    featured boolean not null default true, visible boolean not null default true,
    in_clients boolean not null default false, client_name text not null default '',
    client_tagline text not null default '', client_deliverables text not null default '',
    updated_at timestamptz not null default now())`;
  await q`create table if not exists stats (
    key text primary key, position int not null default 0,
    value int not null default 0, suffix text not null default '', label text not null default '', auto text)`;
  await q`create table if not exists testimonials (
    id bigserial primary key, position int not null default 0,
    quote text not null, name text not null, role text not null default '', business text not null default '',
    visible boolean not null default true, updated_at timestamptz not null default now())`;
  await q`create table if not exists auth_attempts (ip_hash text not null, at timestamptz not null default now())`;
  await q`create index if not exists auth_attempts_idx on auth_attempts (ip_hash, at desc)`;
  await q`create table if not exists meta (key text primary key, value text not null)`;
}

// first run: import what the site currently shows, so nothing is lost
async function seedIfEmpty() {
  const [{ n }] = await q`select count(*)::int as n from meta where key = 'seeded'`;
  if (n) return;
  const seed = JSON.parse(fs.readFileSync(new URL('../content/seed.json', import.meta.url), 'utf8'));
  let pos = 0;
  for (const p of seed.projects) {
    await q`insert into projects (position, title, description, tags, categories, live_url, image_url, image_alt, image_full_url, pan_seconds, featured, visible, in_clients, client_name, client_tagline, client_deliverables)
      values (${pos++}, ${p.title}, ${p.description}, ${p.tags}, ${p.categories}, ${p.live_url || ''}, ${p.image_url || ''}, ${p.image_alt || ''}, ${p.image_full_url}, ${p.pan_seconds}, ${!!p.featured}, ${p.visible !== false}, ${!!p.in_clients}, ${p.client_name || ''}, ${p.client_tagline || ''}, ${p.client_deliverables || ''})`;
  }
  pos = 0;
  for (const s of seed.stats) {
    await q`insert into stats (key, position, value, suffix, label, auto) values (${s.key}, ${pos++}, ${s.value}, ${s.suffix || ''}, ${s.label}, ${s.auto}) on conflict (key) do nothing`;
  }
  pos = 0;
  for (const t of seed.testimonials || []) {
    await q`insert into testimonials (position, quote, name, role, business, visible) values (${pos++}, ${t.quote}, ${t.name}, ${t.role || ''}, ${t.business || ''}, ${t.visible !== false})`;
  }
  await q`insert into meta (key, value) values ('seeded', ${new Date().toISOString()}) on conflict (key) do nothing`;
}

export async function loadContent() {
  await ensureReady();
  const projects = await q`select * from projects order by position, id`;
  const stats = await q`select * from stats order by position, key`;
  const testimonials = await q`select * from testimonials order by position, id`;
  return { projects, stats, testimonials };
}

export async function touchContent() {
  const now = new Date().toISOString();
  await q`insert into meta (key, value) values ('content_changed_at', ${now}) on conflict (key) do update set value = excluded.value`;
}
export async function getMeta(key) {
  const rows = await q`select value from meta where key = ${key}`;
  return rows[0]?.value || null;
}
export async function setMeta(key, value) {
  await q`insert into meta (key, value) values (${key}, ${value}) on conflict (key) do update set value = excluded.value`;
}
