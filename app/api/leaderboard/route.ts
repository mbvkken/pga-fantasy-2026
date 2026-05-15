import { NextResponse } from "next/server";
import { buildLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";

  try {
    const leaderboard = await buildLeaderboard(force);
    return NextResponse.json(leaderboard);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to build leaderboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
