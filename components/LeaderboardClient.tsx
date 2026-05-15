"use client";

import { useCallback, useEffect, useState } from "react";
import type { LeaderboardResponse } from "@/lib/types";
import { LeaderboardMeta, LeaderboardTable } from "./LeaderboardTable";

const POLL_MS = 60_000;

export function LeaderboardClient({
  initialData,
}: {
  initialData: LeaderboardResponse;
}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = force ? "/api/leaderboard?force=1" : "/api/leaderboard";
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not refresh leaderboard");
      }
      const payload = (await response.json()) as LeaderboardResponse;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refresh(false);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-emerald-200/70">
          Lower points is better · Best 5 of 7 count · MC/WD/DQ = 75
        </p>
        <button
          type="button"
          onClick={() => void refresh(true)}
          disabled={loading}
          className="rounded-lg border border-emerald-700/50 bg-emerald-900/40 px-3 py-1.5 text-sm text-emerald-100 transition hover:bg-emerald-800/50 disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh now"}
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
