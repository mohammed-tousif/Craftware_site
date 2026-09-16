const { supabaseFetch } = require('./_supabase');

// Public endpoint: only ever returns approved reviews, and only the fields
// the homepage needs to display them.
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rows = await supabaseFetch(
      'reviews?status=eq.approved&select=id,name,role,rating,quote,created_at&order=created_at.desc&limit=30'
    );
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(rows || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load reviews.' });
  }
};
