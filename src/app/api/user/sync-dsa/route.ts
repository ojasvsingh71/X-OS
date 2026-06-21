import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { fetchLeetCodeStats } from "@/lib/leetcode";
import { fetchCodeforcesStats } from "@/lib/codeforces";
import { fetchCodechefStats } from "@/lib/codechef";
import { syncMonkeytypeStatsForUser } from "@/lib/monkeytype";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updated = false;

    // 1. Sync LeetCode
    if (user.codingProfiles?.leetcode) {
      console.log(`[Sync] Bypassing cache to sync LeetCode for ${user.codingProfiles.leetcode}...`);
      const stats = await fetchLeetCodeStats(user.codingProfiles.leetcode, true);
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
          console.log(`[Sync] Automatically added ${diff} solved problems to today's log`);
        }

        user.stats.leetcode = {
          totalSolved: stats.totalSolved,
          easy: stats.easy,
          medium: stats.medium,
          hard: stats.hard,
          ranking: stats.ranking,
          lastUpdated: new Date(),
        };
        updated = true;
      }
    }

    // 2. Sync Codeforces
    if (user.codingProfiles?.codeforces) {
      console.log(`[Sync] Bypassing cache to sync Codeforces for ${user.codingProfiles.codeforces}...`);
      const stats = await fetchCodeforcesStats(user.codingProfiles.codeforces, true);
      if (stats) {
        user.stats.codeforces = {
          rating: stats.rating,
          rank: stats.rank,
          lastUpdated: new Date(),
        };
        updated = true;
      }
    }

    // 3. Sync CodeChef
    if (user.codingProfiles?.codechef) {
      console.log(`[Sync] Bypassing cache to sync CodeChef for ${user.codingProfiles.codechef}...`);
      const stats = await fetchCodechefStats(user.codingProfiles.codechef, true);
      if (stats) {
        user.stats.codechef = {
          rating: stats.rating,
          rank: stats.rank,
          lastUpdated: new Date(),
        };
        updated = true;
      }
    }

    // 4. Sync Monkeytype
    if (user.codingProfiles?.monkeytypeKey) {
      try {
        console.log(`[Sync] Syncing Monkeytype for user ${user.username}...`);
        await syncMonkeytypeStatsForUser(user);
        updated = true;
      } catch (err) {
        console.error("Monkeytype sync failed:", err);
      }
    }

    if (updated) {
      await user.save();
      return NextResponse.json({ message: "Sync successful" });
    }

    return NextResponse.json({ message: "No connected profiles to sync" });
  } catch (error: any) {
    console.error("[Sync] Error:", error.message);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
