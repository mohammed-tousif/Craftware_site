import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_400px_at_50%_40%,rgba(200,16,46,0.07),transparent_70%)]" />
      <p className="kicker">Error 404</p>
      <h1 className="mt-4 font-display text-[clamp(2.5rem,9vw,5rem)] font-bold tracking-tight text-ink">
        Lost the <span className="text-red">thread</span>.
      </h1>
      <p className="mt-4 max-w-[42ch] text-sm text-ink-mid">
        This page doesn&apos;t exist — or hasn&apos;t been crafted yet.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-hair-strong px-6 py-3.5 text-[13px] transition-colors hover:border-red hover:text-red"
      >
        Back to home
      </Link>
    </section>
  );
}
