"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { site, mailtoHref } from "@/config/site";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const id = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <Reveal
        as="header"
        immediate
        y={-16}
        delay={0.15}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled
            ? "border-b border-hair bg-paper/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/#top" aria-label="CraftWare home">
            <Logo size={20} />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            <ul className="flex gap-7 text-[12px] uppercase tracking-[0.14em] text-ink-mid">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="transition-colors hover:text-red"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={mailtoHref()}
              className="group inline-flex items-center gap-2 rounded-full border border-hair-strong px-4 py-2.5 text-[12px] uppercase tracking-[0.08em] transition-colors hover:border-red hover:text-red"
            >
              Let&apos;s Talk
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex flex-col gap-[5px] p-1 lg:hidden"
          >
            <span className="block h-px w-6 bg-ink" />
            <span className="block h-px w-6 bg-ink" />
          </button>
        </div>
      </Reveal>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
