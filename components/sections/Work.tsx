import Link from "next/link";
import RevealText from "@/components/ui/RevealText";
import Reveal from "@/components/ui/Reveal";
import ProjectArt from "@/components/ui/ProjectArt";
import { projects } from "@/content/projects";

export default function Work() {
  return (
    <section id="work" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
        <p className="kicker">
          <span className="font-display text-red">04</span> — Work
        </p>
        <RevealText
          as="h2"
          className="mt-4 font-display text-[clamp(1.9rem,4.8vw,2.9rem)] font-bold tracking-tight text-ink"
        >
          WORK WE&apos;VE CRAFTED.
        </RevealText>
        <p className="mt-3 text-[13px] text-ink-mid">
          Ideas are easy. Execution is everything.
        </p>

        <div className="mt-14 grid gap-8 sm:mt-16 sm:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <Link
                href={`/work/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-hair bg-paper transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-red/40 hover:shadow-[0_24px_50px_-24px_rgba(200,16,46,0.28)]"
              >
                <ProjectArt project={p} className="aspect-[16/10] w-full" />
                <div className="flex flex-1 flex-col gap-4 p-6 sm:p-7">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
                      {p.name}
                    </h3>
                    <span className="shrink-0 text-[11px] text-ink-mid sm:text-xs">
                      {p.industry}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.services.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-hair px-3 py-1 text-[11px] text-ink-mid"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  {p.result && (
                    <p className="mt-auto text-[13px] font-medium text-red">
                      {p.result}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-2 text-[11px] font-display uppercase tracking-[0.14em] text-ink transition-colors group-hover:text-red">
                    View project
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-1">
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <span className="meta-label pointer-events-none absolute bottom-6 right-6 sm:right-10">
        04 / 09
      </span>
    </section>
  );
}
