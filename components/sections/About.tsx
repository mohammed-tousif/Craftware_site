import RevealText from "@/components/ui/RevealText";
import Reveal from "@/components/ui/Reveal";

const team = ["A", "B", "C", "D"];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <p className="kicker">
          <span className="font-display text-red">07</span> — Studio
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <RevealText
            as="h2"
            className="font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.05] tracking-tight text-ink"
          >
            WE&apos;RE CRAFTWARE.
          </RevealText>

          <div>
            <div className="space-y-4 text-[15px] leading-relaxed text-ink-mid sm:text-base">
              <p>
                We&apos;re a digital growth studio built for businesses that
                don&apos;t want to blend in.
              </p>
              <p>
                We combine design, technology and performance marketing to create
                digital experiences that look exceptional and deliver measurable
                results.
              </p>
            </div>

            <Reveal className="mt-10 flex gap-3">
              {team.map((t) => (
                <div
                  key={t}
                  className="h-16 w-16 rounded-full border border-hair bg-surface"
                  aria-hidden
                />
              ))}
            </Reveal>
          </div>
        </div>
      </div>

      <span className="meta-label pointer-events-none absolute bottom-6 right-6 sm:right-10">
        07 / 09
      </span>
    </section>
  );
}
