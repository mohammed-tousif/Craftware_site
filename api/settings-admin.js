const { supabaseFetch } = require('./_supabase');
const { checkAdminPassword } = require('./_auth');

module.exports = async (req, res) => {
  if (!checkAdminPassword(req)) {
    return res.status(401).json({ error: 'Invalid admin password.' });
  }

  if (req.method === 'GET') {
    try {
      const rows = await supabaseFetch('site_settings?id=eq.1&select=email,phone,location');
      return res.status(200).json((rows && rows[0]) || {});
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not load settings.' });
    }
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};

    const update = {};
    if (typeof body.email === 'string') update.email = body.email.trim().slice(0, 120);
    if (typeof body.phone === 'string') update.phone = body.phone.trim().slice(0, 40);
    if (typeof body.location === 'string') update.location = body.location.trim().slice(0, 120);

    if (!Object.keys(update).length) {
      return res.status(400).json({ error: 'Nothing to update.' });
    }

    try {
      await supabaseFetch('site_settings?id=eq.1', {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(update),
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not save settings.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
