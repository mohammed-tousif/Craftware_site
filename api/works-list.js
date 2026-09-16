const { supabaseFetch } = require('./_supabase');

// Public endpoint: the homepage's Work section fetches this on load and
// appends a case-study card per row, after the existing hand-built one.
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rows = await supabaseFetch(
      'works?select=id,title,description,categories,tags,image_url,site_url&order=display_order.asc,created_at.asc'
    );
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(rows || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load work items.' });
  }
};
