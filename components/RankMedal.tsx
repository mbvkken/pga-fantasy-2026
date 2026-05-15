const MEDALS: Record<number, { emoji: string; label: string; ring: string }> = {
  1: {
    emoji: "🥇",
    label: "1st",
    ring: "ring-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.15)]",
  },
  2: {
    emoji: "🥈",
    label: "2nd",
    ring: "ring-zinc-300/40 shadow-[0_0_16px_rgba(212,212,216,0.12)]",
  },
  3: {
    emoji: "🥉",
    label: "3rd",
    ring: "ring-amber-700/50 shadow-[0_0_16px_rgba(180,83,9,0.12)]",
  },
};

export function RankMedal({ rank }: { rank: number }) {
  const medal = MEDALS[rank];

  if (medal) {
    return (
      <span
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20 text-lg ring-1 ${medal.ring}`}
        title={medal.label}
        aria-label={medal.label}
      >
        {medal.emoji}
      </span>
    );
  }

  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center font-mono text-sm font-medium text-emerald-400/90">
      {rank}
    </span>
  );
}
