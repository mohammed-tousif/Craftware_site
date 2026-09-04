"use client";

import { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { services } from "@/content/services";
import { useIsTouch } from "@/lib/hooks";

export default function Services() {
  const isTouch = useIsTouch();
  const [active, setActive] = useState<string | null>(null);

  const close = () => setActive(null);
  const toggle = (id: string) => setActive((cur) => (cur === id ? null : id));

  return (
    <section id="services" className="bg-paper-2 py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <SectionHeader
          index="03"
          label="Capabilities"
          title="EVERYTHING YOUR BRAND NEEDS TO GROW."
          sub="Seven services, one team. Hover a line to open it."
        />

        <ul
          className="mt-12 sm:mt-14"
          onMouseLeave={() => !isTouch && close()}
        >
          {services.map((s) => {
            const isActive = active === s.id;
            return (
              <li
                key={s.id}
                className="relative border-t border-hair last:border-b"
                onMouseEnter={() => !isTouch && setActive(s.id)}
              >
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-red transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: isActive ? "scaleY(1)" : "scaleY(0)",
                    transformOrigin: "top",
                  }}
                />

                <button
                  type="button"
                  onClick={() => isTouch && toggle(s.id)}
                  className="relative flex w-full items-baseline gap-4 py-5 pl-4 text-left sm:gap-6 sm:pl-6"
                  aria-expanded={isActive}
                >
                  <span
                    className={`w-6 shrink-0 font-display text-[13px] transition-colors ${
                      isActive ? "text-red" : "text-ink-low"
                    }`}
                  >
                    {s.id}
                  </span>
                  <span
                    className={`font-display font-semibold tracking-tight transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive
                        ? "text-[clamp(1.6rem,4vw,2.4rem)] text-red"
                        : "text-[clamp(1.1rem,2.2vw,1.4rem)] text-ink"
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
                    <div className="flex flex-col gap-4 pb-7 pl-[2.5rem] sm:flex-row sm:items-center sm:justify-between sm:pl-[3rem]">
                      <p className="max-w-[42ch] text-[13.5px] leading-relaxed text-ink-mid">
                        {s.line}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {s.keywords.map((k) => (
                          <span
                            key={k}
                            className="rounded-full border border-hair-strong bg-paper px-3 py-1 text-[10.5px] uppercase tracking-[0.12em] text-ink-mid"
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

        <p className="meta-label mt-10">
          {isTouch ? "Tap a service to expand" : "Hover a service to expand"}
        </p>
      </div>
    </section>
  );
}
