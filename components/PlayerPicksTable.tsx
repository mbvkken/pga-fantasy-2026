import Link from "next/link";
import { RankMedal } from "./RankMedal";
import { StatusBadge } from "./StatusBadge";
import type { ParticipantStanding } from "@/lib/types";

function formatPosition(pick: ParticipantStanding["picks"][number]): string {
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

      <div className="overflow-hidden rounded-2xl border border-emerald-800/30 bg-emerald-950/30 shadow-xl backdrop-blur-md">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-emerald-800/40 bg-emerald-900/30 text-xs uppercase tracking-wider text-emerald-300/80">
              <th className="px-4 py-3.5">Pot</th>
              <th className="px-4 py-3.5">Golfer</th>
              <th className="px-4 py-3.5">Pos</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Points</th>
              <th className="hidden px-4 py-3.5 text-right sm:table-cell">Score</th>
              <th className="hidden px-4 py-3.5 text-right md:table-cell">Today</th>
              <th className="hidden px-4 py-3.5 text-right lg:table-cell">Thru</th>
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
                <td className="hidden px-4 py-3.5 text-right font-mono text-emerald-100/80 sm:table-cell">
                  {formatScore(pick.scoreToPar)}
                </td>
                <td className="hidden px-4 py-3.5 text-right font-mono text-emerald-100/80 md:table-cell">
                  {formatScore(pick.today)}
                </td>
                <td className="hidden px-4 py-3.5 text-right font-mono text-emerald-100/80 lg:table-cell">
                  {pick.thru ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
