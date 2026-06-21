import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { fetchLeetCodeStats } from "@/lib/leetcode";
import { fetchCodeforcesStats } from "@/lib/codeforces";
import { fetchCodechefStats } from "@/lib/codechef";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const users = await User.find({
      $or: [
        { "codingProfiles.leetcode": { $ne: "" } },
        { "codingProfiles.codeforces": { $ne: "" } },
        { "codingProfiles.codechef": { $ne: "" } },
      ],
    });

    console.log(`[CRON] Starting update for ${users.length} users...`);
    let updatedCount = 0;

    for (const user of users) {
      try {
        let updatedUser = false;

        // Update LeetCode
        if (user.codingProfiles.leetcode) {
          const stats = await fetchLeetCodeStats(user.codingProfiles.leetcode);
          if (stats) {
            user.stats.leetcode = {
              totalSolved: stats.totalSolved,
              easy: stats.easy,
              medium: stats.medium,
              hard: stats.hard,
              ranking: stats.ranking,
              lastUpdated: new Date(),
            };
            updatedUser = true;
          }
        }

        // Update Codeforces
        if (user.codingProfiles.codeforces) {
          const stats = await fetchCodeforcesStats(user.codingProfiles.codeforces);
          if (stats) {
            user.stats.codeforces = {
              rating: stats.rating,
              rank: stats.rank,
              lastUpdated: new Date(),
            };
            updatedUser = true;
          }
        }

        // Update Codechef
        if (user.codingProfiles.codechef) {
          const stats = await fetchCodechefStats(user.codingProfiles.codechef);
          if (stats) {
            user.stats.codechef = {
              rating: stats.rating,
              rank: stats.rank,
              lastUpdated: new Date(),
            };
            updatedUser = true;
          }
        }

        if (updatedUser) {
          await user.save();
          updatedCount++;
          console.log(`[CRON] Updated stats for ${user.username}`);
        }
      } catch (err) {
        console.error(`[CRON] Failed to update user ${user.username}`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} users successfully.`,
    });
  } catch (error) {
    console.error("[CRON] Fatal Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
