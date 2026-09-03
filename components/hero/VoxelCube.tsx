"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useIsTouch, useReducedMotion } from "@/lib/hooks";

/* ------------------------------------------------------------------ *
 *  Fractured glass cube — the CraftWare signature object.
 *  27 translucent glass voxels form a 3x3x3 cube. Corner/edge pieces
 *  continuously break away and re-assemble on staggered loops, so the
 *  cube is forever rebuilding itself. Pure CSS 3D — no WebGL.
 * ------------------------------------------------------------------ */

const PITCH = 62; // distance between voxel centres
const VOX = 54; // voxel edge

type Accent = "violet" | "cyan" | "blue" | "white";

const ACCENT_FILL: Record<Accent, string> = {
  violet: "linear-gradient(145deg, rgba(167,139,250,0.62), rgba(109,40,217,0.5))",
  cyan: "linear-gradient(145deg, rgba(103,232,249,0.6), rgba(8,145,178,0.46))",
  blue: "linear-gradient(145deg, rgba(96,165,250,0.6), rgba(37,99,235,0.48))",
  white: "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(205,210,240,0.5))",
};

// face fills by orientation (fake lighting: top brightest, right darkest)
const FACE = {
  top: "linear-gradient(145deg, rgba(224,229,255,0.44), rgba(163,143,242,0.30))",
  front: "linear-gradient(145deg, rgba(165,145,238,0.34), rgba(96,196,224,0.22))",
  right: "linear-gradient(145deg, rgba(124,104,190,0.34), rgba(48,38,80,0.38))",
};

const OUT = 0.5; // fracture distance factor — smaller = pieces stay closer

type Loose = {
  ox: number;
  oy: number;
  oz: number;
  dur: number;
  delay: number;
  rx: number;
  ry: number;
};

type Vox = {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
  z: -1 | 0 | 1;
  accent?: Accent;
  loose?: Loose;
};

// 3x3x3 minus the hidden centre
function buildVoxels(): Vox[] {
  const out: Vox[] = [];
  const accents: Record<string, Accent> = {
    "1,1,1": "cyan",
    "-1,-1,1": "blue",
    "1,-1,-1": "violet",
    "-1,1,-1": "white",
    "0,1,1": "violet",
  };
  // the 8 corner pieces break away straight along their diagonal — no tilt.
  // one shared period, evenly-spaced phases -> calm, ~1 piece out at a time.
  const PERIOD = 11;
  const corners: Array<[number, number, number]> = [
    [1, 1, 1],
    [-1, 1, 1],
    [1, -1, 1],
    [-1, -1, 1],
    [1, 1, -1],
    [-1, 1, -1],
    [1, -1, -1],
    [-1, -1, -1],
  ];
  const looseCfg: Record<string, Loose> = {};
  corners.forEach(([cx, cy, cz], i) => {
    looseCfg[`${cx},${cy},${cz}`] = {
      ox: cx * 150,
      oy: -cy * 150,
      oz: cz * 150,
      dur: PERIOD,
      delay: -(i / corners.length) * PERIOD,
      rx: 0,
      ry: 0,
    };
  });

  const axis: Array<-1 | 0 | 1> = [-1, 0, 1];
  for (const x of axis)
    for (const y of axis)
      for (const z of axis) {
        if (x === 0 && y === 0 && z === 0) continue;
        const k = `${x},${y},${z}`;
        out.push({ x, y, z, accent: accents[k], loose: looseCfg[k] });
      }
  return out;
}

function Face({
  transform,
  fill,
  bright,
}: {
  transform: string;
  fill: string;
  bright: boolean;
}) {
  const s: CSSProperties = {
    position: "absolute",
    width: VOX,
    height: VOX,
    transform,
    background: fill,
    border: `1px solid rgba(202,211,255,${bright ? 0.72 : 0.5})`,
    borderRadius: 4,
    boxShadow: bright
      ? "inset 0 0 16px rgba(139,92,246,0.22), 0 0 20px rgba(139,92,246,0.28)"
      : "inset 0 0 13px rgba(139,92,246,0.16)",
    backfaceVisibility: "hidden",
  };
  return <div style={s} />;
}

function Voxel({ v }: { v: Vox }) {
  const h = VOX / 2;
  const outer = Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z) >= 2;
  const fill = v.accent ? ACCENT_FILL[v.accent] : null;
  const home = `translate3d(${v.x * PITCH}px, ${-v.y * PITCH}px, ${v.z * PITCH}px)`;

  const style: CSSProperties = {
    position: "absolute",
    left: -h,
    top: -h,
    width: VOX,
    height: VOX,
    transformStyle: "preserve-3d",
    transform: v.loose ? undefined : home,
    animation: v.loose
      ? `cw-vx-${v.x + 1}${v.y + 1}${v.z + 1} ${v.loose.dur}s ease-in-out ${v.loose.delay}s infinite`
      : undefined,
  };

  return (
    <div style={style}>
      <Face transform={`translateZ(${h}px)`} fill={fill ?? FACE.front} bright={outer} />
      <Face transform={`rotateY(90deg) translateZ(${h}px)`} fill={fill ?? FACE.right} bright={outer} />
      <Face transform={`rotateX(90deg) translateZ(${h}px)`} fill={fill ?? FACE.top} bright={outer} />
    </div>
  );
}

export default function VoxelCube({
  className = "",
  parallax = true,
}: {
  className?: string;
  parallax?: boolean;
}) {
  const tilt = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();
  const live = !reduced;
  const followPointer = parallax && !isTouch && !reduced;

  const voxels = useMemo(buildVoxels, []);

  const keyframes = useMemo(() => {
    if (reduced) return "";
    return voxels
      .filter((v) => v.loose)
      .map((v) => {
        const l = v.loose!;
        const hx = v.x * PITCH;
        const hy = -v.y * PITCH;
        const hz = v.z * PITCH;
        const name = `cw-vx-${v.x + 1}${v.y + 1}${v.z + 1}`;
        const tx = (hx + l.ox * OUT).toFixed(1);
        const ty = (hy + l.oy * OUT).toFixed(1);
        const tz = (hz + l.oz * OUT).toFixed(1);
        return `@keyframes ${name}{
0%,26%{transform:translate3d(${hx}px,${hy}px,${hz}px);}
45%,52%{transform:translate3d(${tx}px,${ty}px,${tz}px);}
74%,100%{transform:translate3d(${hx}px,${hy}px,${hz}px);}
}`;
      })
      .join("\n");
  }, [voxels, reduced]);

  useEffect(() => {
    if (!followPointer) return;
    const el = tilt.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      el.style.setProperty("--mx", `${x * 13}deg`);
      el.style.setProperty("--my", `${-y * 11}deg`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [followPointer]);

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden>
      {/* glow + floor */}
      <div className="absolute inset-[-10%] rounded-full bg-[radial-gradient(circle_at_50%_46%,rgba(139,92,246,0.4),rgba(34,211,238,0.12)_46%,transparent_72%)] blur-3xl" />
      <div className="absolute inset-x-[10%] bottom-[8%] h-20 rounded-[50%] bg-[radial-gradient(50%_50%_at_50%_0%,rgba(139,92,246,0.3),transparent_72%)] blur-md" />

      <div className="absolute inset-0" style={{ perspective: "1500px" }}>
        <div
          ref={tilt}
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transform:
              "rotateX(calc(-24deg + var(--my, 0deg))) rotateY(calc(-30deg + var(--mx, 0deg)))",
            transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 0,
              height: 0,
              transformStyle: "preserve-3d",
              animation: live ? "cw-cube-sway 15s ease-in-out infinite" : undefined,
            }}
          >
            {voxels.map((v, i) => (
              <Voxel key={i} v={v} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cw-cube-sway {
          0%, 100% { transform: rotateY(-15deg); }
          50% { transform: rotateY(15deg); }
        }
        ${keyframes}
      `}</style>
    </div>
  );
}
