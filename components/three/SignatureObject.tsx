"use client";

import dynamic from "next/dynamic";
import { useIsTouch, useReducedMotion } from "@/lib/hooks";
import type { RefObject } from "react";

const MonolithCanvas = dynamic(() => import("./MonolithCanvas"), {
  ssr: false,
  loading: () => null,
});

/** Static CSS/SVG stand-in used for reduced-motion and pre-hydration. */
function StaticMonolith({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <div className="absolute inset-[-14%] bg-[radial-gradient(circle_at_50%_46%,rgba(139,92,246,0.5),rgba(34,211,238,0.14)_46%,transparent_72%)] blur-3xl" />
      <svg viewBox="0 0 220 240" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="sig-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#221a3a" />
            <stop offset="1" stopColor="#0c0b16" />
          </linearGradient>
          <linearGradient id="sig-side" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#161226" />
            <stop offset="1" stopColor="#0a0912" />
          </linearGradient>
          <linearGradient id="sig-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#22D3EE" />
            <stop offset="0.5" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <polygon points="70,40 150,55 150,190 70,205" fill="url(#sig-face)" stroke="url(#sig-edge)" strokeWidth="1.5" />
        <polygon points="150,55 185,42 185,175 150,190" fill="url(#sig-side)" stroke="url(#sig-edge)" strokeWidth="1.5" />
        <polygon points="70,40 105,27 185,42 150,55" fill="#2a2148" stroke="url(#sig-edge)" strokeWidth="1.5" />
        <path d="M128 95 A34 34 0 1 0 128 150" fill="none" stroke="url(#sig-edge)" strokeWidth="13" strokeLinecap="round" />
        <path d="M128 95 A34 34 0 1 0 128 150" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

type Props = {
  className?: string;
  scrollProgress?: RefObject<number> | null;
  withParallax?: boolean;
};

export default function SignatureObject({
  className = "",
  scrollProgress = null,
  withParallax = true,
}: Props) {
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  if (reduced) return <StaticMonolith className={className} />;

  return (
    <MonolithCanvas
      className={className}
      scrollProgress={scrollProgress}
      parallax={withParallax && !isTouch}
      low={isTouch}
    />
  );
}
