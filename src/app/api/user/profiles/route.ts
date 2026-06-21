import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { fetchLeetCodeStats } from "@/lib/leetcode";
import { fetchCodeforcesStats } from "@/lib/codeforces";
import { fetchCodechefStats } from "@/lib/codechef";
import { fetchMonkeytypeStats } from "@/lib/monkeytype";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { platform, username, apiKey } = await req.json();
    console.log(`[API] Attempting to link ${platform} for user ${username}...`);

    await connectDB();
    const user = await User.findById(session.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (platform === "leetcode") {
      user.codingProfiles.leetcode = username;

      console.log(`[API] Fetching stats for ${username}...`);
      const stats = await fetchLeetCodeStats(username);

      if (stats) {
        console.log(`[API] Stats found! Saving to DB...`, stats);

        user.stats.leetcode = {
          totalSolved: stats.totalSolved,
          easy: stats.easy,
          medium: stats.medium,
          hard: stats.hard,
          ranking: stats.ranking,
          lastUpdated: new Date(),
        };
      } else {
        console.error(`[API] Stats were NULL.`);
      }
    } else if (platform === "codeforces") {
      user.codingProfiles.codeforces = username;

      console.log(`[API] Fetching Codeforces stats for ${username}...`);
      const stats = await fetchCodeforcesStats(username);

      if (stats) {
        console.log(`[API] Codeforces stats found! Saving to DB...`, stats);

        user.stats.codeforces = {
          rating: stats.rating,
          rank: stats.rank,
          lastUpdated: new Date(),
        };
      } else {
        console.error(`[API] Codeforces stats were NULL.`);
      }
    } else if (platform === "codechef") {
      user.codingProfiles.codechef = username;

      console.log(`[API] Fetching CodeChef stats for ${username}...`);
      const stats = await fetchCodechefStats(username);

      if (stats) {
        console.log(`[API] CodeChef stats found! Saving to DB...`, stats);

        user.stats.codechef = {
          rating: stats.rating,
          rank: stats.rank,
          lastUpdated: new Date(),
        };
      } else {
        console.error(`[API] CodeChef stats were NULL.`);
      }
    } else if (platform === "monkeytype") {
      user.codingProfiles.monkeytype = username;
      user.codingProfiles.monkeytypeKey = apiKey || "";

      console.log(`[API] Fetching Monkeytype stats for ${username}...`);
      const stats = await fetchMonkeytypeStats(apiKey || "");

      if (stats) {
        console.log(`[API] Monkeytype stats found! Saving to DB...`, stats);

        user.stats.monkeytype = {
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          lastUpdated: new Date(),
        };
      } else {
        console.error(`[API] Monkeytype stats were NULL.`);
      }
    }

    const savedUser = await user.save();
    console.log(`[API] User saved successfully.`);

    return NextResponse.json({ message: "Profile linked" });
  } catch (error: any) {
    console.error("[API] Error:", error.message);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
