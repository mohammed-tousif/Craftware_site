// Admin image uploads. The Vercel Blob store is PRIVATE, so uploads are never
// served from Blob directly: the database keeps an "upload:<pathname>"
// reference, the admin previews it through an authenticated route
// (/api/admin/image), and the site build (scripts/build.mjs) copies each
// referenced image into dist/assets/uploads/ — visitors load images from
// craftware.co.in itself and never depend on Blob.
// The admin resizes images in the browser before upload, so files arrive small.
import { HttpError } from './http.js';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_BYTES = 3 * 1024 * 1024;
export const UPLOAD_PREFIX = 'upload:';
// only paths this code creates: work/<slug>-<random>.<ext>
export const isUploadRef = (s) => /^upload:work\/[a-z0-9-]+(?:-[A-Za-z0-9]+)?\.(?:jpg|png|webp)$/.test(String(s || ''));
export const uploadFileName = (ref) => ref.slice(UPLOAD_PREFIX.length).replace(/^work\//, '');

function sniff(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}
const blobConfigured = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export async function storeImage(dataUrl, baseName) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw new HttpError(400, 'Please upload a JPG, PNG or WebP image.');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > MAX_BYTES) throw new HttpError(413, 'Image is too large (max 3MB after resizing).');
  const type = sniff(buf);
  if (!type) throw new HttpError(400, 'That file is not a valid image.');
  const slug = String(baseName || 'image').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image';
  const path = `work/${slug}.${TYPES[type]}`;
  if (globalThis.__CW_TEST_PUT__) return UPLOAD_PREFIX + (await globalThis.__CW_TEST_PUT__(path, buf, type));
  // newer Blob stores authenticate through Vercel's built-in OIDC token +
  // BLOB_STORE_ID (no BLOB_READ_WRITE_TOKEN); older ones use the token
  if (!blobConfigured()) throw new HttpError(503, 'Image storage is not connected yet.');
  const { put } = await import('@vercel/blob');
  const blob = await put(path, buf, { access: 'private', contentType: type, addRandomSuffix: true });
  return UPLOAD_PREFIX + blob.pathname;
}

// read an uploaded image back → { buf, type }
export async function readImage(ref) {
  if (!isUploadRef(ref)) throw new HttpError(400, 'Invalid image reference');
  const pathname = ref.slice(UPLOAD_PREFIX.length);
  if (globalThis.__CW_TEST_GET__) return globalThis.__CW_TEST_GET__(pathname);
  if (!blobConfigured()) throw new HttpError(503, 'Image storage is not connected yet.');
  const { get } = await import('@vercel/blob');
  const res = await get(pathname, { access: 'private' });
  if (!res) throw new HttpError(404, `Image not found: ${pathname}`);
  const buf = Buffer.from(await new Response(res.stream).arrayBuffer());
  return { buf, type: res.blob?.contentType || sniff(buf) || 'application/octet-stream' };
}
