const { supabaseFetch } = require('./_supabase');

// Public endpoint: the homepage fetches this on load to fill in the
// contact card (email / phone / location) so it can be changed from
// /admin without editing the HTML.
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rows = await supabaseFetch('site_settings?id=eq.1&select=email,phone,location');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json((rows && rows[0]) || {});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load settings.' });
  }
};
