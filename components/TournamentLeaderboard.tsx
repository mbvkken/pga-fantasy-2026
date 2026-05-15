"use client";

import { formatScoreToPar } from "@/lib/format";
import { formatTournamentPosition } from "@/lib/tournament";
import { normalizeNameKey } from "@/lib/teams";
import type { LiveGolferRow } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function TournamentLeaderboard({
  field,
  pickedGolferKeys,
}: {
  field: LiveGolferRow[];
  pickedGolferKeys: string[];
}) {
  const pickedSet = new Set(pickedGolferKeys);

  if (field.length === 0) {
    return (
      <p className="rounded-xl border border-emerald-800/30 bg-emerald-950/40 px-4 py-8 text-center text-sm text-emerald-200/70">
        Tournament leaderboard is not available right now.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-emerald-200/60">
        Live PGA Championship standings from ESPN. Golfers in your fantasy pool are
        highlighted.
      </p>
      <div className="max-h-[min(70vh,720px)] overflow-auto rounded-2xl border border-emerald-800/30 bg-emerald-950/30 shadow-xl backdrop-blur-md">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-emerald-900/95 text-xs uppercase tracking-wider text-emerald-300/80 backdrop-blur-sm">
            <tr>
              <th className="px-3 py-3 font-semibold">Pos</th>
              <th className="px-3 py-3 font-semibold">Player</th>
              <th className="px-3 py-3 text-right font-semibold">Score</th>
              <th className="hidden px-3 py-3 text-right font-semibold sm:table-cell">
                Today
              </th>
              <th className="hidden px-3 py-3 text-right font-semibold md:table-cell">
                Thru
              </th>
              <th className="px-3 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {field.map((row) => {
              const isPick = pickedSet.has(normalizeNameKey(row.name));
              return (
                <tr
                  key={`${row.espnId ?? row.name}`}
                  className={`border-t border-emerald-900/25 ${
                    isPick ? "bg-emerald-800/25" : "hover:bg-emerald-900/15"
                  }`}
                >
                  <td className="px-3 py-2.5 font-mono text-emerald-100">
                    {formatTournamentPosition(row)}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-white">
                    {row.name}
                    {isPick ? (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                        pool
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-white">
                    {formatScoreToPar(row.scoreToPar)}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right font-mono text-emerald-100/80 sm:table-cell">
                    {formatScoreToPar(row.today)}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right font-mono text-emerald-100/80 md:table-cell">
                    {row.thru ?? "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
