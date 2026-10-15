// Expense ledger rules shared by the admin API: who can be named, the fixed
// category / payment-method lists, and validation. Money is always handled
// as integer paise (₹1 = 100) so totals never pick up floating-point drift.
import { HttpError, str } from './http.js';
import { isReceiptRef } from './storage.js';

export const PEOPLE = ['Nisar', 'Tousif', 'Mahir'];
export const KINDS = ['debit', 'credit'];
export const CATEGORIES = {
  debit: [
    'Hosting & domains', 'Software & subscriptions', 'Ad spend', 'Freelancers & contractors',
    'Salaries & payouts', 'Office & equipment', 'Travel & food', 'Marketing & printing',
    'Taxes & government fees', 'Bank & payment charges', 'Refund to client', 'Other',
  ],
  credit: ['Client payment', 'Advance payment', 'Founder contribution', 'Refund received', 'Other'],
};
export const METHODS = ['UPI', 'Cash', 'Bank transfer', 'Card', 'Cheque', 'Other'];

// Receipt photos are fully built but switched off until EXPENSE_RECEIPTS=on
// is set in Vercel (Production) — no code change needed to turn them on.
export const receiptsEnabled = () => process.env.EXPENSE_RECEIPTS === 'on';

const MAX_PAISE = 10_00_00_000 * 100; // ₹10 crore per entry: a typo guard, not a business rule
const EARLIEST = Date.parse('2020-01-01T00:00:00+05:30');
const IST_MS = 330 * 60 * 1000; // India has no daylight saving: always UTC+05:30

export function actorOf(v) {
  const s = str(v, 20);
  if (!PEOPLE.includes(s)) throw new HttpError(400, 'Choose who is making this change (Nisar, Tousif or Mahir).');
  return s;
}

// "1,250.50" / "₹ 1250" / 1250.5 → paise, without ever going through a float
export function parsePaise(v) {
  const s = String(v ?? '').replace(/[₹,\s]/g, '');
  const m = /^(\d{1,9})(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) throw new HttpError(400, 'Enter the amount in rupees, e.g. 1250 or 1250.50.');
  const paise = Number(m[1]) * 100 + Number((m[2] || '').padEnd(2, '0'));
  if (paise <= 0) throw new HttpError(400, 'The amount must be more than zero.');
  if (paise > MAX_PAISE) throw new HttpError(400, 'That amount looks too large — check for an extra zero.');
  return paise;
}

// when it happened: defaults to "now" in the admin, can be set to the past,
// never the future (a little slack for clock drift between devices)
export function parseWhen(v, now = Date.now()) {
  const t = Date.parse(String(v || ''));
  if (!Number.isFinite(t)) throw new HttpError(400, 'Choose the date and time of the transaction.');
  if (t > now + 10 * 60 * 1000) throw new HttpError(400, 'The date and time can’t be in the future.');
  if (t < EARLIEST) throw new HttpError(400, 'That date looks wrong — it’s before 2020.');
  return new Date(t).toISOString();
}

// the full validated record from a create/edit body. `currentReceipt` is the
// stored receipt on an edit: while receipts are switched off it is kept as-is
// (so turning the feature off never strips or blocks older entries).
export function txnFields(b, currentReceipt = null) {
  const kind = KINDS.includes(b.kind) ? b.kind : null;
  if (!kind) throw new HttpError(400, 'Choose money in or money out.');
  const person = str(b.person, 20);
  if (!PEOPLE.includes(person)) throw new HttpError(400, 'Choose who paid or received it.');
  const category = str(b.category, 60);
  if (!CATEGORIES[kind].includes(category)) throw new HttpError(400, 'Choose a category.');
  const method = str(b.method, 30);
  if (!METHODS.includes(method)) throw new HttpError(400, 'Choose a payment method.');
  const description = str(b.description, 500, { multiline: true });
  if (description.length < 2) throw new HttpError(400, 'Add a short description: what it was for and where the money went.');
  let receipt_ref = currentReceipt;
  if (receiptsEnabled()) {
    receipt_ref = str(b.receipt, 200) || null;
    if (receipt_ref && !isReceiptRef(receipt_ref)) throw new HttpError(400, 'Invalid receipt image.');
  }
  return { kind, amount_paise: parsePaise(b.amount), occurred_at: parseWhen(b.occurred_at), person, category, method, description, receipt_ref };
}

// the fields a person can change; used to skip no-op edits and to describe changes
export const TRACKED = ['kind', 'amount_paise', 'occurred_at', 'person', 'category', 'method', 'description', 'receipt_ref'];
const norm = (k, v) => (v == null ? null : k === 'amount_paise' ? Number(v) : k === 'occurred_at' ? new Date(v).getTime() : String(v));
export function changedFields(before, after) {
  return TRACKED.filter((k) => norm(k, before?.[k]) !== norm(k, after?.[k]));
}

// period filter → [fromISO, toISO) in India time. '' = all time,
// 'YYYY-MM' = a calendar month, 'FY2026' = financial year Apr 2026–Mar 2027.
export function periodRange(p) {
  const s = String(p || '');
  let m = /^(\d{4})-(\d{2})$/.exec(s);
  if (m) {
    const y = +m[1], mo = +m[2];
    if (mo < 1 || mo > 12) return [null, null];
    return [new Date(Date.UTC(y, mo - 1, 1) - IST_MS).toISOString(), new Date(Date.UTC(y, mo, 1) - IST_MS).toISOString()];
  }
  m = /^FY(\d{4})$/.exec(s);
  if (m) {
    const y = +m[1];
    return [new Date(Date.UTC(y, 3, 1) - IST_MS).toISOString(), new Date(Date.UTC(y + 1, 3, 1) - IST_MS).toISOString()];
  }
  return [null, null];
}

// numbers out of Postgres can arrive as strings (int8) — make them numbers
export const txnRow = (r) => r && ({ ...r, id: Number(r.id), amount_paise: Number(r.amount_paise), version: Number(r.version) });

// "2026-10-15 14:05" in India time, for CSV exports
export function istString(d) {
  if (!d) return '';
  const t = new Date(new Date(d).getTime() + IST_MS);
  return t.toISOString().slice(0, 16).replace('T', ' ');
}
export const rupees = (paise) => (Number(paise) / 100).toFixed(2);
