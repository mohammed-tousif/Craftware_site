"use client";

import { useEffect } from "react";
import { site, mailtoHref } from "@/config/site";
import Logo from "./Logo";

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col bg-paper transition-[clip-path,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
        open
          ? "pointer-events-auto opacity-100 [clip-path:inset(0_0_0%_0)]"
          : "pointer-events-none opacity-0 [clip-path:inset(0_0_100%_0)]"
      }`}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between px-6 py-7">
        <Logo size={19} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="text-ink-mid"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col justify-center gap-1 px-6">
        {site.nav.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="font-display text-4xl font-bold tracking-tight text-ink transition-[transform,opacity,color] duration-500 hover:text-red"
            style={{
              transform: open ? "translateY(0)" : "translateY(24px)",
              opacity: open ? 1 : 0,
              transitionDelay: open ? `${0.12 + i * 0.05}s` : "0s",
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="px-6 pb-10">
        <a
          href={mailtoHref()}
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full bg-red px-6 py-3.5 text-[13px] font-medium text-white"
        >
          Let&apos;s Talk
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
