const crypto = require('crypto');

// Shared admin-password check, timing-safe. Used by every /api/*-admin
// endpoint. The password itself lives only in the ADMIN_PASSWORD env var
// on Vercel — never in this repo.
function checkAdminPassword(req) {
  const expected = process.env.ADMIN_PASSWORD || '';
  const supplied = req.headers['x-admin-password'] || '';
  if (!expected) return false;
  const a = Buffer.from(String(supplied));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { checkAdminPassword };
