import Logo from "./Logo";
import { site, mailtoHref } from "@/config/site";

const menu = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

function Social({ label }: { label: string }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none" } as const;
  if (label === "Instagram")
    return (
      <svg {...common} aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    );
  if (label === "Facebook")
    return (
      <svg {...common} aria-hidden>
        <path
          d="M14 8h3V4h-3c-2.2 0-4 1.8-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8c0-.6.4-1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  return (
    <svg {...common} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-hair bg-paper-2">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 sm:px-10 md:grid-cols-[1.6fr_1fr_1.2fr]">
        <div className="max-w-xs">
          <Logo size={18} />
          <p className="mt-4 text-[13px] leading-relaxed text-ink-mid">{site.tagline}</p>
          <div className="mt-5 flex gap-4 text-ink-low">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="transition-colors hover:text-red"
              >
                <Social label={s.label} />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 text-[13px] text-ink-mid">
          <span className="meta-label">Menu</span>
          {menu.map((m) => (
            <a key={m.href} href={m.href} className="w-fit transition-colors hover:text-red">
              {m.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3 text-[13px] text-ink-mid">
          <span className="meta-label">Contact</span>
          <a href={mailtoHref()} className="w-fit transition-colors hover:text-red">
            {site.contact.email}
          </a>
          <a
            href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}
            className="w-fit transition-colors hover:text-red"
          >
            {site.contact.phone}
          </a>
          <span>{site.contact.location}</span>
        </div>

        <div className="text-[11px] text-ink-low md:col-span-3 md:mt-4 md:border-t md:border-hair md:pt-6">
          © 2026 CraftWare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
