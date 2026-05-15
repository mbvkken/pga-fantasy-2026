import { notFound } from "next/navigation";
import { PlayerDetailClient } from "@/components/PlayerDetailClient";
import { buildLeaderboard } from "@/lib/leaderboard";
import { getParticipantById } from "@/lib/teams";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const participant = getParticipantById(id);
  if (!participant) notFound();

  const leaderboard = await buildLeaderboard(false);
  const standing = leaderboard.standings.find((row) => row.id === id);
  if (!standing) notFound();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6">
      <PlayerDetailClient
        playerId={id}
        initialStanding={standing}
        initialLeaderboard={leaderboard}
      />
    </main>
  );
}
