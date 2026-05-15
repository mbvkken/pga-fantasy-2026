import Link from "next/link";
import { RankMedal } from "./RankMedal";
import { StatusBadge } from "./StatusBadge";
import type { ParticipantStanding } from "@/lib/types";

type Pick = ParticipantStanding["picks"][number];

function formatPosition(pick: Pick): string {
  if (pick.status === "cut" || pick.status === "wd" || pick.status === "dq") {
    return pick.status.toUpperCase();
  }
  return pick.positionDisplay ?? (pick.position !== null ? String(pick.position) : "—");
}

function formatScore(value: number | null): string {
  if (value === null) return "—";
  if (value === 0) return "E";
  return value > 0 ? `+${value}` : String(value);
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-sm text-white">{value}</p>
    </div>
  );
}

function PickCard({ pick }: { pick: Pick }) {
  return (
    <article
      className={`rounded-xl border border-emerald-800/30 p-4 ${
        pick.countsTowardTotal ? "bg-emerald-900/35" : "bg-emerald-950/20 opacity-90"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-900/50 font-mono text-sm font-semibold text-emerald-300">
            {pick.group}
          </span>
          <div className="min-w-0">
            <p className="font-medium leading-snug text-white">{pick.golfer}</p>
            {pick.countsTowardTotal ? (
              <span className="mt-1 inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                counts
              </span>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">
            Points
          </p>
          <p className="font-mono text-xl font-bold tabular-nums text-white">
            {pick.points ?? "—"}
          </p>
        </div>
        </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-emerald-800/25 pt-4">
        <StatCell label="Pos" value={formatPosition(pick)} />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">
            Status
          </p>
          <div className="mt-1">
            <StatusBadge status={pick.status} />
          </div>
        </div>
        <StatCell label="Score" value={formatScore(pick.scoreToPar)} />
        <StatCell label="Today" value={formatScore(pick.today)} />
        <StatCell label="Thru" value={pick.thru !== null ? String(pick.thru) : "—"} />
      </div>
    </article>
  );
}

export function PlayerPicksTable({ standing }: { standing: ParticipantStanding }) {
  const showMedal = standing.rank <= 3;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-emerald-950/80 to-[#07150f] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {showMedal ? <RankMedal rank={standing.rank} /> : null}
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {standing.name}
            </h1>
            <p className="mt-1 text-emerald-200/70">
              Rank{" "}
              <span className="font-mono font-semibold text-white">
                #{standing.rank}
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-emerald-400/80">
            Total points
          </p>
          <p className="font-mono text-4xl font-bold tabular-nums text-white">
            {standing.totalPoints ?? "—"}
          </p>
        </div>
      </div>

      {/* Mobile: all stats in cards */}
      <div className="space-y-3 sm:hidden">
        {standing.picks.map((pick) => (
          <PickCard key={pick.group} pick={pick} />
        ))}
      </div>

      {/* Desktop: full table */}
      <div className="hidden overflow-hidden rounded-2xl border border-emerald-800/30 bg-emerald-950/30 shadow-xl backdrop-blur-md sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-800/40 bg-emerald-900/30 text-xs uppercase tracking-wider text-emerald-300/80">
                <th className="px-4 py-3.5">Pot</th>
                <th className="px-4 py-3.5">Golfer</th>
                <th className="px-4 py-3.5">Pos</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Points</th>
                <th className="px-4 py-3.5 text-right">Score</th>
                <th className="px-4 py-3.5 text-right">Today</th>
                <th className="px-4 py-3.5 text-right">Thru</th>
              </tr>
            </thead>
            <tbody>
              {standing.picks.map((pick) => (
                <tr
                  key={pick.group}
                  className={`border-t border-emerald-900/25 transition ${
                    pick.countsTowardTotal
                      ? "bg-emerald-900/30"
                      : "bg-transparent opacity-75"
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-900/50 font-mono text-xs font-semibold text-emerald-300">
                      {pick.group}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-white">
                    {pick.golfer}
                    {pick.countsTowardTotal ? (
                      <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                        counts
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-emerald-100">
                    {formatPosition(pick)}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={pick.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-lg font-semibold text-white">
                    {pick.points ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-emerald-100/80">
                    {formatScore(pick.scoreToPar)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-emerald-100/80">
                    {formatScore(pick.today)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-emerald-100/80">
                    {pick.thru ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link
        href="/"
        className="inline-flex text-sm font-medium text-emerald-300 transition hover:text-white"
      >
        ← Back to leaderboard
      </Link>
    </div>
  );
}
