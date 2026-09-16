const { supabaseFetch } = require('./_supabase');
const { checkAdminPassword } = require('./_auth');

module.exports = async (req, res) => {
  if (!checkAdminPassword(req)) {
    return res.status(401).json({ error: 'Invalid admin password.' });
  }

  if (req.method === 'GET') {
    const status = String(req.query.status || 'pending');
    const filter = status === 'all' ? '' : `&status=eq.${encodeURIComponent(status)}`;
    try {
      const rows = await supabaseFetch(
        `reviews?select=id,name,role,rating,quote,status,created_at&order=created_at.desc${filter}`
      );
      return res.status(200).json(rows || []);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not load reviews.' });
    }
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};
    const { id, action } = body;
    if (!id || !['approve', 'reject', 'pending'].includes(action)) {
      return res.status(400).json({ error: 'id and a valid action are required.' });
    }
    const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';
    try {
      await supabaseFetch(`reviews?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status }),
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not update review.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
