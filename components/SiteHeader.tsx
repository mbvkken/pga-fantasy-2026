import Link from "next/link";

export function SiteHeader({
  title,
  subtitle,
  backHref,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <header className="relative mb-8 overflow-hidden rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-emerald-950/90 via-[#0a1f16] to-[#07150f] p-6 shadow-2xl shadow-black/40 sm:p-8">
      <HeaderGlow />
      <div className="relative">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-1 text-sm text-emerald-300/90 transition hover:text-white"
          >
            <span aria-hidden>←</span> Leaderboard
          </Link>
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
          PGA Championship 2026
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-100/65 sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}

function HeaderGlow() {
  return (
    <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
  );
}
