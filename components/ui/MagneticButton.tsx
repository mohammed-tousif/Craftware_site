"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useIsTouch, useReducedMotion } from "@/lib/hooks";

type Common = {
  children: ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
  /** kept for call-site compatibility; no longer used (custom cursor removed) */
  cursor?: string;
};

type AsLink = Common & { href: string; onClick?: never; external?: boolean };
type AsButton = Common & { href?: never; onClick?: () => void; external?: never };

type Props = AsLink | AsButton;

const base =
  "group relative inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-medium transition-[background-color,color,border-color,box-shadow] duration-300 will-change-transform";

const styles = {
  solid:
    "text-white bg-red hover:bg-red-deep shadow-[0_10px_30px_-8px_rgba(200,16,46,0.45)] hover:shadow-[0_14px_36px_-8px_rgba(200,16,46,0.6)]",
  ghost:
    "text-ink border border-hair-strong hover:border-red hover:text-red",
};

function Arrow() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      className="transition-transform duration-300 group-hover:translate-x-1"
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
  );
}

export default function MagneticButton(props: Props) {
  const { children, variant = "solid", className = "" } = props;
  const ref = useRef<HTMLAnchorElement>(null);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();
  const magnetic = !isTouch && !reduced;

  const onMove = (e: MouseEvent) => {
    if (!magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    gsap.to(ref.current, { x: x * 0.28, y: y * 0.4, duration: 0.5, ease: "power3.out" });
  };

  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
  };

  const cls = `${base} ${styles[variant]} ${className}`;

  if ("href" in props && props.href) {
    const isHash = props.href.startsWith("#") || props.href.startsWith("/#");
    const external =
      props.external || /^https?:|^mailto:|^tel:/.test(props.href);
    if (external || isHash) {
      return (
        <a
          ref={ref}
          href={props.href}
          target={
            external && !props.href.startsWith("mailto:") ? "_blank" : undefined
          }
          rel={external ? "noopener noreferrer" : undefined}
          className={cls}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          {children}
          <Arrow />
        </a>
      );
    }
    return (
      <Link
        ref={ref}
        href={props.href}
        className={cls}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {children}
        <Arrow />
      </Link>
    );
  }

  return (
    <button
      ref={ref as unknown as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={props.onClick}
      className={cls}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
      <Arrow />
    </button>
  );
}
