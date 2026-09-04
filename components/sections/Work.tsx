import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import ProjectArt from "@/components/ui/ProjectArt";
import { projects } from "@/content/projects";

export default function Work() {
  return (
    <section id="work" className="py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <SectionHeader
          index="04"
          label="Work"
          title="WORK WE'VE CRAFTED."
          sub="Ideas are easy. Execution is everything."
        />

        <div className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.05}>
              <Link
                href={`/work/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hair bg-paper transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-red/40 hover:shadow-[0_20px_44px_-24px_rgba(200,16,46,0.25)]"
              >
                <ProjectArt project={p} index={i + 1} className="h-44 w-full" />
                <div className="flex flex-1 flex-col gap-3.5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-[17px] font-bold leading-snug tracking-tight text-ink">
                      {p.name}
                    </h3>
                    <span className="mt-0.5 shrink-0 text-[11px] text-ink-mid">
                      {p.industry}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.services.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-hair px-2.5 py-1 text-[10.5px] text-ink-mid"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-4 pt-2">
                    <span className="text-[12.5px] font-medium text-red">
                      {p.result ?? " "}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-display text-[10.5px] uppercase tracking-[0.14em] text-ink transition-colors group-hover:text-red">
                      View
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="transition-transform group-hover:translate-x-0.5"
                      >
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
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
