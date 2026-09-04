"use client";

import RevealText from "@/components/ui/RevealText";
import { testimonials } from "@/content/testimonials";
import { useReducedMotion } from "@/lib/hooks";

function Card({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <figure className="flex w-[86vw] shrink-0 flex-col justify-between rounded-xl border border-hair bg-paper p-7 sm:w-[420px]">
      <blockquote className="text-[15px] leading-relaxed text-ink">
        <span className="mr-1 font-display text-2xl text-red">“</span>
        {t.quote}
      </blockquote>
      <figcaption className="mt-6 text-[13px]">
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
    <section id="voices" className="relative overflow-hidden bg-paper-2 py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-6 text-center sm:px-10">
        <p className="kicker">
          <span className="font-display text-red">08</span> — Voices
        </p>
        <RevealText
          as="h2"
          className="mt-4 font-display text-[clamp(1.9rem,4.8vw,2.9rem)] font-bold tracking-tight text-ink"
        >
          DON&apos;T TAKE OUR WORD FOR IT.
        </RevealText>
      </div>

      <div className="group relative mt-14 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        {reduced ? (
          <div className="flex gap-6 overflow-x-auto px-6 pb-4 sm:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {testimonials.map((t, i) => (
              <Card key={i} t={t} />
            ))}
          </div>
        ) : (
          <div className="flex w-max gap-6 px-3 [animation:cw-marquee_48s_linear_infinite] group-hover:[animation-play-state:paused]">
            {loop.map((t, i) => (
              <Card key={i} t={t} />
            ))}
          </div>
        )}
      </div>

      <span className="meta-label pointer-events-none absolute bottom-6 right-6 sm:right-10">
        08 / 09
      </span>

      <style>{`
        @keyframes cw-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
