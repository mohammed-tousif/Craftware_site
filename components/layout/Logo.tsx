/** Typographic wordmark + a small SVG "C" mark. Swap for a real logo SVG later. */
export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <span className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 6.5A9 9 0 1 0 20 17.5"
          stroke="var(--color-red)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
      <span
        className="font-display font-semibold text-ink"
        style={{ fontSize: size * 0.86 }}
      >
        CraftWare
      </span>
    </span>
  );
}
