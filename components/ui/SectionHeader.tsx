import RevealText from "./RevealText";

type Props = {
  index: string;
  label: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
  className?: string;
};

/** Consistent section header: kicker line + heading, always sharing one edge. */
export default function SectionHeader({
  index,
  label,
  title,
  sub,
  align = "left",
  className = "",
}: Props) {
  const wrap =
    align === "center"
      ? "mx-auto max-w-[42ch] items-center text-center"
      : "items-start text-left";
  return (
    <div className={`flex flex-col ${wrap} ${className}`}>
      <p className="kicker">
        <span className="font-display text-red">{index}</span>&nbsp;&nbsp;—&nbsp;&nbsp;{label}
      </p>
      <RevealText
        as="h2"
        className="mt-3 max-w-[22ch] font-display text-[clamp(1.75rem,3.6vw,2.5rem)] font-bold leading-[1.1] tracking-tight text-ink"
      >
        {title}
      </RevealText>
      {sub ? (
        <p className="mt-3 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-mid">
          {sub}
        </p>
      ) : null}
    </div>
  );
}
