"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import { values } from "@/content/values";
import { useReducedMotion } from "@/lib/hooks";

/** Precomputed hexagon positions (%), literal strings so SSR and client match exactly. */
const ORBIT: { left: string; top: string }[] = [
  { left: "100%", top: "50%" },
  { left: "75%", top: "93.301%" },
  { left: "25%", top: "93.301%" },
  { left: "0%", top: "50%" },
  { left: "25%", top: "6.699%" },
  { left: "75%", top: "6.699%" },
];

export default function WhyCraftWare() {
  const reduced = useReducedMotion();

  return (
    <section id="why" className="overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <SectionHeader
          index="06"
          label="Why CraftWare"
          title="Design × Technology × Marketing"
          align="center"
        />
      </div>

      <div className="relative mx-auto mt-16 flex h-[260px] w-[260px] scale-90 items-center justify-center sm:h-[420px] sm:w-[420px] sm:scale-100">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,16,46,0.06),transparent_70%)]" />
        <div className="absolute inset-0 rounded-full border border-hair" />
        <div className="absolute inset-[14%] rounded-full border border-hair" />

        <div
          className="absolute inset-0"
          style={reduced ? undefined : { animation: "cw-orbit 46s linear infinite" }}
        >
          {values.map((v, i) => {
            const pos = ORBIT[i % ORBIT.length];
            return (
              <div
                key={v}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: pos.left, top: pos.top }}
              >
                <span
                  className="block whitespace-nowrap rounded-full border border-hair-strong bg-paper px-2.5 py-1 text-[8.5px] uppercase tracking-[0.1em] text-ink shadow-[0_6px_18px_-10px_rgba(26,17,19,0.3)] sm:px-3.5 sm:py-1.5 sm:text-[11px] sm:tracking-[0.12em]"
                  style={
                    reduced
                      ? undefined
                      : { animation: "cw-orbit 46s linear infinite reverse" }
                  }
                >
                  {v}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <div className="font-display text-sm font-semibold tracking-[0.18em] text-red">
            CRAFTWARE
          </div>
          <div className="meta-label mt-1">The engine</div>
        </div>
      </div>

      <style>{`
        @keyframes cw-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
