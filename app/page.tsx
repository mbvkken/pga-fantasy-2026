import { LeaderboardClient } from "@/components/LeaderboardClient";
import { buildLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const leaderboard = await buildLeaderboard(false);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
          PGA Championship 2026
        </p>
        <h1 className="mt-1 text-3xl font-bold text-white">Fantasy Leaderboard</h1>
        <p className="mt-2 text-emerald-100/70">
          Tap a player to see their 7 picks and live stats.
        </p>
      </header>
      <LeaderboardClient initialData={leaderboard} />
    </main>
  );
}
