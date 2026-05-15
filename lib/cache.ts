import type { LiveGolferRow } from "./types";

export interface ScoreCachePayload {
  eventName: string | null;
  lastUpdated: string | null;
  golfers: LiveGolferRow[];
  fetchedAt: number;
}

interface GlobalCacheStore {
  scoreCache?: ScoreCachePayload;
}

const globalStore = globalThis as typeof globalThis & GlobalCacheStore;

const CACHE_TTL_MS = 60_000;

export function getCachedScores(): ScoreCachePayload | null {
  const cache = globalStore.scoreCache;
  if (!cache) return null;
  if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) return null;
  return cache;
}

export function setCachedScores(payload: ScoreCachePayload): void {
  globalStore.scoreCache = payload;
}
