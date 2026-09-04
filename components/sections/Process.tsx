"use client";

import { useEffect, useRef, useState } from "react";
import RevealText from "@/components/ui/RevealText";
import { processSteps } from "@/content/process";
import { useReducedMotion } from "@/lib/hooks";

export default function Process() {
  const root = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const reduced = useReducedMotion();
  const progress = reduced ? 1 : scrollProgress;

  useEffect(() => {
    if (reduced) return;
    const el = root.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = (vh * 0.75 - r.top) / (r.height * 0.7);
        setScrollProgress(Math.max(0, Math.min(1, p)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  return (
    <section id="process" className="relative overflow-hidden bg-paper-2 py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-6 text-center sm:px-10">
        <p className="kicker">
          <span className="font-display text-red">05</span> — Process
        </p>
        <RevealText
          as="h2"
          className="mt-4 font-display text-[clamp(2rem,5vw,2.9rem)] font-bold tracking-tight text-ink"
        >
          FROM IDEA TO IMPACT.
        </RevealText>
      </div>

      <div
        ref={root}
        className="relative mx-auto mt-20 max-w-[1400px] px-6 sm:px-10"
      >
        {/* rail — desktop */}
        <div className="pointer-events-none absolute left-10 right-10 top-[68px] hidden h-[2px] md:block">
          <div className="absolute inset-0 bg-hair" />
          <div
            className="absolute inset-y-0 left-0 bg-red"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <ol className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-5 md:gap-x-4">
          {processSteps.map((step, i) => {
            const stepDone = progress >= (i + 0.5) / processSteps.length;
            return (
              <li
                key={step.id}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-[58px] flex-col items-center justify-start">
                  <span className="font-display text-[13px] tracking-[0.2em] text-red">
                    {step.id}
                  </span>
                  <span className="mt-2 font-display text-lg font-semibold text-ink sm:text-xl">
                    {step.name}
                  </span>
                </div>
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <span
                    className={`h-3 w-3 rounded-full transition-colors ${
                      stepDone ? "bg-red" : "bg-paper ring-1 ring-hair-strong"
                    }`}
                  />
                </span>
                <p className="mt-5 max-w-[24ch] text-[12.5px] leading-relaxed text-ink-mid">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <span className="meta-label pointer-events-none absolute bottom-6 right-6 sm:right-10">
        05 / 09
      </span>
    </section>
  );
}
