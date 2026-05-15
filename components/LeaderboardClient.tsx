"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLeaderboardPoll } from "@/lib/useLeaderboardPoll";
import type { LeaderboardResponse } from "@/lib/types";
import { LeaderboardMeta, LeaderboardTable } from "./LeaderboardTable";
import { TournamentLeaderboard } from "./TournamentLeaderboard";

const RULES_TEXT =
  "Lower points wins. Best 5 of 7 golfers count. Missed cut, WD, DQ, or worse than 67th place = 75 points. Leaderboard updates every 30 seconds.";

type TabId = "fantasy" | "tournament";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "fantasy", label: "Fantasy" },
  { id: "tournament", label: "PGA leaderboard" },
];

export function LeaderboardClient({
  initialData,
}: {
  initialData: LeaderboardResponse;
}) {
  const { data, loading, error, refresh } = useLeaderboardPoll(initialData);
  const [tab, setTab] = useState<TabId>("fantasy");
  const [rulesOpen, setRulesOpen] = useState(false);
  const rulesId = useId();
  const rulesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rulesOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (rulesRef.current && !rulesRef.current.contains(event.target as Node)) {
        setRulesOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [rulesOpen]);

  return (
    <div>
      <div
        className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-800/30 bg-emerald-950/50 p-1"
        role="tablist"
        aria-label="Leaderboard views"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition sm:px-5 ${
              tab === item.id
                ? "bg-emerald-700/50 text-white shadow-sm"
                : "text-emerald-200/70 hover:bg-emerald-900/40 hover:text-emerald-50"
            }`}
          >
            {item.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {tab === "fantasy" ? (
            <div ref={rulesRef} className="relative">
              <button
                type="button"
                onClick={() => setRulesOpen((open) => !open)}
                aria-expanded={rulesOpen}
                aria-controls={rulesId}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-600/40 bg-emerald-800/30 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-700/40"
                title="Scoring rules"
              >
                i
              </button>
              {rulesOpen ? (
                <div
                  id={rulesId}
                  role="dialog"
                  aria-label="Scoring rules"
                  className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-emerald-700/50 bg-emerald-950 px-4 py-3 text-left text-sm leading-relaxed text-emerald-100/90 shadow-xl shadow-black/40 sm:w-80"
                >
                  <p className="font-medium text-emerald-50">How scoring works</p>
                  <p className="mt-2">{RULES_TEXT}</p>
                </div>
              ) : null}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => void refresh(true)}
            disabled={loading}
            className="rounded-lg border border-emerald-600/40 bg-emerald-800/30 px-3 py-1.5 text-sm font-medium text-emerald-50 transition hover:bg-emerald-700/40 disabled:opacity-50"
          >
            {loading ? "Updating…" : "Refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-2.5 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <LeaderboardMeta data={data} loading={loading} />

      {tab === "fantasy" ? (
        <div role="tabpanel">
          <LeaderboardTable data={data} />
        </div>
      ) : (
        <div role="tabpanel">
          <TournamentLeaderboard
            field={data.tournamentField}
            pickedGolferKeys={data.pickedGolferKeys}
          />
        </div>
      )}
    </div>
  );
}
