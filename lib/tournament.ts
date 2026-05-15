import type { GolferStatus, LiveGolferRow } from "./types";

function isPenaltyStatus(status: GolferStatus): boolean {
  return status === "cut" || status === "wd" || status === "dq";
}

export function sortTournamentField(golfers: LiveGolferRow[]): LiveGolferRow[] {
  return [...golfers].sort((a, b) => {
    const aPenalty = isPenaltyStatus(a.status);
    const bPenalty = isPenaltyStatus(b.status);
    if (aPenalty !== bPenalty) return aPenalty ? 1 : -1;

    const aPos = a.position ?? 9999;
    const bPos = b.position ?? 9999;
    if (aPos !== bPos) return aPos - bPos;

    return a.name.localeCompare(b.name);
  });
}

export function formatTournamentPosition(row: LiveGolferRow): string {
  if (row.status === "cut" || row.status === "wd" || row.status === "dq") {
    return row.status.toUpperCase();
  }
  return row.positionDisplay ?? (row.position !== null ? String(row.position) : "—");
}
