"use client";

import Link from "next/link";
import { RankMedal } from "./RankMedal";
import type { LeaderboardResponse, ParticipantStanding } from "@/lib/types";

function formatPoints(points: number | null): string {
  if (points === null) return "—";
  return String(points);
}

function formatUpdated(iso: string | null): string {
  if (!iso) return "Unknown";
  try {
    return new Date(iso).toLocaleString("nb-NO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function rowStyles(rank: number): string {
  if (rank === 1) {
    return "bg-gradient-to-r from-amber-950/50 via-amber-900/20 to-transparent border-amber-700/30";
  }
  if (rank === 2) {
    return "bg-gradient-to-r from-zinc-800/40 via-zinc-900/20 to-transparent border-zinc-600/25";
  }
  if (rank === 3) {
    return "bg-gradient-to-r from-orange-950/40 via-amber-950/15 to-transparent border-amber-800/25";
  }
  return "border-emerald-900/25 hover:bg-emerald-900/15";
}

export function LeaderboardMeta({
  data,
  loading,
}: {
  data: LeaderboardResponse;
  loading?: boolean;
}) {
  return (
    <div className="mb-6 rounded-xl border border-emerald-800/25 bg-emerald-950/40 px-4 py-3 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/60 px-3 py-1 text-xs font-medium text-emerald-200">
          <span className="live-dot h-2 w-2 rounded-full bg-emerald-400" />
          Live · ESPN
        </span>
        <span className="text-sm text-emerald-100/70">
          {data.eventName ?? data.tournament}
        </span>
      </div>
      <p className="mt-2 text-sm text-emerald-200/60">
        Updated {formatUpdated(data.lastUpdated)}
        {loading ? <span className="ml-2 text-emerald-400">· syncing…</span> : null}
      </p>
      {data.dataSourceMessage ? (
        <p className="mt-3 rounded-xl border border-amber-700/40 bg-amber-950/50 px-4 py-2.5 text-sm text-amber-100">
          {data.dataSourceMessage}
        </p>
      ) : null}
    </div>
  );
}

function PodiumCard({ standing }: { standing: ParticipantStanding }) {
  const rank = standing.rank;
  const accent =
    rank === 1
      ? "from-amber-500/20 to-amber-950/40 border-amber-500/30"
      : rank === 2
        ? "from-zinc-400/15 to-zinc-950/40 border-zinc-400/25"
        : "from-orange-600/15 to-orange-950/40 border-orange-600/25";

  return (
    <Link
      href={`/player/${standing.id}`}
      className={`group flex flex-col items-center rounded-xl border bg-gradient-to-b p-4 text-center transition hover:scale-[1.02] hover:border-emerald-600/40 ${accent}`}
    >
      <RankMedal rank={rank} />
      <p className="mt-3 line-clamp-2 text-sm font-semibold text-white group-hover:text-emerald-100">
        {standing.name}
      </p>
      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">
        {formatPoints(standing.totalPoints)}
      </p>
      <p className="mt-0.5 text-xs text-emerald-200/50">points</p>
    </Link>
  );
}

export function LeaderboardTable({ data }: { data: LeaderboardResponse }) {
  const second = data.standings.find((row) => row.rank === 2);
  const first = data.standings.find((row) => row.rank === 1);
  const third = data.standings.find((row) => row.rank === 3);
  const showPodium = Boolean(first && second && third);

  return (
    <div className="space-y-6">
      {showPodium ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="order-2 sm:order-1 sm:pt-6">
            <PodiumCard standing={second!} />
          </div>
          <div className="order-1 sm:order-2">
            <PodiumCard standing={first!} />
          </div>
          <div className="order-3 sm:order-3 sm:pt-6">
            <PodiumCard standing={third!} />
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-emerald-800/30 bg-emerald-950/30 shadow-2xl shadow-black/30 backdrop-blur-md">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-emerald-800/40 bg-emerald-900/30 text-xs uppercase tracking-wider text-emerald-300/80">
              <th className="px-4 py-3.5 font-semibold">Rank</th>
              <th className="px-4 py-3.5 font-semibold">Player</th>
              <th className="px-4 py-3.5 text-right font-semibold">Points</th>
              <th className="hidden px-4 py-3.5 text-right font-semibold sm:table-cell">
                Counting
              </th>
            </tr>
          </thead>
          <tbody>
            {data.standings.map((row) => (
              <tr
                key={row.id}
                className={`border-t transition ${rowStyles(row.rank)}`}
              >
                <td className="px-4 py-3.5">
                  <RankMedal rank={row.rank} />
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    href={`/player/${row.id}`}
                    className="font-medium text-white transition hover:text-emerald-200"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className="font-mono text-lg font-semibold tabular-nums text-white">
                    {formatPoints(row.totalPoints)}
                  </span>
                </td>
                <td className="hidden px-4 py-3.5 text-right text-emerald-200/70 sm:table-cell">
                  <span className="rounded-md bg-emerald-900/40 px-2 py-0.5 font-mono text-xs">
                    {row.countingPicks}/5
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
