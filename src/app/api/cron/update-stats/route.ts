import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { fetchLeetCodeStats } from "@/lib/leetcode";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const users = await User.find({ "codingProfiles.leetcode": { $ne: "" } });

    console.log(`[CRON] Starting update for ${users.length} users...`);
    let updatedCount = 0;

    for (const user of users) {
      try {
        const username = user.codingProfiles.leetcode;
        const stats = await fetchLeetCodeStats(username);

        if (stats) {
          user.stats.leetcode = {
            totalSolved: stats.totalSolved,
            easy: stats.easy,
            medium: stats.medium,
            hard: stats.hard,
            ranking: stats.ranking,
            lastUpdated: new Date(),
          };


          await user.save();
          updatedCount++;
          console.log(`[CRON] Updated ${username}`);
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
