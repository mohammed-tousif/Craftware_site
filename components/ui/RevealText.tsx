"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { words as splitWords } from "@/lib/animations";
import { useReducedMotion } from "@/lib/hooks";

type Props = {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** delay before the reveal starts, seconds */
  delay?: number;
  /** stagger between words, seconds */
  stagger?: number;
  /** unused now — kept for call-site compatibility */
  immediate?: boolean;
};

/**
 * Word-by-word mask reveal. Each word sits in an overflow-hidden box; the
 * inner span slides up from 110% to 0 when the heading scrolls into view
 * (or right away if already on screen). rAF/timeout fallback guarantees the
 * text is never left hidden.
 */
export default function RevealText({
  children,
  as = "h2",
  className = "",
  delay = 0,
  stagger = 0.05,
}: Props) {
  const node = useRef<HTMLElement | null>(null);
  const setNode = useCallback((el: HTMLElement | null) => {
    node.current = el;
  }, []);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);
  const parts = splitWords(children);
  const revealed = reduced || shown;

  useEffect(() => {
    if (reduced) return;
    const el = node.current;
    let io: IntersectionObserver | null = null;

    if (el && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setShown(true);
            io?.disconnect();
          }
        },
        { rootMargin: "0px 0px -10% 0px" }
      );
      io.observe(el);
    }

    const t = window.setTimeout(() => setShown(true), 600);

    return () => {
      io?.disconnect();
      window.clearTimeout(t);
    };
  }, [reduced]);

  const inner: ReactNode = parts.map((w, i) => (
    <span key={i}>
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
          style={{
            display: "inline-block",
            transform: revealed ? "translateY(0)" : "translateY(110%)",
            transition: reduced
              ? "none"
              : "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
            transitionDelay: `${delay + i * stagger}s`,
            willChange: "transform",
          }}
        >
          {w}
        </span>
      </span>
      {i < parts.length - 1 ? " " : ""}
    </span>
  ));

  switch (as) {
    case "h1":
      return (
        <h1 ref={setNode} className={className}>
          {inner}
        </h1>
      );
    case "h3":
      return (
        <h3 ref={setNode} className={className}>
          {inner}
        </h3>
      );
    case "p":
      return (
        <p ref={setNode} className={className}>
          {inner}
        </p>
      );
    case "span":
      return (
        <span ref={setNode} className={className}>
          {inner}
        </span>
      );
    default:
      return (
        <h2 ref={setNode} className={className}>
          {inner}
        </h2>
      );
  }
}
