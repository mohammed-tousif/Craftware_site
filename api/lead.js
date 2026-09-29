// POST /api/lead — the website contact form. Saves the enquiry, then emails
// the team. Spam defences: honeypot field, minimum fill time, per-IP rate
// limit. The form falls back to WhatsApp on any non-OK response.
import { send, fail, readJson, str, isEmail, HttpError } from '../lib/http.js';
import { checkOrigin, ipHash } from '../lib/auth.js';
import { q, ensureReady } from '../lib/db.js';
import { notifyLead } from '../lib/mail.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); throw new HttpError(405, 'Method not allowed'); }
    checkOrigin(req);
    const body = await readJson(req, 16 * 1024);
    // bots: filled the hidden field, or submitted faster than a human can type
    if (body.botcheck || (typeof body.t === 'number' && body.t < 2500)) return send(res, 200, { ok: true });
    const name = str(body.name, 80), email = str(body.email, 120), message = str(body.message, 2000, { multiline: true });
    if (!name) throw new HttpError(400, 'Please tell us your name.');
    if (!isEmail(email)) throw new HttpError(400, 'Please enter a valid email address.');
    if (message.length < 10) throw new HttpError(400, 'A little more detail helps — at least 10 characters.');
    await ensureReady();
    const ip = ipHash(req);
    const [{ n }] = await q`select count(*)::int as n from leads where ip_hash = ${ip} and created_at > now() - interval '10 minutes'`;
    if (n >= 5) throw new HttpError(429, 'You have sent several messages in a row — please reach us on WhatsApp instead.');
    const ua = str(req.headers['user-agent'], 300);
    const [lead] = await q`insert into leads (name, email, message, ip_hash, user_agent) values (${name}, ${email}, ${message}, ${ip}, ${ua}) returning id, created_at, name, email, message`;
    await notifyLead(lead);
    send(res, 200, { ok: true });
  } catch (err) { fail(res, err); }
}
