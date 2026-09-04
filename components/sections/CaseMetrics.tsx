"use client";

import { useEffect, useRef, useState } from "react";
import { useInViewOnce, useReducedMotion } from "@/lib/hooks";
import type { Metric } from "@/content/projects";

/** Splits "+180%" into ["+", 180, "%"] so the number can count up. */
function parseMetric(value: string) {
  const m = value.match(/^([^\d-]*)(-?[\d.,]+)(.*)$/);
  if (!m) return { prefix: "", target: null as number | null, suffix: value };
  return {
    prefix: m[1],
    target: parseFloat(m[2].replace(/,/g, "")),
    suffix: m[3],
    decimals: (m[2].split(".")[1] ?? "").length,
    raw: m[2],
  };
}

function Tile({ metric, delay }: { metric: Metric; delay: number }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  const reduced = useReducedMotion();
  const parsed = parseMetric(metric.value);
  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!inView || parsed.target === null || reduced) return;
    const start = performance.now();
    const from = delay * 1000;
    const tick = (now: number) => {
      const elapsed = now - start - from;
      if (elapsed < 0) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / 1200);
      setN((parsed.target as number) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [inView, reduced, parsed.target, delay]);

  const display = reduced && parsed.target !== null ? parsed.target : n;

  return (
    <div ref={ref} className="rounded-xl border border-hair bg-paper p-7 sm:p-8">
      <div className="font-display text-4xl font-bold tracking-tight text-red sm:text-[2.5rem]">
        {parsed.target === null
          ? metric.value
          : `${parsed.prefix}${display.toLocaleString("en-US", {
              minimumFractionDigits: parsed.decimals,
              maximumFractionDigits: parsed.decimals,
            })}${parsed.suffix}`}
      </div>
      <div className="mt-3 text-[12px] text-ink-mid">{metric.label}</div>
    </div>
  );
}

export default function CaseMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((m, i) => (
        <Tile key={m.label} metric={m} delay={i * 0.08} />
      ))}
    </div>
  );
}
