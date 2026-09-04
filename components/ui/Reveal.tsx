import { createElement, type CSSProperties, type ReactNode } from "react";

type Tag = "div" | "span" | "p" | "header" | "section" | "li";

type Props = {
  children: ReactNode;
  as?: Tag;
  className?: string;
  /** translate distance in px before reveal */
  y?: number;
  x?: number;
  /** seconds */
  delay?: number;
  duration?: number;
  /** unused now — the CSS reveal always plays once on mount */
  immediate?: boolean;
};

/**
 * Fade + slide entrance, driven entirely by a CSS animation
 * (animation-fill-mode: both) — no JS, no refs, no observers, so it can
 * never get stuck hidden. Server component.
 */
export default function Reveal({
  children,
  as = "div",
  className = "",
  y = 16,
  x = 0,
  delay = 0,
  duration = 0.8,
}: Props) {
  const style: CSSProperties & Record<string, string> = {
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    "--cw-reveal-from": `translate(${x}px, ${y}px)`,
  };

  return createElement(as, { className: `cw-reveal ${className}`, style }, children);
}
