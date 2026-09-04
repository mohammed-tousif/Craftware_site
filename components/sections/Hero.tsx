import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import RevealText from "@/components/ui/RevealText";
import MagneticButton from "@/components/ui/MagneticButton";
import MeshField from "@/components/hero/MeshField";
import { site, mailtoHref } from "@/config/site";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-28 text-center"
    >
      {/* grounds */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_620px_at_50%_38%,rgba(200,16,46,0.06),transparent_70%)]" />
      <MeshField className="absolute inset-0 [mask-image:radial-gradient(1200px_820px_at_50%_46%,#000_28%,transparent_92%)]" />
      <div className="grid-texture pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(960px_640px_at_50%_46%,transparent_24%,#000_92%)]" />

      {/* corner meta */}
      <Reveal
        as="span"
        immediate
        delay={0.4}
        y={0}
        className="meta-label absolute left-6 top-28 z-10 hidden sm:block sm:left-10"
      >
        {site.ethos}
      </Reveal>
      <Reveal
        as="span"
        immediate
        delay={0.4}
        y={0}
        className="meta-label absolute right-6 top-28 z-10 hidden sm:block sm:right-10"
      >
        {site.founded}
      </Reveal>

      <div className="relative z-10 flex flex-col items-center">
        <Reveal
          as="p"
          immediate
          delay={0.2}
          className="kicker mb-6 flex items-center gap-3 tracking-[0.24em]"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red" />
          {site.name} — Digital Growth Studio
        </Reveal>

        <RevealText
          as="h1"
          immediate
          delay={0.1}
          className="mx-auto max-w-[13ch] font-display text-[clamp(2.3rem,7vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:max-w-[15ch]"
        >
          WE CRAFT DIGITAL EXPERIENCES THAT
        </RevealText>
        <RevealText
          as="span"
          immediate
          delay={0.45}
          className="mt-1 block font-display text-[clamp(2.3rem,7vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.03em] text-red"
        >
          GROW.
        </RevealText>

        <Reveal
          as="p"
          immediate
          delay={0.8}
          className="mx-auto mt-7 max-w-[44ch] text-[14px] leading-relaxed text-ink-mid sm:text-[15px]"
        >
          Websites. Social. Ads. SEO. Everything your brand needs to dominate
          digitally.
        </Reveal>

        <Reveal
          immediate
          delay={0.95}
          className="mt-9 flex flex-wrap items-center justify-center gap-6"
        >
          <MagneticButton href={mailtoHref("Start a project")}>
            Start a Project
          </MagneticButton>
          <Link
            href="/#work"
            className="group inline-flex items-center gap-2 border-b border-hair-strong pb-1 font-display text-[12px] uppercase tracking-[0.14em] text-ink-mid transition-colors hover:border-red hover:text-ink"
          >
            Explore our work
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </Reveal>
      </div>

      <Reveal
        as="div"
        immediate
        delay={1.2}
        y={0}
        className="meta-label absolute inset-x-0 bottom-8 z-10 text-center tracking-[0.24em]"
      >
        Scroll ↓
      </Reveal>
    </section>
  );
}
