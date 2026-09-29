// Shared-password admin auth. The password itself is never stored anywhere:
// ADMIN_PASSWORD_HASH holds a scrypt hash (made by scripts/setup-admin.mjs),
// and a successful login gets a signed, expiring, HttpOnly session cookie.
import crypto from 'node:crypto';
import { HttpError } from './http.js';

const COOKIE = '__Host-cw_admin';
const SESSION_HOURS = 12;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new HttpError(503, 'Admin is not configured yet (SESSION_SECRET).');
  return s;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const N = 16384, r = 8, p = 1;
  const key = crypto.scryptSync(password, salt, 64, { N, r, p, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, N, r, p, saltB64, keyB64] = parts;
  const expected = Buffer.from(keyB64, 'base64');
  const got = crypto.scryptSync(String(password), Buffer.from(saltB64, 'base64'), expected.length, { N: +N, r: +r, p: +p, maxmem: 64 * 1024 * 1024 });
  return got.length === expected.length && crypto.timingSafeEqual(got, expected);
}

const b64u = (buf) => Buffer.from(buf).toString('base64url');
function sign(payload) { return crypto.createHmac('sha256', secret()).update(payload).digest('base64url'); }

export function createSession() {
  const payload = b64u(JSON.stringify({ v: 1, exp: Date.now() + SESSION_HOURS * 3600 * 1000 }));
  return `${payload}.${sign(payload)}`;
}
export function readSession(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, mac] = token.split('.');
  const good = sign(payload);
  if (mac.length !== good.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(good))) return null;
  try { const data = JSON.parse(Buffer.from(payload, 'base64url').toString()); return data.exp > Date.now() ? data : null; } catch { return null; }
}

export function cookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
export const sessionCookie = (token) => `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}`;
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export function requireAdmin(req) {
  if (!readSession(cookies(req)[COOKIE])) throw new HttpError(401, 'Please sign in again.');
}

// state-changing requests must come from our own pages (SameSite=Strict
// already blocks cross-site cookies; this is belt and braces)
export function checkOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) throw new HttpError(403, 'Forbidden');
  let host;
  try { host = new URL(origin).host; } catch { throw new HttpError(403, 'Forbidden'); }
  if (host !== req.headers.host) throw new HttpError(403, 'Forbidden');
}

export function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || String(req.headers['x-real-ip'] || '') || req.socket?.remoteAddress || 'unknown';
}
// IPs are only ever stored hashed (for rate limiting), never in the clear
export function ipHash(req) {
  const salt = process.env.SESSION_SECRET || 'cw';
  return crypto.createHash('sha256').update(salt + '|' + clientIp(req)).digest('hex').slice(0, 32);
}
