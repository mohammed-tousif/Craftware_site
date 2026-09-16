const { supabaseFetch } = require('./_supabase');
const { checkAdminPassword } = require('./_auth');

module.exports = async (req, res) => {
  if (!checkAdminPassword(req)) {
    return res.status(401).json({ error: 'Invalid admin password.' });
  }

  if (req.method === 'GET') {
    try {
      const rows = await supabaseFetch(
        'works?select=id,title,description,categories,tags,image_url,site_url,display_order,created_at&order=display_order.asc,created_at.asc'
      );
      return res.status(200).json(rows || []);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not load work items.' });
    }
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};
    const { action, id } = body;

    if (action === 'delete') {
      if (!id) return res.status(400).json({ error: 'id is required.' });
      try {
        await supabaseFetch(`works?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { Prefer: 'return=minimal' },
        });
        return res.status(200).json({ ok: true });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Could not delete work item.' });
      }
    }

    if (action === 'create' || action === 'update') {
      const title = String(body.title || '').trim().slice(0, 120);
      const description = String(body.description || '').trim().slice(0, 800);
      const categories = String(body.categories || 'web').trim().toLowerCase().slice(0, 100);
      const tags = String(body.tags || '').trim().slice(0, 200);
      const image_url = String(body.image_url || '').trim().slice(0, 500);
      const site_url = String(body.site_url || '').trim().slice(0, 500);
      const display_order = Number.isFinite(Number(body.display_order)) ? Number(body.display_order) : 0;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
      }

      const record = { title, description, categories, tags, image_url, site_url, display_order };

      try {
        if (action === 'create') {
          await supabaseFetch('works', {
            method: 'POST',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify([record]),
          });
        } else {
          if (!id) return res.status(400).json({ error: 'id is required for update.' });
          await supabaseFetch(`works?id=eq.${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify(record),
          });
        }
        return res.status(200).json({ ok: true });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Could not save work item.' });
      }
    }

    return res.status(400).json({ error: 'Unknown action.' });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
