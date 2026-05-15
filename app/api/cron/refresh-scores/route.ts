import { NextResponse } from "next/server";
import { buildLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leaderboard = await buildLeaderboard(true);
    return NextResponse.json({
      ok: true,
      lastUpdated: leaderboard.lastUpdated,
      participants: leaderboard.standings.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refresh failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
