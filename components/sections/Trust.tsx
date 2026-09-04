import SectionHeader from "@/components/ui/SectionHeader";
import Stat from "@/components/ui/Stat";
import { stats } from "@/content/stats";

export default function Trust() {
  return (
    <section id="machines" className="py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <SectionHeader
          index="02"
          label="Machines"
          title="WE DON'T JUST BUILD WEBSITES. WE BUILD DIGITAL MACHINES."
        />

        <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-ink-mid">
          We combine design, technology, content, advertising and search into
          digital systems that move businesses forward — not disconnected
          deliverables, but one engine built to compound.
        </p>

        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:mt-16 lg:grid-cols-4">
          {stats.map((s) => (
            <Stat key={s.label} stat={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
