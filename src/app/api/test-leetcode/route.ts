import { NextResponse } from "next/server";
import { fetchLeetCodeStats } from "@/lib/leetcode";

export async function GET(req: Request) {
  // Get username from the URL query (e.g., ?username=neal_wu)
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Please provide a username parameter" });
  }

  const data = await fetchLeetCodeStats(username);

  return NextResponse.json({
    status: "Success",
    fetchedFor: username,
    data: data,
  });
}
