"use client";

import { useLeaderboardPoll } from "@/lib/useLeaderboardPoll";
import type { LeaderboardResponse } from "@/lib/types";
import { LeaderboardMeta, LeaderboardTable } from "./LeaderboardTable";

export function LeaderboardClient({
  initialData,
}: {
  initialData: LeaderboardResponse;
}) {
  const { data, loading, error, refresh } = useLeaderboardPoll(initialData);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-emerald-200/70">
          Lower points is better · Best 5 of 7 count · MC/WD/DQ = 75 · Auto-updates
          every 30s
        </p>
        <button
          type="button"
          onClick={() => void refresh(true)}
          disabled={loading}
          className="shrink-0 rounded-lg border border-emerald-700/50 bg-emerald-900/40 px-3 py-1.5 text-sm text-emerald-100 transition hover:bg-emerald-800/50 disabled:opacity-50"
        >
          {loading ? "Updating…" : "Refresh now"}
        </button>
      </div>
      {error ? (
        <p className="mb-4 rounded-lg border border-red-800/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <LeaderboardMeta data={data} />
      <LeaderboardTable data={data} />
    </div>
  );
}

