"use client";

import Link from "next/link";
import type { LeaderboardResponse } from "@/lib/types";

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

export function LeaderboardMeta({ data }: { data: LeaderboardResponse }) {
  return (
    <div className="mb-6 flex flex-col gap-2 text-sm text-emerald-100/80 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-emerald-200/70">{data.eventName ?? data.tournament}</p>
        <p>Updated: {formatUpdated(data.lastUpdated)}</p>
      </div>
      {data.dataSourceMessage ? (
        <p className="rounded-lg border border-amber-700/40 bg-amber-950/40 px-3 py-2 text-amber-100">
          {data.dataSourceMessage}
        </p>
      ) : null}
    </div>
  );
}

export function LeaderboardTable({ data }: { data: LeaderboardResponse }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-900/40 bg-emerald-950/30 shadow-xl">
      <table className="w-full text-left text-sm">
        <thead className="bg-emerald-900/40 text-emerald-100">
          <tr>
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Player</th>
            <th className="px-4 py-3 font-semibold text-right">Points</th>
            <th className="hidden px-4 py-3 font-semibold text-right sm:table-cell">
              Counting
            </th>
          </tr>
        </thead>
        <tbody>
          {data.standings.map((row, index) => (
            <tr
              key={row.id}
              className={`border-t border-emerald-900/30 transition hover:bg-emerald-900/20 ${
                index < 2 ? "bg-emerald-900/10" : ""
              }`}
            >
              <td className="px-4 py-3 font-mono text-emerald-300">{row.rank}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/player/${row.id}`}
                  className="font-medium text-white hover:text-emerald-200 hover:underline"
                >
                  {row.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-right font-mono text-lg text-white">
                {formatPoints(row.totalPoints)}
              </td>
              <td className="hidden px-4 py-3 text-right text-emerald-200/80 sm:table-cell">
                {row.countingPicks}/5
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
