// New-lead email via Resend's HTTP API. Failures are logged, never thrown:
// the lead is already saved in the database by the time this runs.
import { esc } from './render.js';

export async function notifyLead(lead) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn('RESEND_API_KEY not set — lead saved, no email sent'); return false; }
  const to = process.env.LEAD_NOTIFY_TO || 'craftwaretech@gmail.com';
  // onboarding@resend.dev works before the domain is verified (it can only
  // deliver to the Resend account's own address); switch LEAD_FROM to
  // e.g. "CraftWare <hello@craftware.co.in>" once craftware.co.in is verified
  const from = process.env.LEAD_FROM || 'CraftWare Website <onboarding@resend.dev>';
  const site = process.env.SITE_URL || 'https://craftware.co.in';
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;color:#0a0d15">
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#2f7fa3;margin:0 0 6px">New enquiry · craftware.co.in</p>
    <h2 style="margin:0 0 16px;font-size:22px">${esc(lead.name)}</h2>
    <p style="margin:0 0 4px"><b>Email:</b> <a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a></p>
    <p style="margin:0 0 16px;color:#555">${esc(new Date(lead.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))} IST</p>
    <div style="white-space:pre-wrap;background:#f2ede2;border-radius:10px;padding:16px;line-height:1.55">${esc(lead.message)}</div>
    <p style="margin:18px 0 0"><a href="${esc(site)}/admin" style="background:#ffcd3c;color:#0a0d15;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:bold">Open in CraftWare Admin</a></p>
    <p style="font-size:12px;color:#777;margin-top:18px">Reply to this email to answer ${esc(lead.name)} directly.</p>
  </div>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: lead.email, subject: `New enquiry from ${lead.name}`, html,
        text: `New enquiry from ${lead.name} <${lead.email}>\n\n${lead.message}\n\n${site}/admin` }),
    });
    if (!res.ok) { console.error('Resend error', res.status, await res.text().catch(() => '')); return false; }
    return true;
  } catch (e) { console.error('Resend request failed', e); return false; }
}
