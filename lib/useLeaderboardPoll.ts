"use client";

import { useCallback, useEffect, useState } from "react";
import type { LeaderboardResponse } from "./types";

const DEFAULT_POLL_MS = 30_000;

export function useLeaderboardPoll(
  initialData: LeaderboardResponse,
  pollMs = DEFAULT_POLL_MS,
) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = true) => {
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
    void refresh(true);

    const timer = window.setInterval(() => {
      void refresh(true);
    }, pollMs);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh, pollMs]);

  return { data, loading, error, refresh };
}
