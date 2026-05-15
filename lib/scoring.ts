import type { GolferStatus, PickResult } from "./types";

export const PENALTY_POINTS = 75;

export function parsePosition(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  const raw = String(value).trim().toUpperCase();
  if (!raw || raw === "—" || raw === "-") return null;
  if (raw === "CUT" || raw === "MC" || raw === "WD" || raw === "DQ") return null;
  const match = raw.match(/T?(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function normalizeStatus(value: unknown): GolferStatus {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();
  if (["cut", "mc", "missed_cut", "missed cut"].includes(raw)) return "cut";
  if (["wd", "w/d", "withdrawn", "withdraw"].includes(raw)) return "wd";
  if (["dq", "disqualified", "disqual"].includes(raw)) return "dq";
  if (["finished", "complete", "done"].includes(raw)) return "finished";
  if (["not_started", "pre", "upcoming"].includes(raw)) return "not_started";
  return "active";
}

export function inferStatusFromPositionDisplay(
  positionDisplay: string | null,
): GolferStatus | null {
  if (!positionDisplay) return null;
  const raw = positionDisplay.trim().toUpperCase();
  if (raw === "CUT" || raw === "MC") return "cut";
  if (raw === "WD") return "wd";
  if (raw === "DQ") return "dq";
  return null;
}

export function pointsForGolfer(
  status: GolferStatus,
  position: number | null,
): number | null {
  if (status === "cut" || status === "wd" || status === "dq") {
    return PENALTY_POINTS;
  }
  if (position !== null) return position;
  return null;
}

export function computeTeamTotal(pickPoints: Array<number | null>): {
  total: number | null;
  countingIndexes: number[];
} {
  const indexed = pickPoints
    .map((points, index) => ({ points, index }))
    .filter((entry): entry is { points: number; index: number } => entry.points !== null);

  if (indexed.length === 0) {
    return { total: null, countingIndexes: [] };
  }

  indexed.sort((a, b) => a.points - b.points);
  const counting = indexed.slice(0, Math.min(5, indexed.length));
  const total = counting.reduce((sum, entry) => sum + entry.points, 0);

  return {
    total,
    countingIndexes: counting.map((entry) => entry.index),
  };
}

export function buildPickResults(
  picks: Array<{ group: number; golfer: string }>,
  golferByName: Map<string, import("./types").LiveGolferRow>,
): PickResult[] {
  return picks.map((pick) => {
    const live = golferByName.get(pick.golfer.toLowerCase());
    const status = live?.status ?? "not_started";
    const points = pointsForGolfer(status, live?.position ?? null);

    return {
      group: pick.group,
      golfer: pick.golfer,
      espnId: live?.espnId ?? null,
      position: live?.position ?? null,
      positionDisplay: live?.positionDisplay ?? null,
      status,
      points,
      countsTowardTotal: false,
      scoreToPar: live?.scoreToPar ?? null,
      today: live?.today ?? null,
      thru: live?.thru ?? null,
    };
  });
}

export function finalizeStandings(picks: PickResult[]): {
  totalPoints: number | null;
  picks: PickResult[];
} {
  const points = picks.map((pick) => pick.points);
  const { total, countingIndexes } = computeTeamTotal(points);
  const finalized = picks.map((pick, index) => ({
    ...pick,
    countsTowardTotal: countingIndexes.includes(index),
  }));
  return { totalPoints: total, picks: finalized };
}
