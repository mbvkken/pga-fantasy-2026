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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-800/20 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200/70">
        <p>
          Lower points wins · Best 5 of 7 · MC/WD/DQ or worse than 67th = 75 · Updates every 30s
        </p>
        <button
          type="button"
          onClick={() => void refresh(true)}
          disabled={loading}
          className="shrink-0 rounded-lg border border-emerald-600/40 bg-emerald-800/30 px-3 py-1.5 text-sm font-medium text-emerald-50 transition hover:bg-emerald-700/40 disabled:opacity-50"
        >
          {loading ? "Updating…" : "Refresh"}
        </button>
      </div>
      {error ? (
        <p className="mb-4 rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-2.5 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <LeaderboardMeta data={data} loading={loading} />
      <LeaderboardTable data={data} />
    </div>
  );
}
