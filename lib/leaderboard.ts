import { buildPickResults, finalizeStandings } from "./scoring";
import { getParticipants, getTeamsData } from "./teams";
import { buildGolferLookup, getLiveScores, matchGolfer } from "./espn";
import type { LeaderboardResponse, LiveGolferRow, ParticipantStanding } from "./types";

function emptyGolfer(name: string): LiveGolferRow {
  return {
    espnId: null,
    name,
    position: null,
    positionDisplay: null,
    status: "not_started",
    scoreToPar: null,
    today: null,
    thru: null,
    round: null,
  };
}

export async function buildLeaderboard(force = false): Promise<LeaderboardResponse> {
  const teams = getTeamsData();
  const { payload, error, unmatched } = await getLiveScores(force);
  const lookup = payload ? buildGolferLookup(payload.golfers) : new Map();

  const standings: ParticipantStanding[] = getParticipants().map((participant) => {
    const golferMap = new Map<string, LiveGolferRow>();
    for (const pick of participant.picks) {
      golferMap.set(
        pick.golfer.toLowerCase(),
        matchGolfer(lookup, pick.golfer) ?? emptyGolfer(pick.golfer),
      );
    }

    const picks = buildPickResults(participant.picks, golferMap);
    const finalized = finalizeStandings(picks);

    return {
      id: participant.id,
      name: participant.name,
      rank: 0,
      totalPoints: finalized.totalPoints,
      countingPicks: finalized.picks.filter((pick) => pick.countsTowardTotal).length,
      picks: finalized.picks,
    };
  });

  standings.sort((a, b) => {
    if (a.totalPoints === null && b.totalPoints === null) {
      return a.name.localeCompare(b.name);
    }
    if (a.totalPoints === null) return 1;
    if (b.totalPoints === null) return -1;
    if (a.totalPoints !== b.totalPoints) return a.totalPoints - b.totalPoints;
    return a.name.localeCompare(b.name);
  });

  standings.forEach((standing, index) => {
    standing.rank = index + 1;
  });

  let dataSourceMessage: string | null = error;
  if (unmatched.length > 0) {
    const sample = unmatched.slice(0, 5).join(", ");
    const suffix = unmatched.length > 5 ? ` (+${unmatched.length - 5} more)` : "";
    dataSourceMessage = [
      dataSourceMessage,
      `Could not match golfers: ${sample}${suffix}. Check data/name-aliases.json.`,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return {
    tournament: teams.tournament,
    eventName: payload?.eventName ?? null,
    lastUpdated: payload?.lastUpdated ?? null,
    dataSource: payload ? (error ? "cached" : "espn") : "unavailable",
    dataSourceMessage,
    standings,
  };
}
