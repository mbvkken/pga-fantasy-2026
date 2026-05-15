import Link from "next/link";
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
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">{standing.name}</h1>
          <p className="text-emerald-200/70">
            Total:{" "}
            <span className="font-mono text-xl text-white">
              {standing.totalPoints ?? "—"}
            </span>{" "}
            points · Rank #{standing.rank}
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-emerald-300 hover:text-emerald-100 hover:underline"
        >
          ← Back to leaderboard
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-900/40 bg-emerald-950/30">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-900/40 text-emerald-100">
            <tr>
              <th className="px-4 py-3">Pot</th>
              <th className="px-4 py-3">Golfer</th>
              <th className="px-4 py-3">Pos</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Points</th>
              <th className="hidden px-4 py-3 text-right sm:table-cell">Score</th>
              <th className="hidden px-4 py-3 text-right md:table-cell">Today</th>
              <th className="hidden px-4 py-3 text-right lg:table-cell">Thru</th>
            </tr>
          </thead>
          <tbody>
            {standing.picks.map((pick) => (
              <tr
                key={pick.group}
                className={`border-t border-emerald-900/30 ${
                  pick.countsTowardTotal ? "bg-emerald-900/25" : "opacity-80"
                }`}
              >
                <td className="px-4 py-3 font-mono text-emerald-300">{pick.group}</td>
                <td className="px-4 py-3 font-medium text-white">
                  {pick.golfer}
                  {pick.countsTowardTotal ? (
                    <span className="ml-2 text-xs text-emerald-400">counts</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-mono">{formatPosition(pick)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={pick.status} />
                </td>
                <td className="px-4 py-3 text-right font-mono text-white">
                  {pick.points ?? "—"}
                </td>
                <td className="hidden px-4 py-3 text-right font-mono sm:table-cell">
                  {formatScore(pick.scoreToPar)}
                </td>
                <td className="hidden px-4 py-3 text-right font-mono md:table-cell">
                  {formatScore(pick.today)}
                </td>
                <td className="hidden px-4 py-3 text-right font-mono lg:table-cell">
                  {pick.thru ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
