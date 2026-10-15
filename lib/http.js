// Small request/response helpers shared by the API functions (plain Node
// req/res, so they also run under a local test server).

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function send(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

export function fail(res, err) {
  const status = err instanceof HttpError ? err.status : 500;
  if (status >= 500) console.error(err);
  send(res, status, { ok: false, error: status >= 500 && !(err instanceof HttpError) ? 'Something went wrong. Please try again.' : err.message });
}

export async function readJson(req, max = 64 * 1024) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return parse(req.body, max);
  if (Buffer.isBuffer(req.body)) return parse(req.body.toString('utf8'), max);
  const chunks = []; let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > max) throw new HttpError(413, 'Request too large');
    chunks.push(c);
  }
  return parse(Buffer.concat(chunks).toString('utf8'), max);
}
function parse(text, max) {
  if (text.length > max) throw new HttpError(413, 'Request too large');
  if (!text) return {};
  try { const v = JSON.parse(text); return v && typeof v === 'object' ? v : {}; } catch { throw new HttpError(400, 'Invalid JSON'); }
}

// trimmed string with a hard length cap; control characters stripped
export function str(v, max, { multiline = false } = {}) {
  let s = typeof v === 'string' ? v : v == null ? '' : String(v);
  s = s.replace(multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, '').trim();
  return s.length > max ? s.slice(0, max) : s;
}

export const isEmail = (s) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(s);

// spreadsheet-safe CSV: quote everything, and neutralise a leading = + - @
// (formula injection when the file is opened in Excel / Sheets)
export function csvCell(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v); // our own numbers stay numeric (e.g. -1250)
  let s = v instanceof Date ? v.toISOString() : String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
export function sendCsv(res, filename, header, rows) {
  const csv = [header.join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\r\n');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-store');
  res.end('﻿' + csv); // BOM so Excel reads ₹ and names as UTF-8
}
