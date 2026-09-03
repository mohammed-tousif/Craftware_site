"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useIsTouch, useReducedMotion } from "@/lib/hooks";

/* ------------------------------------------------------------------ *
 *  Fractured glass cube — the CraftWare signature object.
 *  Pure CSS 3D (no WebGL): a 3x3 glass body with a few blocks pulled
 *  out and floating. Slow yaw + cursor tilt + gentle bob.
 * ------------------------------------------------------------------ */

type Accent = "glass" | "violet" | "cyan" | "blue" | "white";

const accentBg: Record<Accent, string> = {
  glass:
    "linear-gradient(145deg, rgba(214,220,255,0.16), rgba(139,92,246,0.10) 55%, rgba(34,211,238,0.06))",
  violet: "linear-gradient(145deg, #a78bfa, #6d28d9)",
  cyan: "linear-gradient(145deg, #67e8f9, #0891b2)",
  blue: "linear-gradient(145deg, #60a5fa, #2563eb)",
  white: "linear-gradient(145deg, #ffffff, #cdd2f0)",
};

const FACES = [
  { key: "front", t: (h: number) => `translateZ(${h}px)` },
  { key: "back", t: (h: number) => `rotateY(180deg) translateZ(${h}px)` },
  { key: "right", t: (h: number) => `rotateY(90deg) translateZ(${h}px)` },
  { key: "left", t: (h: number) => `rotateY(-90deg) translateZ(${h}px)` },
  { key: "top", t: (h: number) => `rotateX(90deg) translateZ(${h}px)` },
  { key: "bottom", t: (h: number) => `rotateX(-90deg) translateZ(${h}px)` },
] as const;

/** which cells on which face get an accent tint (index 0-8, row-major) */
const BODY_ACCENTS: Record<string, Partial<Record<number, Accent>>> = {
  front: { 1: "violet", 6: "blue" },
  right: { 2: "cyan", 4: "violet" },
  top: { 0: "white", 8: "cyan" },
  back: { 4: "violet" },
  left: { 7: "blue" },
};

function Face({
  size,
  transform,
  grid,
  accents,
  solid,
}: {
  size: number;
  transform: string;
  grid: boolean;
  accents?: Partial<Record<number, Accent>>;
  solid?: Accent;
}) {
  const base: CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    transform,
    borderRadius: grid ? 10 : 5,
    border: "1px solid rgba(139,92,246,0.35)",
    boxShadow: "0 0 26px rgba(139,92,246,0.18)",
    background: "rgba(9,9,15,0.55)",
    backfaceVisibility: "hidden",
  };

  if (!grid) {
    return (
      <div
        style={{
          ...base,
          background: accentBg[solid ?? "glass"],
          border: "1px solid rgba(255,255,255,0.32)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.35), 0 0 34px rgba(139,92,246,0.45)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...base,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: size * 0.03,
        padding: size * 0.03,
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: 4,
            background: accentBg[accents?.[i] ?? "glass"],
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "inset 0 0 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)",
          }}
        />
      ))}
    </div>
  );
}

function Cube({
  size,
  grid = false,
  solid,
  accents,
  style,
}: {
  size: number;
  grid?: boolean;
  solid?: Accent;
  accents?: Record<string, Partial<Record<number, Accent>>>;
  style?: CSSProperties;
}) {
  const h = size / 2;
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {FACES.map((f) => (
        <Face
          key={f.key}
          size={size}
          transform={f.t(h)}
          grid={grid}
          solid={solid}
          accents={accents?.[f.key]}
        />
      ))}
    </div>
  );
}

/** floating fractured blocks: [x, y, zPx, sizePx, accent, bobDelay] (x/y in px from cube centre) */
const FLOATERS: [number, number, number, number, Accent, number][] = [
  [168, -120, 50, 62, "cyan", 0],
  [-176, -46, 30, 54, "violet", -2.2],
  [140, 96, -50, 50, "blue", -4],
  [-150, 118, -20, 44, "glass", -1.1],
  [16, -184, 20, 40, "white", -3.1],
];

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

  useEffect(() => {
    if (!followPointer) return;
    const el = tilt.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      el.style.setProperty("--mx", `${x * 14}deg`);
      el.style.setProperty("--my", `${-y * 12}deg`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [followPointer]);

  const BODY = 232;

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden>
      {/* glow + floor */}
      <div className="absolute inset-[-12%] rounded-full bg-[radial-gradient(circle_at_50%_46%,rgba(139,92,246,0.42),rgba(34,211,238,0.12)_46%,transparent_72%)] blur-3xl" />
      <div className="absolute inset-x-[8%] bottom-[6%] h-24 rounded-[50%] bg-[radial-gradient(50%_50%_at_50%_0%,rgba(139,92,246,0.3),transparent_72%)] blur-md" />

      <div
        className="absolute inset-0"
        style={{ perspective: "1600px" }}
      >
        <div
          ref={tilt}
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transform:
              "rotateX(calc(-24deg + var(--my, 0deg))) rotateY(var(--mx, 0deg))",
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
              animation: live ? "cw-cube-spin 44s linear infinite" : undefined,
            }}
          >
            <div
              style={{
                position: "absolute",
                transformStyle: "preserve-3d",
                animation: live ? "cw-cube-bob 7s ease-in-out infinite" : undefined,
              }}
            >
              {/* main body */}
              <Cube
                size={BODY}
                grid
                accents={BODY_ACCENTS}
                style={{ left: -BODY / 2, top: -BODY / 2 }}
              />

              {/* fractured floaters */}
              {FLOATERS.map(([x, y, z, s, a, delay], i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: x - s / 2,
                    top: y - s / 2,
                    transformStyle: "preserve-3d",
                    transform: `translateZ(${z}px)`,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      transformStyle: "preserve-3d",
                      animation: live
                        ? `cw-cube-bob 6s ease-in-out ${delay}s infinite`
                        : undefined,
                    }}
                  >
                    <Cube size={s} solid={a} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cw-cube-spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes cw-cube-bob {
          0%, 100% { transform: translateY(-6px); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
}
