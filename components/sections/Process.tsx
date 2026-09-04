import SectionHeader from "@/components/ui/SectionHeader";
import { processSteps } from "@/content/process";

export default function Process() {
  const last = processSteps.length - 1;

  return (
    <section id="process" className="bg-paper-2 py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <SectionHeader
          index="05"
          label="Process"
          title="FROM IDEA TO IMPACT."
        />

        <ol className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:mt-16 md:grid-cols-5 md:gap-x-4">
          {processSteps.map((step, i) => (
            <li key={step.id} className="flex flex-col items-center text-center">
              <div className="flex h-[52px] flex-col items-center">
                <span className="font-display text-[12px] tracking-[0.2em] text-red">
                  {step.id}
                </span>
                <span className="mt-1.5 font-display text-[17px] font-semibold text-ink sm:text-lg">
                  {step.name}
                </span>
              </div>

              {/* dot row — the connector sits at its vertical centre so dots land on it */}
              <div className="relative my-5 flex h-4 w-full items-center justify-center">
                <span
                  className={`absolute top-1/2 hidden h-px -translate-y-1/2 bg-hair-strong md:block ${
                    i === 0 ? "left-1/2 right-0" : i === last ? "left-0 right-1/2" : "inset-x-0"
                  }`}
                />
                <span className="relative h-3 w-3 rounded-full bg-red shadow-[0_0_0_4px_rgba(200,16,46,0.12)]" />
              </div>

              <p className="max-w-[22ch] text-[12.5px] leading-relaxed text-ink-mid">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
