import RevealText from "@/components/ui/RevealText";
import MagneticButton from "@/components/ui/MagneticButton";
import { mailtoHref, whatsappHref } from "@/config/site";

export default function FinalCta() {
  return (
    <section
      id="move"
      className="relative flex min-h-[70svh] items-center overflow-hidden py-24 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_480px_at_50%_35%,rgba(200,16,46,0.07),transparent_66%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[900px] flex-col items-center px-6 text-center sm:px-10">
        <p className="kicker mb-5">
          <span className="font-display text-red">09</span>&nbsp;&nbsp;—&nbsp;&nbsp;Move
        </p>
        <RevealText
          as="h2"
          className="mx-auto max-w-[16ch] font-display text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.03] tracking-[-0.02em] text-ink"
        >
          YOUR NEXT BIG MOVE STARTS
        </RevealText>
        <RevealText
          as="span"
          delay={0.15}
          className="mt-1 block font-display text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.03] tracking-[-0.02em] text-red"
        >
          HERE.
        </RevealText>

        <p className="mx-auto mt-6 max-w-[42ch] text-[15px] leading-relaxed text-ink-mid">
          Have an idea? Need more customers? Want to transform your digital
          presence?
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <MagneticButton href={mailtoHref("Start a project")}>
            Start a Project
          </MagneticButton>
          <MagneticButton href={whatsappHref()} variant="ghost">
            WhatsApp Us
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
