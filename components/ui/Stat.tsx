"use client";

import { useEffect, useRef, useState } from "react";
import { useInViewOnce, useReducedMotion } from "@/lib/hooks";
import type { Stat as StatData } from "@/content/stats";

const fmt = (n: number, decimals = 0) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export default function Stat({ stat }: { stat: StatData }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!inView || reduced) return;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(stat.value * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [inView, reduced, stat.value]);

  const display = reduced ? stat.value : n;

  return (
    <div ref={ref} className="border-t-2 border-red/70 pt-5">
      <div className="font-display text-4xl font-bold leading-none tracking-tight text-ink sm:text-5xl">
        {stat.prefix}
        {fmt(display, stat.decimals)}
        <span className="text-red">{stat.suffix}</span>
      </div>
      <div className="mt-3 text-[13px] text-ink-mid">{stat.label}</div>
    </div>
  );
}
