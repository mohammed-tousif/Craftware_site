import type { ReactNode } from "react";
import Link from "next/link";

type Common = {
  children: ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
  /** kept for call-site compatibility; unused */
  cursor?: string;
};

type AsLink = Common & { href: string; onClick?: never; external?: boolean };
type AsButton = Common & { href?: never; onClick?: () => void; external?: never };

type Props = AsLink | AsButton;

const base =
  "inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-medium transition-colors duration-150";

const styles = {
  solid: "bg-red text-white hover:bg-red-deep",
  ghost: "border border-hair-strong text-ink hover:border-red hover:text-red",
};

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
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
  const cls = `${base} ${styles[variant]} ${className}`;

  if ("href" in props && props.href) {
    const isHash = props.href.startsWith("#") || props.href.startsWith("/#");
    const external =
      props.external || /^https?:|^mailto:|^tel:/.test(props.href);
    if (external || isHash) {
      return (
        <a
          href={props.href}
          target={
            external && !props.href.startsWith("mailto:") ? "_blank" : undefined
          }
          rel={external ? "noopener noreferrer" : undefined}
          className={cls}
        >
          {children}
          <Arrow />
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        {children}
        <Arrow />
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={cls}>
      {children}
      <Arrow />
    </button>
  );
}
