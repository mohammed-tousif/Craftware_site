import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProjectArt from "@/components/ui/ProjectArt";
import RevealText from "@/components/ui/RevealText";
import CaseMetrics from "@/components/sections/CaseMetrics";
import { projects, projectBySlug } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.summary,
    openGraph: { title: project.name, description: project.summary },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];

  return (
    <article className="relative overflow-hidden pt-24">
      <div className="mx-auto max-w-[1100px] px-6 sm:px-10">
        <div className="flex items-center justify-between border-b border-hair py-6 text-[12px] text-ink-mid">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 transition-colors hover:text-red"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M11 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All work
          </Link>
          <span className="font-display text-ink">
            {String(idx + 1).padStart(2, "0")} /{" "}
            {String(projects.length).padStart(2, "0")}
          </span>
        </div>

        <header className="pt-16 text-center sm:pt-24">
          <p className="kicker tracking-[0.24em]">
            Case Study — {project.industry}
          </p>
          <RevealText
            as="h1"
            className="mx-auto mt-5 max-w-[18ch] font-display text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.02] tracking-tight text-ink"
          >
            {project.name}
          </RevealText>
        </header>

        <dl className="mt-14 grid grid-cols-2 overflow-hidden rounded-xl border border-hair sm:grid-cols-4">
          {[
            ["Industry", project.industry],
            ["Services", project.services.join(" · ")],
            ["Timeline", project.timeline],
            ["Year", project.year],
          ].map(([k, v], i) => (
            <div
              key={k}
              className={`p-5 ${i > 0 ? "border-l border-hair" : ""} ${
                i < 2 ? "border-b border-hair sm:border-b-0" : ""
              }`}
            >
              <dt className="meta-label">{k}</dt>
              <dd className="mt-2 text-[13px] text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mx-auto mt-12 max-w-[1100px] px-6 sm:px-10">
        <ProjectArt
          project={project}
          className="aspect-[16/9] w-full rounded-2xl border border-hair"
        />
      </div>

      <div className="mx-auto max-w-[760px] px-6 sm:px-10">
        {project.sections.map((s) => (
          <section key={s.id} className="mt-24 first:mt-20">
            <div
              className={`font-display text-[14px] tracking-[0.14em] ${
                s.title === "Result" ? "text-red-deep" : "text-red"
              }`}
            >
              {s.id} — {s.title.toUpperCase()}
            </div>
            <p className="mt-5 text-[17px] leading-[1.75] text-ink-mid">
              {s.body}
            </p>
            {s.bullets && (
              <ul className="mt-6 space-y-3">
                {s.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex gap-3.5 text-[14px] leading-relaxed text-ink-mid"
                  >
                    <span className="text-red">—</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-[1100px] px-6 sm:px-10">
        <CaseMetrics metrics={project.metrics} />
      </div>

      <div className="mx-auto mt-28 max-w-[1100px] border-t border-hair px-6 pt-12 text-center sm:px-10">
        <p className="meta-label tracking-[0.24em]">Next project</p>
        <Link
          href={`/work/${next.slug}`}
          className="mt-4 inline-flex items-center gap-4 font-display text-[clamp(1.6rem,5vw,3rem)] font-bold tracking-tight text-ink transition-colors hover:text-red"
        >
          {next.name}
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
