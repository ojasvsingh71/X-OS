import User from "@/models/User";

// Fetch personal bests from Monkeytype API
export async function fetchMonkeytypeStats(apiKey: string) {
  try {
    const response = await fetch("https://api.monkeytype.com/users/personalBests?mode=time", {
      headers: {
        Authorization: `ApeKey ${apiKey}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`Monkeytype API HTTP Error ${response.status}`);
      return null;
    }

    const json = await response.json();
    if (!json.data) {
      console.error("Monkeytype API returned error message:", json.message);
      return null;
    }

    let maxWpm = 0;
    let accuracy = 0;

    const timeData = json.data || {};
    const modes = ["15", "30", "60", "120"];
    
    modes.forEach((mode) => {
      const tests = timeData[mode];
      if (tests && tests.length > 0) {
        tests.forEach((test: any) => {
          if (test.wpm > maxWpm) {
            maxWpm = test.wpm;
            accuracy = test.acc;
          }
        });
      }
    });

    return {
      wpm: Math.round(maxWpm),
      accuracy: Math.round(accuracy),
    };
  } catch (error) {
    console.error("Fetch Monkeytype stats failed:", error);
    return null;
  }
}

// Fetch stats and log WPM in the user's dailyLog
export async function syncMonkeytypeStatsForUser(user: any) {
  const apiKey = user.codingProfiles?.monkeytypeKey;
  if (!apiKey) return 0;

  console.log(`[Monkeytype] Syncing typing speed stats for user ${user.username}...`);
  const stats = await fetchMonkeytypeStats(apiKey);

  if (stats) {
    user.stats.monkeytype = {
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      lastUpdated: new Date(),
    };

    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const existingLogIndex = user.dailyLogs.findIndex(
      (log: any) => log.date === todayStr
    );

    const wpmExercise = {
      name: "WPM",
      count: String(stats.wpm),
      unit: "wpm",
    };

    if (existingLogIndex > -1) {
      const targetLog = user.dailyLogs[existingLogIndex];
      const wpmExIndex = targetLog.exercises.findIndex(
        (ex: any) => ex.name === "WPM"
      );

      if (wpmExIndex > -1) {
        targetLog.exercises[wpmExIndex].count = String(stats.wpm);
      } else {
        targetLog.exercises.push(wpmExercise);
      }
    } else {
      user.dailyLogs.push({
        date: todayStr,
        studyHours: 0,
        dsaSolved: 0,
        sleepHours: 0,
        exercises: [wpmExercise],
      });
    }

    await user.save();
    console.log(`[Monkeytype] Successfully logged WPM ${stats.wpm} to ${user.username}'s log`);
    return stats.wpm;
  }
  return 0;
}
