// Vercel build: bake the admin-managed content into the static page.
//
//   node scripts/build.mjs            → dist/ (what Vercel serves)
//   node scripts/build.mjs --source   → rewrite the regions inside
//                                        craftware-design-v2.html from
//                                        content/seed.json (keeps the
//                                        committed file a working preview)
//
// With DATABASE_URL set, content comes from the database and any database
// error FAILS the build — Vercel then keeps the previous deployment live,
// instead of silently shipping stale fallback content. Without it (local
// work, or before the database is connected) content/seed.json is used.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSite } from '../lib/render.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'craftware-design-v2.html');
const OUT = path.join(ROOT, 'dist');
const toSource = process.argv.includes('--source');

let content, from;
if (!toSource && (process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
  const { loadContent } = await import('../lib/db.js');
  content = await loadContent();
  from = 'database';
} else {
  content = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'seed.json'), 'utf8'));
  from = 'content/seed.json';
}

if (toSource) {
  fs.writeFileSync(SRC, renderSite(fs.readFileSync(SRC, 'utf8'), content));
  console.log(`regions in craftware-design-v2.html re-rendered from ${from}`);
  process.exit(0);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(ROOT, 'assets'), path.join(OUT, 'assets'), { recursive: true });

// images uploaded in the admin live in a PRIVATE Blob store; copy each one
// into the static site so visitors load them from craftware.co.in. A
// missing/unreadable image fails the build (previous deployment stays live).
const { isUploadRef, readImage, uploadFileName } = await import('../lib/storage.js');
const uploadsDir = path.join(OUT, 'assets', 'uploads');
const copied = new Map();
for (const p of content.projects) {
  for (const key of ['image_url', 'image_full_url']) {
    const ref = p[key];
    if (!ref || !String(ref).startsWith('upload:')) continue;
    if (!isUploadRef(ref)) throw new Error(`invalid upload reference on "${p.title}": ${ref}`);
    if (!copied.has(ref)) {
      const { buf } = await readImage(ref);
      fs.mkdirSync(uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(uploadsDir, uploadFileName(ref)), buf);
      copied.set(ref, `assets/uploads/${uploadFileName(ref)}`);
    }
    p[key] = copied.get(ref);
  }
}

const html = renderSite(fs.readFileSync(SRC, 'utf8'), content);
fs.writeFileSync(path.join(OUT, 'craftware-design-v2.html'), html);
for (const f of ['admin.html', 'robots.txt', 'sitemap.xml']) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
const vis = content.projects.filter((p) => p.visible).length;
console.log(`built dist/ from ${from}: ${vis} visible projects, ${content.testimonials.filter((t) => t.visible).length} testimonials, ${copied.size} uploaded images`);
