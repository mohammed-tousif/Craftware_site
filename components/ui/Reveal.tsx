"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/lib/hooks";

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
  /** unused now — kept for call-site compatibility */
  immediate?: boolean;
};

/**
 * Entrance animation: fade + slide-in once the element scrolls into view
 * (or immediately if it is already on screen at mount). IntersectionObserver
 * drives it; a rAF fallback reveals anything still hidden a beat after mount,
 * so content is never stuck invisible even if the observer never fires.
 */
export default function Reveal({
  children,
  as = "div",
  className = "",
  y = 16,
  x = 0,
  delay = 0,
  duration = 0.7,
}: Props) {
  const node = useRef<HTMLElement | null>(null);
  const setNode = useCallback((el: HTMLElement | null) => {
    node.current = el;
  }, []);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);

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
        { rootMargin: "0px 0px -8% 0px" }
      );
      io.observe(el);
    }

    // fallback: if the element is on screen (or the observer never fires),
    // reveal shortly after mount.
    const t = window.setTimeout(() => setShown(true), 600);

    return () => {
      io?.disconnect();
      window.clearTimeout(t);
    };
  }, [reduced]);

  const style: CSSProperties | undefined = reduced
    ? undefined
    : {
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translate(${x}px, ${y}px)`,
        transition: `opacity ${duration}s ease, transform ${duration}s cubic-bezier(0.16,1,0.3,1)`,
        transitionDelay: `${delay}s`,
        willChange: "opacity, transform",
      };

  switch (as) {
    case "span":
      return (
        <span ref={setNode} className={className} style={style}>
          {children}
        </span>
      );
    case "p":
      return (
        <p ref={setNode} className={className} style={style}>
          {children}
        </p>
      );
    case "header":
      return (
        <header ref={setNode} className={className} style={style}>
          {children}
        </header>
      );
    case "section":
      return (
        <section ref={setNode} className={className} style={style}>
          {children}
        </section>
      );
    case "li":
      return (
        <li ref={setNode} className={className} style={style}>
          {children}
        </li>
      );
    default:
      return (
        <div ref={setNode} className={className} style={style}>
          {children}
        </div>
      );
  }
}
