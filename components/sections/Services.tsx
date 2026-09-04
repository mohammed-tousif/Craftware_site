"use client";

import { useState } from "react";
import RevealText from "@/components/ui/RevealText";
import { services } from "@/content/services";
import { useIsTouch } from "@/lib/hooks";

export default function Services() {
  const isTouch = useIsTouch();
  const [active, setActive] = useState<string | null>(null);

  const open = (id: string) => setActive(id);
  const close = () => setActive(null);
  const toggle = (id: string) => setActive((cur) => (cur === id ? null : id));

  return (
    <section id="services" className="relative overflow-hidden bg-paper-2 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 text-center sm:px-10">
        <p className="kicker">
          <span className="font-display text-red">03</span> — Capabilities
        </p>
        <RevealText
          as="h2"
          className="mx-auto mt-4 max-w-[20ch] font-display text-[clamp(1.9rem,4.8vw,2.9rem)] font-bold tracking-tight text-ink"
        >
          EVERYTHING YOUR BRAND NEEDS TO GROW.
        </RevealText>
      </div>

      <ul
        className="mx-auto mt-14 max-w-[1180px] px-6 sm:px-10"
        onMouseLeave={() => !isTouch && close()}
      >
        {services.map((s) => {
          const isActive = active === s.id;
          return (
            <li
              key={s.id}
              className="relative border-t border-hair last:border-b"
              onMouseEnter={() => !isTouch && open(s.id)}
            >
              <span
                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-red transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: isActive ? "scaleY(1)" : "scaleY(0)", transformOrigin: "top" }}
              />

              <button
                type="button"
                onClick={() => isTouch && toggle(s.id)}
                className="relative flex w-full items-baseline gap-5 py-5 pl-4 text-left sm:gap-7"
                aria-expanded={isActive}
              >
                <span
                  className={`font-display text-xs transition-colors sm:text-[13px] ${
                    isActive ? "text-red" : "text-ink-low"
                  }`}
                >
                  {s.id}
                </span>
                <span
                  className={`font-display font-semibold tracking-tight transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? "text-[clamp(1.9rem,5vw,3.25rem)] text-red"
                      : "text-[clamp(1.15rem,2.4vw,1.5rem)] text-ink"
                  }`}
                >
                  {s.name}
                </span>
              </button>

              <div
                className="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  gridTemplateRows: isActive ? "1fr" : "0fr",
                  opacity: isActive ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-5 pb-8 pl-9 sm:flex-row sm:items-end sm:justify-between sm:pl-[3.5rem]">
                    <p className="max-w-[44ch] text-sm leading-relaxed text-ink-mid">
                      {s.line}
                    </p>
                    <div className="flex flex-wrap gap-2.5 sm:justify-end">
                      {s.keywords.map((k, i) => (
                        <span
                          key={k}
                          className="rounded-full border border-hair-strong bg-paper px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-ink transition-[transform,opacity] duration-500"
                          style={{
                            transform: isActive ? "translateY(0)" : "translateY(8px)",
                            opacity: isActive ? 1 : 0,
                            transitionDelay: isActive ? `${0.1 + i * 0.05}s` : "0s",
                          }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="meta-label mt-12 text-center">
        {isTouch ? "Tap a service to expand" : "Hover a service to expand"}
      </p>
      <span className="meta-label pointer-events-none absolute bottom-6 right-6 sm:right-10">
        03 / 09
      </span>
    </section>
  );
}
