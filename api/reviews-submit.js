const { supabaseFetch } = require('./_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // honeypot: real visitors never fill this hidden field, bots often do
  if (body.website) {
    return res.status(200).json({ ok: true });
  }

  const name = String(body.name || '').trim().slice(0, 80);
  const role = String(body.role || '').trim().slice(0, 100);
  const quote = String(body.quote || '').trim().slice(0, 600);
  const rating = Number(body.rating);

  if (!name || !quote) {
    return res.status(400).json({ error: 'Name and review text are required.' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  try {
    await supabaseFetch('reviews', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify([{ name, role, quote, rating, status: 'pending' }]),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not save review. Please try again later.' });
  }
};
