import { LeaderboardClient } from "@/components/LeaderboardClient";
import { SiteHeader } from "@/components/SiteHeader";
import { buildLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const leaderboard = await buildLeaderboard(false);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <SiteHeader
        title="Fantasy Leaderboard"
        subtitle="Tap a player to see their 7 picks and live stats. Top 3 are on the podium."
      />
      <LeaderboardClient initialData={leaderboard} />
    </main>
  );
}
