// Generates CubeVoxelC.dc.html and CubeFractured.dc.html
// Isometric voxel art in SVG. Run: node scratch-gen-voxel.mjs
import { writeFileSync } from "node:fs";

const W = 760, H = 760;
// iso basis (screen coords, y down)
const S = 46;                 // voxel edge in px
const ex = [S * 0.866, S * 0.5];    // +x screen dir
const ey = [-S * 0.866, S * 0.5];   // +y screen dir  (into screen, other diagonal)
const ez = [0, -S];                 // +z screen dir (up)

function P(o, x, y, z) {
  return [
    o[0] + x * ex[0] + y * ey[0] + z * ez[0],
    o[1] + x * ex[1] + y * ey[1] + z * ez[1],
  ];
}
const f = (n) => n.toFixed(1);
const poly = (pts, fill, stroke) =>
  `<polygon points="${pts.map((p) => f(p[0]) + "," + f(p[1])).join(" ")}" fill="${fill}" stroke="${stroke}" stroke-width="1" stroke-linejoin="round"/>`;

// one voxel at grid (x,y,z); origin o is screen anchor for grid (0,0,0).
// Three visible faces: top (z+1), right (x+1), left (y+1).
function voxel(o, x, y, z, pal) {
  const t0 = P(o, x, y, z + 1);
  const t1 = P(o, x + 1, y, z + 1);
  const t2 = P(o, x + 1, y + 1, z + 1);
  const t3 = P(o, x, y + 1, z + 1);
  const rb1 = P(o, x + 1, y + 1, z);
  const rb0 = P(o, x + 1, y, z);
  const lb0 = P(o, x, y + 1, z);
  const top = poly([t0, t1, t2, t3], pal.top, pal.edge);
  const right = poly([t1, t2, rb1, rb0], pal.right, pal.edge);
  const left = poly([t3, t2, rb1, lb0], pal.left, pal.edge);
  return top + right + left;
}

const PAL_GLASS = {
  top: "url(#vTop)", right: "url(#vRight)", left: "url(#vLeft)", edge: "rgba(199,208,255,0.5)",
};
const PAL_CYAN = { top: "#7dd3fc", right: "#0891b2", left: "#155e75", edge: "rgba(255,255,255,0.4)" };
const PAL_VIOLET = { top: "#a78bfa", right: "#6d28d9", left: "#4c1d95", edge: "rgba(255,255,255,0.4)" };
const PAL_BLUE = { top: "#60a5fa", right: "#1d4ed8", left: "#1e3a8a", edge: "rgba(255,255,255,0.4)" };

const defs = `<defs>
  <linearGradient id="vTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(214,220,255,0.34)"/><stop offset="1" stop-color="rgba(139,92,246,0.24)"/></linearGradient>
  <linearGradient id="vRight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(139,92,246,0.24)"/><stop offset="1" stop-color="rgba(34,211,238,0.14)"/></linearGradient>
  <linearGradient id="vLeft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(90,70,160,0.28)"/><stop offset="1" stop-color="rgba(40,32,70,0.30)"/></linearGradient>
</defs>`;

// paint order: far voxels first. key = (x+y) then z ascending.
function draw(list, o) {
  return list
    .slice()
    .sort((p, q) => (p.x + p.y) - (q.x + q.y) || p.z - q.z)
    .map((v) => voxel(o, v.x, v.y, v.z, v.pal))
    .join("\n");
}

function page(title, inner, caption) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; }
    a { color: #C4B5FD; } a:hover { color: #22D3EE; }
    .cw-mono { font-family: 'Space Grotesk', system-ui, sans-serif; }
    .cw-body { font-family: 'Geist', system-ui, sans-serif; }
  </style>
</helmet>
<div class="cw-body" style="width: 760px; height: 760px; position: relative; overflow: hidden; background:
      radial-gradient(560px 460px at 50% 42%, rgba(139,92,246,0.24), rgba(34,211,238,0.05) 46%, transparent 72%),
      #08080B; color: #F4F4F6;">
  <div style="position: absolute; inset: 0; background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      -webkit-mask-image: radial-gradient(520px 420px at 50% 44%, #000 8%, transparent 82%);
              mask-image: radial-gradient(520px 420px at 50% 44%, #000 8%, transparent 82%);"></div>
  <div style="position: absolute; left: 50%; top: 566px; width: 420px; height: 120px; transform: translateX(-50%); background: radial-gradient(50% 50% at 50% 0%, rgba(139,92,246,0.26), transparent 72%); filter: blur(6px);"></div>
  <svg viewBox="0 0 ${W} ${H}" style="position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 24px 60px rgba(139,92,246,0.30));">
    ${defs}
    ${inner}
  </svg>
  <div style="position: absolute; left: 44px; right: 44px; bottom: 40px;">
    ${caption}
  </div>
</div>
</x-dc>
</body>
</html>`;
}

// ---------- Voxel C ----------
// C shape in a 4x1x5 grid (x depth fixed=0..1, z is vertical 0..4, y across 0..3)
const cVox = [];
const cShape = [
  "XXX",
  "X..",
  "X..",
  "X..",
  "XXX",
];
for (let row = 0; row < cShape.length; row++) {
  const z = cShape.length - 1 - row;
  for (let col = 0; col < cShape[row].length; col++) {
    if (cShape[row][col] !== "X") continue;
    const y = col;
    // two-deep for solidity
    cVox.push({ x: 0, y, z, pal: PAL_GLASS });
    cVox.push({ x: 1, y, z, pal: PAL_GLASS });
  }
}
// a few accent voxels
cVox.forEach((v) => {
  if (v.x === 1 && v.y === 0 && v.z === 4) v.pal = PAL_CYAN;
  if (v.x === 1 && v.y === 2 && v.z === 4) v.pal = PAL_VIOLET;
  if (v.x === 1 && v.y === 0 && v.z === 0) v.pal = PAL_BLUE;
});
// a couple of detaching blocks (drift out)
const cFloat = [
  { x: 3.2, y: -0.6, z: 3.4, pal: PAL_VIOLET },
  { x: 3.9, y: 0.4, z: 1.6, pal: PAL_CYAN },
  { x: -1.6, y: 2.2, z: 4.6, pal: PAL_GLASS },
];
const cOrigin = [W / 2 + 40, 300];
const cInner =
  draw(cVox, cOrigin) +
  "\n" +
  cFloat
    .slice()
    .sort((p, q) => (p.x + p.y + p.z) - (q.x + q.y + q.z))
    .map((v) => voxel(cOrigin, v.x, v.y, v.z, v.pal))
    .join("\n");
const cCaption = `<div class="cw-mono" style="font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: #F4F4F6;">Option 3 — Voxel C (Minecraft)</div>
    <div style="margin-top: 8px; font-size: 12px; line-height: 1.6; color: #9A9AA6; max-width: 560px;">The C built from glass voxels, with a few blocks breaking away and drifting — "we craft, block by block". Direct play on the name. In code the loose blocks orbit back and lock in on load. Trade‑off: needs care to look premium, not gamer.</div>`;
writeFileSync("CubeVoxelC.dc.html", page("Voxel C", cInner, cCaption));

// ---------- Fractured cube ----------
// 3x3x3 solid, then explode outward on a few blocks
const fVox = [];
for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 3; z++) {
  let pal = PAL_GLASS;
  if (x === 2 && y === 0 && z === 2) pal = PAL_CYAN;
  if (x === 0 && y === 2 && z === 1) pal = PAL_VIOLET;
  if (x === 2 && y === 2 && z === 0) pal = PAL_BLUE;
  fVox.push({ x, y, z, pal });
}
// pull a few blocks out along their normal
const move = {
  "2,0,2": [0.9, -0.9, 0.5],
  "0,2,2": [-0.8, 0.8, 0.7],
  "2,2,0": [0.7, 0.7, -0.8],
  "1,0,1": [0.2, -1.4, 0.1],
};
for (const v of fVox) {
  const k = `${v.x},${v.y},${v.z}`;
  if (move[k]) { v.x += move[k][0]; v.y += move[k][1]; v.z += move[k][2]; }
}
const fOrigin = [W / 2 + 30, 320];
const fInner = draw(fVox, fOrigin);
const fCaption = `<div class="cw-mono" style="font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: #F4F4F6;">Option 4 — Fractured cube</div>
    <div style="margin-top: 8px; font-size: 12px; line-height: 1.6; color: #9A9AA6; max-width: 560px;">A 3×3×3 cube with blocks pulled out and floating — parts of a system coming together. In code the pieces breathe in and out and assemble on scroll. Trade‑off: the most abstract of the four; "cube" is implied, not stated.</div>`;
writeFileSync("CubeFractured.dc.html", page("Fractured cube", fInner, fCaption));

console.log("wrote CubeVoxelC.dc.html and CubeFractured.dc.html");
