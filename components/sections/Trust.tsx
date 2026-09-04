import RevealText from "@/components/ui/RevealText";
import Stat from "@/components/ui/Stat";
import { stats } from "@/content/stats";

export default function Trust() {
  return (
    <section id="machines" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <p className="kicker">
          <span className="font-display text-red">02</span> — Machines
        </p>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <RevealText
            as="h2"
            className="max-w-[18ch] font-display text-[clamp(1.9rem,4.6vw,3.25rem)] font-bold leading-[1.06] tracking-tight text-ink"
          >
            WE DON&apos;T JUST BUILD WEBSITES. WE BUILD DIGITAL MACHINES.
          </RevealText>

          <p className="max-w-[52ch] self-end text-[15px] leading-relaxed text-ink-mid">
            We combine design, technology, content, advertising and search into
            digital systems that move businesses forward — not disconnected
            deliverables, but one engine built to compound.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {stats.map((s) => (
            <Stat key={s.label} stat={s} />
          ))}
        </div>
      </div>

      <span className="meta-label pointer-events-none absolute bottom-6 right-6 sm:right-10">
        02 / 09
      </span>
    </section>
  );
}
