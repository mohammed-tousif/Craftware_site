import Reveal from "@/components/ui/Reveal";
import RevealText from "@/components/ui/RevealText";
import MagneticButton from "@/components/ui/MagneticButton";
import SignatureObject from "@/components/three/SignatureObject";
import { site, mailtoHref } from "@/config/site";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-28 text-center"
    >
      {/* grounds */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_760px_at_50%_42%,rgba(139,92,246,0.22),rgba(34,211,238,0.06)_46%,transparent_68%)]" />
      <div className="grid-texture pointer-events-none absolute inset-0 [mask-image:radial-gradient(920px_620px_at_50%_46%,transparent_26%,#000_92%)]" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-soft-light" />

      {/* signature object — luminous centrepiece behind the type */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div className="relative h-[min(78vh,640px)] w-[min(78vh,640px)] max-w-[92vw] translate-y-[-4%]">
          <SignatureObject className="absolute inset-0" />
        </div>
      </div>

      {/* corner meta */}
      <Reveal
        as="span"
        immediate
        delay={0.5}
        y={0}
        className="meta-label absolute left-6 top-24 z-10 hidden sm:block sm:left-10"
      >
        {site.ethos}
      </Reveal>
      <Reveal
        as="span"
        immediate
        delay={0.5}
        y={0}
        className="meta-label absolute right-6 top-24 z-10 hidden sm:block sm:right-10"
      >
        {site.founded}
      </Reveal>

      {/* kicker */}
      <Reveal
        as="p"
        immediate
        delay={0.3}
        className="kicker relative z-10 tracking-[0.24em]"
      >
        {site.name} — Digital Growth Studio
      </Reveal>

      {/* headline stack sits over the object's lower half */}
      <div className="relative z-10 mt-[30vh] sm:mt-[34vh]">
        <RevealText
          as="h1"
          immediate
          delay={0.15}
          className="mx-auto max-w-[16ch] font-display text-[clamp(2rem,5.4vw,3.3rem)] font-bold leading-[1.06] tracking-tight [text-shadow:0_2px_50px_rgba(8,8,11,0.9),0_0_20px_rgba(8,8,11,0.7)] sm:max-w-[24ch]"
        >
          WE CRAFT DIGITAL EXPERIENCES THAT
        </RevealText>
        <RevealText
          as="span"
          immediate
          delay={0.5}
          className="mt-1 block font-display text-[clamp(2rem,5.4vw,3.3rem)] font-bold leading-[1.06] tracking-tight text-gradient [filter:drop-shadow(0_0_24px_rgba(139,92,246,0.55))]"
        >
          GROW.
        </RevealText>

        <Reveal
          as="p"
          immediate
          delay={0.85}
          className="mx-auto mt-4 max-w-[46ch] text-[13.5px] leading-relaxed text-text-mid sm:text-sm"
        >
          Websites. Social. Ads. SEO. Everything your brand needs to dominate
          digitally.
        </Reveal>

        <Reveal
          immediate
          delay={1}
          className="mt-6 flex flex-wrap items-center justify-center gap-3.5"
        >
          <MagneticButton href={mailtoHref("Start a project")} cursor="Let's Talk">
            Start a Project
          </MagneticButton>
          <MagneticButton href="/#work" variant="ghost" cursor="View Work">
            Explore Our Work
          </MagneticButton>
        </Reveal>
      </div>

      {/* baseline */}
      <Reveal
        as="div"
        immediate
        delay={1.3}
        y={0}
        className="meta-label absolute inset-x-0 bottom-7 z-10 text-center tracking-[0.24em]"
      >
        Scroll ↓
      </Reveal>
      <span className="meta-label absolute bottom-7 right-6 z-10 hidden sm:block sm:right-10">
        01 / 09
      </span>
    </section>
  );
}
