import { createElement, type ReactNode } from "react";
import { words as splitWords } from "@/lib/animations";

type Props = {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** delay before the reveal starts, seconds */
  delay?: number;
  /** stagger between words, seconds */
  stagger?: number;
  /** unused now — the CSS reveal always plays once on mount */
  immediate?: boolean;
};

/**
 * Word-by-word mask reveal, driven ENTIRELY by a CSS animation
 * (animation-fill-mode: both) — no JS state, no refs, no observers. The
 * animation just plays once on mount, so it can never get stuck hidden:
 * worst case (CSS somehow fails to apply) the words render at their
 * natural position, already visible. Server component — zero client JS.
 */
export default function RevealText({
  children,
  as = "h2",
  className = "",
  delay = 0,
  stagger = 0.05,
}: Props) {
  const parts = splitWords(children);

  const inner: ReactNode = parts.map((w, i) => (
    <span key={i} style={{ display: "inline-block" }}>
      <span
        style={{
          display: "inline-block",
          overflow: "hidden",
          verticalAlign: "top",
          paddingBottom: "0.08em",
          marginBottom: "-0.08em",
        }}
      >
        <span
          className="cw-reveal-word"
          style={{
            display: "inline-block",
            animationDelay: `${delay + i * stagger}s`,
          }}
        >
          {w}
        </span>
      </span>
      {i < parts.length - 1 ? " " : ""}
    </span>
  ));

  return createElement(as, { className }, inner);
}
