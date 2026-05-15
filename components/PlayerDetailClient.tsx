"use client";

import { useMemo } from "react";
import { useLeaderboardPoll } from "@/lib/useLeaderboardPoll";
import type { LeaderboardResponse, ParticipantStanding } from "@/lib/types";
import { PlayerPicksTable } from "./PlayerPicksTable";

export function PlayerDetailClient({
  playerId,
  initialStanding,
  initialLeaderboard,
}: {
  playerId: string;
  initialStanding: ParticipantStanding;
  initialLeaderboard: LeaderboardResponse;
}) {
  const { data, loading, error } = useLeaderboardPoll(initialLeaderboard);

  const standing = useMemo(
    () => data.standings.find((row) => row.id === playerId) ?? initialStanding,
    [data.standings, playerId, initialStanding],
  );

  return (
    <div>
      {loading ? (
        <p className="mb-4 text-sm text-emerald-400">Syncing live scores…</p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-2.5 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <PlayerPicksTable standing={standing} />
    </div>
  );
}
