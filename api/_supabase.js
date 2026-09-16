// Shared helper for talking to the Supabase REST API from serverless
// functions. Uses the service-role key, which must never be sent to the
// browser — every call in this folder happens server-side only.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function supabaseFetch(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase env vars are not configured');
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase request failed (${res.status}): ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

module.exports = { supabaseFetch };
