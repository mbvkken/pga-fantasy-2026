import { LeaderboardClient } from "@/components/LeaderboardClient";
import { SiteHeader } from "@/components/SiteHeader";
import { buildLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const leaderboard = await buildLeaderboard(false);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <SiteHeader
        title="PGA Championship 2026"
        subtitle="Fantasy pool leaderboard and live PGA standings — updates every 30 seconds."
      />
      <LeaderboardClient initialData={leaderboard} />
      <footer className="mt-10 border-t border-emerald-900/30 pt-6 text-center text-sm text-emerald-200/50">
        © {new Date().getFullYear()} Mathias Bakken
      </footer>
    </main>
  );
}
