import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { fetchLeetCodeStats } from "@/lib/leetcode";
import { fetchCodeforcesStats } from "@/lib/codeforces";
import { fetchCodechefStats } from "@/lib/codechef";
import { syncGoogleFitStepsForUser } from "@/lib/googlefit";
import { syncMonkeytypeStatsForUser } from "@/lib/monkeytype";

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
        { "codingProfiles.monkeytypeKey": { $ne: "" } },
        { "googleFit.connected": true },
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
            const previousTotal = user.stats?.leetcode?.totalSolved || 0;
            const newTotal = stats.totalSolved;

            if (previousTotal > 0 && newTotal > previousTotal) {
              const diff = newTotal - previousTotal;
              const todayStr = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(new Date());

              const existingLogIndex = user.dailyLogs.findIndex(
                (log: any) => log.date === todayStr
              );

              if (existingLogIndex > -1) {
                user.dailyLogs[existingLogIndex].dsaSolved =
                  (user.dailyLogs[existingLogIndex].dsaSolved || 0) + diff;
              } else {
                user.dailyLogs.push({
                  date: todayStr,
                  studyHours: 0,
                  dsaSolved: diff,
                  sleepHours: 0,
                  exercises: [],
                });
              }
              console.log(`[CRON] Automatically added ${diff} solved problems to ${user.username}'s log`);
            }

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

        // Update Google Fit Steps
        if (user.googleFit?.connected) {
          try {
            console.log(`[CRON] Syncing Google Fit steps for user ${user.username}...`);
            await syncGoogleFitStepsForUser(user);
            updatedUser = true;
          } catch (fitErr) {
            console.error(`[CRON] Failed to sync Google Fit steps for user ${user.username}`, fitErr);
          }
        }

        // Update Monkeytype WPM
        if (user.codingProfiles?.monkeytypeKey) {
          try {
            console.log(`[CRON] Syncing Monkeytype for user ${user.username}...`);
            await syncMonkeytypeStatsForUser(user);
            updatedUser = true;
          } catch (mErr) {
            console.error(`[CRON] Failed to sync Monkeytype for user ${user.username}`, mErr);
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
