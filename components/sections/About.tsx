import RevealText from "@/components/ui/RevealText";
import TechConstellation from "@/components/ui/TechConstellation";

const team = ["A", "B", "C", "D"];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <p className="kicker">
          <span className="font-display text-red">07</span> — Studio
        </p>

        <div className="mt-8 grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <RevealText
              as="h2"
              className="font-display text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-ink"
            >
              WE&apos;RE CRAFTWARE.
            </RevealText>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-mid">
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

            <div className="mt-10 flex gap-3">
              {team.map((t) => (
                <div
                  key={t}
                  className="h-16 w-16 rounded-full border border-hair bg-surface"
                  aria-hidden
                />
              ))}
            </div>
          </div>

          <div>
            <p className="meta-label mb-4">Capabilities &amp; tools</p>
            <TechConstellation />
          </div>
        </div>
      </div>

      <span className="meta-label pointer-events-none absolute bottom-6 right-6 sm:right-10">
        07 / 09
      </span>
    </section>
  );
}
