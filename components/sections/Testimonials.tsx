"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import { testimonials } from "@/content/testimonials";
import { useReducedMotion } from "@/lib/hooks";

function Card({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <figure className="flex w-[80vw] shrink-0 flex-col justify-between rounded-2xl border border-hair bg-paper p-6 sm:w-[380px]">
      <blockquote className="text-[14.5px] leading-relaxed text-ink">
        <span className="mr-1 font-display text-xl text-red">“</span>
        {t.quote}
      </blockquote>
      <figcaption className="mt-5 text-[12.5px]">
        <span className="font-display font-semibold text-ink">{t.name}</span>
        <span className="text-ink-mid">
          {" "}
          — {t.role}, {t.company}
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const reduced = useReducedMotion();
  const loop = [...testimonials, ...testimonials];

  return (
    <section id="voices" className="overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <SectionHeader
          index="08"
          label="Voices"
          title="DON'T TAKE OUR WORD FOR IT."
          align="center"
        />
      </div>

      <div className="group relative mt-12 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_9%,#000_91%,transparent)]">
        {reduced ? (
          <div className="flex gap-5 overflow-x-auto px-6 pb-4 sm:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {testimonials.map((t, i) => (
              <Card key={i} t={t} />
            ))}
          </div>
        ) : (
          <div className="flex w-max gap-5 px-3 [animation:cw-marquee_50s_linear_infinite] group-hover:[animation-play-state:paused]">
            {loop.map((t, i) => (
              <Card key={i} t={t} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes cw-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
