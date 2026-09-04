import RevealText from "@/components/ui/RevealText";
import MagneticButton from "@/components/ui/MagneticButton";
import { mailtoHref, whatsappHref } from "@/config/site";

export default function FinalCta() {
  return (
    <section
      id="move"
      className="relative flex min-h-[80svh] items-center overflow-hidden py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_520px_at_18%_36%,rgba(200,16,46,0.08),transparent_64%)]" />
      <div className="grid-texture pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(900px_600px_at_20%_40%,#000,transparent_88%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 sm:px-10">
        <RevealText
          as="h2"
          className="max-w-[15ch] font-display text-[clamp(2.6rem,9vw,6rem)] font-bold leading-[0.98] tracking-[-0.03em] text-ink"
        >
          YOUR NEXT BIG MOVE STARTS
        </RevealText>
        <RevealText
          as="span"
          delay={0.2}
          className="mt-1 block font-display text-[clamp(2.6rem,9vw,6rem)] font-bold leading-[0.98] tracking-[-0.03em] text-red"
        >
          HERE.
        </RevealText>

        <p className="mt-7 max-w-[46ch] text-[15px] leading-relaxed text-ink-mid">
          Have an idea? Need more customers? Want to transform your digital
          presence?
        </p>

        <div className="mt-9 flex flex-wrap gap-3.5">
          <MagneticButton href={mailtoHref("Start a project")}>
            Start a Project
          </MagneticButton>
          <MagneticButton href={whatsappHref()} variant="ghost">
            WhatsApp Us
          </MagneticButton>
        </div>
      </div>

      <span className="meta-label pointer-events-none absolute bottom-6 right-6 sm:right-10">
        09 / 09
      </span>
    </section>
  );
}
