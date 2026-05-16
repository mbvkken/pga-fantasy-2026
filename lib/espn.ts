import {
  inferStatusFromPositionDisplay,
  normalizeStatus,
  parsePosition,
} from "./scoring";
import {
  allPickedGolferNames,
  normalizeNameKey,
  resolveGolferName,
} from "./teams";
import { getCachedScores, setCachedScores, type ScoreCachePayload } from "./cache";
import type { GolferStatus, LiveGolferRow } from "./types";

const ESPN_SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";

interface EspnAthlete {
  displayName?: string;
  fullName?: string;
}

interface EspnCompetitorStatus {
  position?: { displayName?: string; isTie?: boolean };
  type?: { name?: string; state?: string; description?: string };
  thru?: number | string;
  displayValue?: string;
}

interface EspnLinescoreRound {
  period?: number;
  value?: number;
  displayValue?: string;
  linescores?: Array<unknown>;
}

interface EspnCompetitor {
  id?: string;
  order?: number;
  athlete?: EspnAthlete;
  score?: string;
  status?: EspnCompetitorStatus;
  linescores?: EspnLinescoreRound[];
}

interface EspnScoreboard {
  events?: Array<{
    id?: string;
    name?: string;
    date?: string;
    status?: { type?: { state?: string; description?: string } };
    competitions?: Array<{
      status?: { period?: number };
      competitors?: EspnCompetitor[];
    }>;
  }>;
}

function currentEventPeriod(event: NonNullable<EspnScoreboard["events"]>[0]): number | null {
  const period = event.competitions?.[0]?.status?.period;
  if (typeof period === "number" && Number.isFinite(period) && period > 0) {
    return period;
  }
  return null;
}

function linescoreForPeriod(
  rounds: EspnLinescoreRound[] | undefined,
  period: number | null,
): EspnLinescoreRound | null {
  if (!rounds || period === null) return null;
  return rounds.find((r) => r.period === period) ?? null;
}

/** ESPN appends a bare `{ period: N }` row for the next round before it starts. */
function isBarePeriodPlaceholder(round: EspnLinescoreRound): boolean {
  const keys = Object.keys(round).filter((k) => round[k as keyof EspnLinescoreRound] !== undefined);
  return keys.length === 1 && keys[0] === "period";
}

function roundHasLiveActivity(round: EspnLinescoreRound): boolean {
  const holes = round.linescores;
  if (Array.isArray(holes) && holes.length > 0) return true;
  const dv = String(round.displayValue ?? "").trim();
  return dv.length > 0 && dv !== "-";
}

const roundIsComplete = roundHasLiveActivity;

/** Advancing players get a linescore row for the next round; missed-cut players do not. */
function hasNextRoundSlot(
  rounds: EspnLinescoreRound[],
  eventPeriod: number,
): boolean {
  return rounds.some((r) => r.period === eventPeriod + 1);
}

/**
 * ESPN's main scoreboard omits status for most players. After a cut, MC players
 * have only completed rows for rounds 1..N and no placeholder for round N+1.
 */
function inferMissedCutFromLinescores(
  competitor: EspnCompetitor,
  eventPeriod: number | null,
): boolean {
  if (!eventPeriod || eventPeriod < 2) return false;

  const rounds = competitor.linescores ?? [];
  if (hasNextRoundSlot(rounds, eventPeriod)) return false;

  for (let period = 1; period <= eventPeriod; period += 1) {
    const round = linescoreForPeriod(rounds, period);
    if (!round || !roundIsComplete(round)) return false;
  }

  return rounds.length === eventPeriod;
}

function parseRoundRelativeToPar(displayValue: string | undefined): number | null {
  const raw = String(displayValue ?? "").trim();
  if (!raw || raw === "-" || raw === "—") return null;
  return parseScoreToPar(raw);
}

function parseScoreToPar(score: string | undefined): number | null {
  if (!score) return null;
  const raw = score.trim().toUpperCase();
  if (raw === "E") return 0;
  if (raw === "CUT" || raw === "MC" || raw === "WD" || raw === "DQ") return null;
  if (raw.startsWith("+")) {
    const parsed = Number.parseInt(raw.slice(1), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (raw.startsWith("-")) {
    const parsed = Number.parseInt(raw.slice(1), 10);
    return Number.isFinite(parsed) ? -parsed : null;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Whether the golfer has begun the tournament round that matches ESPN's
 * competition `status.period`. We must not use `linescores.at(-1)` because ESPN
 * appends a future-round placeholder row after the live round.
 */
function hasStartedCurrentRound(
  competitor: EspnCompetitor,
  eventPeriod: number | null,
): boolean {
  const rounds = competitor.linescores ?? [];
  const forPeriod = linescoreForPeriod(rounds, eventPeriod);
  if (forPeriod) {
    return roundHasLiveActivity(forPeriod);
  }

  const last = rounds.length > 0 ? rounds[rounds.length - 1] : null;
  if (last && !isBarePeriodPlaceholder(last)) {
    return roundHasLiveActivity(last);
  }
  if (rounds.length >= 2) {
    const prev = rounds[rounds.length - 2];
    return prev ? roundHasLiveActivity(prev) : false;
  }
  return false;
}

function inferStatusFromEspn(competitor: EspnCompetitor, eventPeriod: number | null): GolferStatus {
  const status = competitor.status;
  const positionDisplay = status?.position?.displayName ?? null;
  const fromPosition = inferStatusFromPositionDisplay(positionDisplay);
  if (fromPosition) return fromPosition;

  const typeName = status?.type?.name?.toLowerCase() ?? "";
  const typeDesc = status?.type?.description?.toLowerCase() ?? "";
  const typeState = status?.type?.state?.toLowerCase() ?? "";
  const scoreRaw = String(competitor.score ?? "").trim().toUpperCase();
  const display = (status?.displayValue ?? competitor.score ?? "").toUpperCase();

  if (
    typeName.includes("cut") ||
    typeDesc.includes("cut") ||
    scoreRaw === "CUT" ||
    scoreRaw === "MC" ||
    display === "CUT" ||
    display === "MC"
  ) {
    return "cut";
  }
  if (inferMissedCutFromLinescores(competitor, eventPeriod)) {
    return "cut";
  }
  if (typeName.includes("withdraw") || display === "WD") return "wd";
  if (typeName.includes("disqual") || display === "DQ") return "dq";
  if (typeName.includes("complete") || typeName.includes("finished")) {
    return "finished";
  }
  if (
    typeState === "pre" ||
    typeName.includes("scheduled") ||
    typeName.includes("pre")
  ) {
    return "not_started";
  }

  if (!hasStartedCurrentRound(competitor, eventPeriod)) {
    return "not_started";
  }

  return normalizeStatus(typeName || typeDesc || "active");
}

function formatPositionDisplay(position: number, isTie: boolean): string {
  return isTie ? `T${position}` : String(position);
}

function computeLeaderboardPositions(
  competitors: EspnCompetitor[],
  eventPeriod: number | null,
): Map<string, { position: number; positionDisplay: string }> {
  const active = competitors
    .map((competitor) => {
      const name = competitor.athlete?.displayName ?? competitor.athlete?.fullName;
      if (!name) return null;
      const status = inferStatusFromEspn(competitor, eventPeriod);
      if (status === "cut" || status === "wd" || status === "dq") return null;
      const scoreToPar = parseScoreToPar(competitor.score);
      if (scoreToPar === null) return null;
      return { id: competitor.id ?? name, name, scoreToPar };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  active.sort((a, b) => a.scoreToPar - b.scoreToPar);

  const positions = new Map<string, { position: number; positionDisplay: string }>();
  let index = 0;
  while (index < active.length) {
    const score = active[index].scoreToPar;
    let end = index + 1;
    while (end < active.length && active[end].scoreToPar === score) end += 1;
    const isTie = end - index > 1;
    const pos = index + 1;
    for (let i = index; i < end; i += 1) {
      const entry = active[i];
      positions.set(entry.id, {
        position: pos,
        positionDisplay: formatPositionDisplay(pos, isTie),
      });
    }
    index = end;
  }

  return positions;
}

function mapCompetitor(
  competitor: EspnCompetitor,
  positions: Map<string, { position: number; positionDisplay: string }>,
  eventPeriod: number | null,
): LiveGolferRow {
  const name =
    competitor.athlete?.displayName ??
    competitor.athlete?.fullName ??
    "Unknown";
  const id = competitor.id ?? name;
  const status = inferStatusFromEspn(competitor, eventPeriod);
  const positionInfo = positions.get(id);
  const espnPosition = competitor.status?.position?.displayName ?? null;
  const parsedEspnPosition =
    status === "cut" || status === "wd" || status === "dq"
      ? null
      : parsePosition(espnPosition);

  // Prefer score-derived tie position; ESPN status position is often stale or wrong mid-event.
  const position =
    status === "cut" || status === "wd" || status === "dq"
      ? null
      : (positionInfo?.position ?? parsedEspnPosition ?? null);

  const positionDisplay =
    status === "cut"
      ? "CUT"
      : status === "wd"
        ? "WD"
        : status === "dq"
          ? "DQ"
          : (positionInfo?.positionDisplay ?? espnPosition ?? null);

  const rounds = competitor.linescores ?? [];
  const eventRound = linescoreForPeriod(rounds, eventPeriod);
  const today = parseRoundRelativeToPar(eventRound?.displayValue);

  return {
    espnId: competitor.id ?? null,
    name,
    position,
    positionDisplay,
    status,
    scoreToPar: parseScoreToPar(competitor.score),
    today,
    thru: competitor.status?.thru ?? null,
    round: eventPeriod ?? (rounds.length > 0 ? rounds.length : null),
  };
}

async function fetchEspnScoreboard(): Promise<EspnScoreboard> {
  const response = await fetch(ESPN_SCOREBOARD, {
    next: { revalidate: 0 },
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`ESPN scoreboard request failed (${response.status})`);
  }

  return (await response.json()) as EspnScoreboard;
}

async function enrichCompetitorStatus(
  eventId: string,
  competitor: EspnCompetitor,
): Promise<EspnCompetitor> {
  if (competitor.status?.position?.displayName || competitor.status?.type?.name) {
    return competitor;
  }
  if (!competitor.id) return competitor;

  const url = `https://sports.core.api.espn.com/v2/sports/golf/leagues/pga/events/${eventId}/competitions/${eventId}/competitors/${competitor.id}/status?lang=en&region=us`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return competitor;
    const status = (await response.json()) as EspnCompetitorStatus;
    return { ...competitor, status };
  } catch {
    return competitor;
  }
}

async function enrichStatuses(
  eventId: string,
  competitors: EspnCompetitor[],
): Promise<EspnCompetitor[]> {
  const needsStatus = competitors.filter(
    (competitor) => competitor.id && !competitor.status?.type?.name,
  );
  if (needsStatus.length === 0) return competitors;

  const chunkSize = 30;
  const enriched = [...competitors];
  const indexById = new Map(
    competitors.map((competitor, index) => [competitor.id ?? "", index]),
  );

  for (let i = 0; i < needsStatus.length; i += chunkSize) {
    const chunk = needsStatus.slice(i, i + chunkSize);
    const updated = await Promise.all(
      chunk.map((competitor) => enrichCompetitorStatus(eventId, competitor)),
    );
    for (const competitor of updated) {
      const index = indexById.get(competitor.id ?? "");
      if (index !== undefined) enriched[index] = competitor;
    }
  }

  return enriched;
}

export async function fetchLiveLeaderboard(
  force = false,
): Promise<ScoreCachePayload> {
  if (!force) {
    const cached = getCachedScores();
    if (cached) return cached;
  }

  const scoreboard = await fetchEspnScoreboard();
  const event = scoreboard.events?.[0];
  if (!event?.competitions?.[0]?.competitors?.length) {
    throw new Error("ESPN scoreboard returned no active PGA tournament");
  }

  const eventPeriod = currentEventPeriod(event);
  let competitors = event.competitions[0].competitors;
  const eventId = event.id;

  if (eventId) {
    competitors = await enrichStatuses(eventId, competitors);
  }

  const positions = computeLeaderboardPositions(competitors, eventPeriod);
  const golfers = competitors.map((competitor) =>
    mapCompetitor(competitor, positions, eventPeriod),
  );

  const fetchedAt = Date.now();
  const result: ScoreCachePayload = {
    eventName: event.name ?? null,
    lastUpdated: new Date(fetchedAt).toISOString(),
    golfers,
    fetchedAt,
  };

  setCachedScores(result);
  return result;
}

export function buildGolferLookup(golfers: LiveGolferRow[]): Map<string, LiveGolferRow> {
  const lookup = new Map<string, LiveGolferRow>();

  for (const golfer of golfers) {
    lookup.set(normalizeNameKey(golfer.name), golfer);
  }

  return lookup;
}

export function matchGolfer(
  lookup: Map<string, LiveGolferRow>,
  pickedName: string,
): LiveGolferRow | undefined {
  const candidates = [pickedName, resolveGolferName(pickedName)];
  for (const candidate of candidates) {
    const hit = lookup.get(normalizeNameKey(candidate));
    if (hit) return hit;
  }

  const target = normalizeNameKey(resolveGolferName(pickedName));
  for (const [key, row] of lookup.entries()) {
    if (key.includes(target) || target.includes(key)) return row;
  }

  return undefined;
}

export async function getLiveScores(force = false): Promise<{
  payload: ScoreCachePayload | null;
  error: string | null;
  unmatched: string[];
}> {
  try {
    const payload = await fetchLiveLeaderboard(force);
    const lookup = buildGolferLookup(payload.golfers);
    const unmatched = allPickedGolferNames().filter(
      (name) => !matchGolfer(lookup, name),
    );

    return { payload, error: null, unmatched: [...new Set(unmatched)] };
  } catch (error) {
    const cached = getCachedScores();
    const message = error instanceof Error ? error.message : "Unknown ESPN error";
    return {
      payload: cached,
      error: message,
      unmatched: [],
    };
  }
}
