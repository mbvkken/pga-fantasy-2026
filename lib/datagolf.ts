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
import type { LiveGolferRow } from "./types";

const DG_BASE = "https://feeds.datagolf.com";

function getApiKey(): string | undefined {
  return process.env.DATAGOLF_API_KEY?.trim() || undefined;
}

async function fetchDataGolf<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("DATAGOLF_API_KEY is not configured");
  }

  const url = new URL(`${DG_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("file_format", "json");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    next: { revalidate: 0 },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`DataGolf request failed (${response.status}) for ${path}`);
  }

  return (await response.json()) as T;
}

interface RawPlayerRow {
  dg_id?: number;
  dgId?: number;
  player_name?: string;
  playerName?: string;
  name?: string;
  current_pos?: string | number;
  current_pos_label?: string;
  position?: string | number;
  pos?: string | number;
  status?: string;
  player_status?: string;
  current_score?: number | string;
  total?: number | string;
  score?: number | string;
  today?: number | string;
  round_score?: number | string;
  thru?: number | string;
  round?: number | string;
  current_round?: number | string;
}

function pickField<T>(row: Record<string, unknown>, keys: string[]): T | undefined {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null) return value as T;
  }
  return undefined;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapRawRow(row: RawPlayerRow): LiveGolferRow {
  const record = row as Record<string, unknown>;
  const positionDisplayRaw =
    pickField<string | number>(record, [
      "current_pos",
      "current_pos_label",
      "position",
      "pos",
    ]) ?? null;

  const positionDisplay =
    positionDisplayRaw === null ? null : String(positionDisplayRaw);

  const inferred = inferStatusFromPositionDisplay(positionDisplay);
  const status =
    inferred ??
    normalizeStatus(
      pickField<string>(record, ["status", "player_status", "player_status_label"]),
    );

  const position =
    status === "cut" || status === "wd" || status === "dq"
      ? null
      : parsePosition(positionDisplay);

  return {
    dgId: pickField<number>(record, ["dg_id", "dgId"]) ?? null,
    name:
      pickField<string>(record, ["player_name", "playerName", "name"]) ??
      "Unknown",
    position: status === "cut" || status === "wd" || status === "dq" ? null : position,
    positionDisplay,
    status,
    scoreToPar: toNumber(
      pickField(record, ["current_score", "total", "score"]),
    ),
    today: toNumber(pickField(record, ["today", "round_score"])),
    thru: pickField(record, ["thru"]) ?? null,
    round: toNumber(pickField(record, ["round", "current_round"])),
  };
}

function extractRows(payload: unknown): RawPlayerRow[] {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.data)) return record.data as RawPlayerRow[];
  if (Array.isArray(record.players)) return record.players as RawPlayerRow[];
  if (Array.isArray(record.field)) return record.field as RawPlayerRow[];
  if (Array.isArray(payload)) return payload as RawPlayerRow[];

  return [];
}

function extractEventName(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const info = (payload as Record<string, unknown>).info;
  if (info && typeof info === "object") {
    const event = (info as Record<string, unknown>).event_name;
    if (typeof event === "string") return event;
  }
  const eventName = (payload as Record<string, unknown>).event_name;
  return typeof eventName === "string" ? eventName : null;
}

function extractLastUpdated(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const info = (payload as Record<string, unknown>).info;
  if (info && typeof info === "object") {
    const lastUpdate = (info as Record<string, unknown>).last_update;
    if (typeof lastUpdate === "string") return lastUpdate;
    if (typeof lastUpdate === "number") return new Date(lastUpdate).toISOString();
  }
  const updated = (payload as Record<string, unknown>).last_updated;
  if (typeof updated === "string") return updated;
  return null;
}

export async function fetchLiveLeaderboard(
  force = false,
): Promise<ScoreCachePayload> {
  if (!force) {
    const cached = getCachedScores();
    if (cached) return cached;
  }

  const payload = await fetchDataGolf<unknown>("/preds/in-play", { tour: "pga" });
  const golfers = extractRows(payload).map(mapRawRow);
  const result: ScoreCachePayload = {
    eventName: extractEventName(payload),
    lastUpdated: extractLastUpdated(payload) ?? new Date().toISOString(),
    golfers,
    fetchedAt: Date.now(),
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
  if (!getApiKey()) {
    return {
      payload: null,
      error: "Set DATAGOLF_API_KEY in your environment to enable live scoring.",
      unmatched: [],
    };
  }

  try {
    const payload = await fetchLiveLeaderboard(force);
    const lookup = buildGolferLookup(payload.golfers);
    const unmatched = allPickedGolferNames().filter(
      (name) => !matchGolfer(lookup, name),
    );

    return { payload, error: null, unmatched: [...new Set(unmatched)] };
  } catch (error) {
    const cached = getCachedScores();
    const message = error instanceof Error ? error.message : "Unknown DataGolf error";
    return {
      payload: cached,
      error: message,
      unmatched: [],
    };
  }
}
