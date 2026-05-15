"use client";

import { formatScoreToPar } from "@/lib/format";
import { formatTournamentPosition } from "@/lib/tournament";
import { normalizeNameKey } from "@/lib/teams";
import type { LiveGolferRow } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

function GolferCard({
  row,
  isPick,
}: {
  row: LiveGolferRow;
  isPick: boolean;
}) {
  const today =
    row.today !== null && row.today !== undefined
      ? formatScoreToPar(row.today)
      : null;
  const thru = row.thru !== null && row.thru !== undefined ? String(row.thru) : null;

  return (
    <article
      className={`rounded-xl border border-emerald-800/30 p-3.5 ${
        isPick ? "bg-emerald-800/25" : "bg-emerald-950/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="w-9 shrink-0 font-mono text-sm font-semibold tabular-nums text-emerald-100">
            {formatTournamentPosition(row)}
          </span>
          <div className="min-w-0">
            <p className="font-medium leading-snug text-white">{row.name}</p>
            {isPick ? (
              <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                pool
              </span>
            ) : null}
          </div>
        </div>
        <p className="shrink-0 font-mono text-lg font-semibold tabular-nums text-white">
          {formatScoreToPar(row.scoreToPar)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-800/25 pt-3">
        <StatusBadge status={row.status} />
        <div className="flex gap-3 text-xs text-emerald-200/70">
          {today ? <span>Today {today}</span> : null}
          {thru ? <span>Thru {thru}</span> : null}
        </div>
      </div>
    </article>
  );
}

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

      <div className="max-h-[min(70vh,720px)] space-y-2 overflow-auto sm:hidden">
        {field.map((row) => (
          <GolferCard
            key={`${row.espnId ?? row.name}-mobile`}
            row={row}
            isPick={pickedSet.has(normalizeNameKey(row.name))}
          />
        ))}
      </div>

      <div className="hidden max-h-[min(70vh,720px)] overflow-auto rounded-2xl border border-emerald-800/30 bg-emerald-950/30 shadow-xl backdrop-blur-md sm:block">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-emerald-900/95 text-xs uppercase tracking-wider text-emerald-300/80 backdrop-blur-sm">
            <tr>
              <th className="px-3 py-3 font-semibold">Pos</th>
              <th className="px-3 py-3 font-semibold">Player</th>
              <th className="px-3 py-3 text-right font-semibold">Score</th>
              <th className="px-3 py-3 text-right font-semibold">Today</th>
              <th className="px-3 py-3 text-right font-semibold">Thru</th>
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
                  <td className="px-3 py-2.5 text-right font-mono text-emerald-100/80">
                    {formatScoreToPar(row.today)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-emerald-100/80">
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
