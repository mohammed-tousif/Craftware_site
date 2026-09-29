// Renders the CMS-managed regions of craftware-design-v2.html from content
// data (database or content/seed.json). Output must match the hand-written
// markup the site's CSS/JS expect — see the region markers in the HTML.
// Every string is escaped: content comes from the admin panel.

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = (n) => String(n).padStart(2, '0');
// only https links and our own assets/ paths ever reach an href/src
export const safeUrl = (u) => {
  const s = String(u ?? '').trim();
  return /^https:\/\/[^\s"'<>]+$/i.test(s) || /^assets\/[\w./-]+$/.test(s) ? s : '';
};
const lines = (s) => esc(s).replace(/\r?\n/g, '<br>');

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg>';
const badge = (n) => `<div class="case-badge"><svg viewBox="0 0 120 120"><defs><path id="cp${n}" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><circle cx="60" cy="60" r="58" fill="none" stroke="var(--cream)" stroke-width="1" opacity="0.3"/><text font-size="10" font-weight="700" letter-spacing="1.4" fill="var(--cream)"><textPath href="#cp${n}">VISIT SITE • VISIT SITE • </textPath></text></svg><div class="arrow"><svg viewBox="0 0 24 24" fill="none" stroke="var(--cream)" stroke-width="1.8"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg></div></div>`;

const CATS = new Set(['web', 'branding', 'marketing']);
export const visibleProjects = (projects) => (projects || []).filter((p) => p.visible);

function caseCard(p, n, isMore) {
  const live = safeUrl(p.live_url);
  const img = safeUrl(p.image_url);
  const full = safeUrl(p.image_full_url);
  const alt = esc(p.image_alt || `${p.title} preview`);
  const cats = (p.categories || []).filter((c) => CATS.has(c));
  const pan = Math.min(12, Math.max(1, Number(p.pan_seconds) || 4));
  const pic = full
    ? `<picture><source media="(min-width:861px) and (hover:hover)" srcset="${esc(full)}"><img class="fill-img" src="${esc(img)}" alt="${alt}" width="1200" height="750" loading="lazy" decoding="async"></picture>`
    : `<img class="fill-img" src="${esc(img)}" alt="${alt}" width="1200" height="750" loading="lazy" decoding="async">`;
  const cls = 'case-visual' + (full ? ' case-visual--scroll' : '');
  const style = full ? ` style="--pan-dur:${pan}s"` : '';
  const visual = live
    ? `<a class="${cls}" href="${esc(live)}" target="_blank" rel="noopener noreferrer" data-cursor="view"${style}>
          ${pic}
          <span class="cv-glare" aria-hidden="true"></span>
          ${badge(n)}
        </a>`
    : `<div class="${cls}"${style}>
          ${pic}
          <span class="cv-glare" aria-hidden="true"></span>
        </div>`;
  return `
      <div class="case${isMore ? ' case-more hidden' : ''}" data-cat="${esc((cats.length ? cats : ['web']).join(' '))}">
        <div class="case-info">
          <span class="case-idx">${pad2(n)}</span>
          <h3 class="case-title">${esc(p.title)}</h3>
          <p class="case-desc">${esc(p.description)}</p>
          <div class="case-tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        </div>
        ${visual}
      </div>
`;
}

export function renderWork(projects) {
  const vis = visibleProjects(projects);
  const featured = vis.filter((p) => p.featured);
  const more = vis.filter((p) => !p.featured);
  let n = 0;
  let out = featured.map((p) => caseCard(p, ++n, false)).join('');
  if (more.length) {
    out += `
      <div class="cases-more">
        <button class="cases-more-btn" id="casesMoreBtn" type="button">More work<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
      </div>
`;
    out += more.map((p) => caseCard(p, ++n, true)).join('');
  }
  return out + '      ';
}

export function renderStats(stats, projects) {
  const liveCount = visibleProjects(projects).length;
  return '\n' + (stats || []).map((s) => {
    const value = s.auto === 'projects' ? liveCount : Math.max(0, Math.round(Number(s.value) || 0));
    const suf = s.suffix ? `<span class="stat-suf">${esc(s.suffix)}</span>` : '';
    return `        <div class="stat"><div class="stat-num"><span class="count" data-to="${value}">${value}</span>${suf}</div><p class="stat-label">${lines(s.label)}</p></div>\n`;
  }).join('') + '      ';
}

export function renderClients(projects) {
  const list = visibleProjects(projects).filter((p) => p.in_clients);
  let n = 0;
  const rows = list.map((p) => {
    const live = safeUrl(p.live_url);
    const prev = safeUrl(p.image_url);
    const inner = `<span class="client-idx">${pad2(++n)}</span><span class="client-name">${esc(p.client_name || p.title)}</span><span class="client-what">${esc(p.client_tagline)}</span><span class="client-did">${esc(p.client_deliverables)}</span><span class="client-go">${ARROW}</span>`;
    return live
      ? `        <li><a class="client" href="${esc(live)}" target="_blank" rel="noopener noreferrer"${prev ? ` data-preview="${esc(prev)}"` : ''} data-cursor="link">${inner}</a></li>\n`
      : `        <li><div class="client"${prev ? ` data-preview="${esc(prev)}"` : ''}>${inner}</div></li>\n`;
  }).join('');
  const next = `        <li class="client-next"><a class="client" href="#contact" data-cursor="link"><span class="client-idx">${pad2(++n)}</span><span class="client-name">Your brand<em>, next.</em></span><span class="client-what">Let's build something worth showing.</span><span class="client-did">Start a project</span><span class="client-go">${ARROW}</span></a></li>\n`;
  return '\n' + rows + next + '      ';
}

export function renderTestimonials(testimonials) {
  const list = (testimonials || []).filter((t) => t.visible && String(t.quote || '').trim());
  if (!list.length) return '\n      ';
  const cards = list.map((t) => {
    const role = [t.role, t.business].filter(Boolean).map(esc).join(', ');
    return `          <figure class="quote"><blockquote>${esc(t.quote)}</blockquote><figcaption><span class="q-name">${esc(t.name)}</span>${role ? `<span class="q-role">${role}</span>` : ''}</figcaption></figure>\n`;
  }).join('');
  return `
      <div class="quotes">
        <p class="quotes-kicker">In their words</p>
        <div class="quote-grid">
${cards}        </div>
      </div>
      `;
}

// swap the inside of <!-- cms:NAME --> … <!-- /cms:NAME -->
export function replaceRegion(html, name, inner) {
  const open = `<!-- cms:${name} -->`, close = `<!-- /cms:${name} -->`;
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a < 0 || b < 0 || html.indexOf(open, a + 1) >= 0 || b < a) throw new Error(`region "${name}" markers missing or duplicated`);
  return html.slice(0, a + open.length) + inner + html.slice(b);
}

export function renderSite(template, content) {
  let html = template;
  html = replaceRegion(html, 'work', renderWork(content.projects));
  html = replaceRegion(html, 'stats', renderStats(content.stats, content.projects));
  html = replaceRegion(html, 'clients', renderClients(content.projects));
  html = replaceRegion(html, 'testimonials', renderTestimonials(content.testimonials));
  return html;
}
