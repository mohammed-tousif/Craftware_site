import SectionHeader from "@/components/ui/SectionHeader";

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
          <SectionHeader index="07" label="Studio" title="WE'RE CRAFTWARE." />

          <div className="space-y-5 text-[15px] leading-relaxed text-ink-mid sm:text-base md:pt-9">
            <p>
              We&apos;re a digital growth studio built for businesses that
              don&apos;t want to blend in.
            </p>
            <p>
              We combine design, technology and performance marketing to create
              digital experiences that look exceptional and deliver measurable
              results.
            </p>
            <p className="text-ink">
              Design, code, content and campaigns under one roof — so nothing
              gets lost in the hand-off.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
