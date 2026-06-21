import User from "@/models/User";

// Get Asia/Kolkata start and end timestamps in milliseconds for today
export function getKolkataTodayMillis() {
  const now = new Date();
  
  // Format current date in Asia/Kolkata timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  const formattedDate = formatter.format(now); // "MM/DD/YYYY"
  const [m, d, y] = formattedDate.split("/");
  
  // Construct standard ISO-8601 strings with Kolkata offset (+05:30)
  const isoStrStart = `${y}-${m}-${d}T00:00:00+05:30`;
  const isoStrEnd = `${y}-${m}-${d}T23:59:59.999+05:30`;
  
  return {
    startMillis: new Date(isoStrStart).getTime(),
    endMillis: new Date(isoStrEnd).getTime(),
  };
}

// Refresh Google Fit Access Token if expired
export async function getGoogleFitAccessToken(user: any) {
  if (!user.googleFit?.connected) return null;

  const now = Date.now();
  // If accessToken is valid and expires in more than 60 seconds, reuse it
  if (user.googleFit.accessToken && user.googleFit.expiryDate > now + 60000) {
    return user.googleFit.accessToken;
  }

  const refreshToken = user.googleFit.refreshToken;
  if (!refreshToken) {
    console.error(`[GoogleFit] No refresh token found for user ${user.username}`);
    return null;
  }

  console.log(`[GoogleFit] Access token expired or expiring soon. Refreshing for user ${user.username}...`);

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error(`[GoogleFit] Token refresh failed:`, err);
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.access_token;
    const newExpiry = Date.now() + data.expires_in * 1000;

    // Save updated token details to MongoDB
    user.googleFit.accessToken = newAccessToken;
    user.googleFit.expiryDate = newExpiry;
    await user.save();

    console.log(`[GoogleFit] Token refreshed successfully for ${user.username}.`);
    return newAccessToken;
  } catch (error) {
    console.error("[GoogleFit] Refresh token error:", error);
    return null;
  }
}

// Fetch aggregate steps walked today
export async function fetchGoogleFitSteps(accessToken: string) {
  const url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";
  const { startMillis, endMillis } = getKolkataTodayMillis();

  const requestBody = {
    aggregateBy: [
      {
        dataTypeName: "com.google.step_count.delta",
        dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
      },
    ],
    bucketByTime: { durationMillis: 86400000 }, // 1 day bucket
    startTimeMillis: startMillis,
    endTimeMillis: endMillis,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[GoogleFit] Aggregate API HTTP Error ${response.status}:`, err);
      return 0;
    }

    const data = await response.json();
    let steps = 0;

    if (data.bucket && data.bucket.length > 0) {
      const bucket = data.bucket[0];
      if (bucket.dataset && bucket.dataset.length > 0) {
        const dataset = bucket.dataset[0];
        if (dataset.point && dataset.point.length > 0) {
          const point = dataset.point[0];
          if (point.value && point.value.length > 0) {
            steps = point.value[0].intVal || point.value[0].fpVal || 0;
          }
        }
      }
    }

    return Math.round(steps);
  } catch (error) {
    console.error("[GoogleFit] Error calling Fitness API:", error);
    return 0;
  }
}

// Fetch and write Google Fit steps to user's dailyLog
export async function syncGoogleFitStepsForUser(user: any) {
  if (!user.googleFit?.connected) return 0;

  const accessToken = await getGoogleFitAccessToken(user);
  if (!accessToken) {
    console.warn(`[GoogleFit] Could not obtain access token for user ${user.username}`);
    return 0;
  }

  console.log(`[GoogleFit] Syncing steps for user ${user.username}...`);
  const steps = await fetchGoogleFitSteps(accessToken);

  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const existingLogIndex = user.dailyLogs.findIndex(
    (log: any) => log.date === todayStr
  );

  const stepsExercise = {
    name: "Steps",
    count: String(steps),
    unit: "steps",
  };

  if (existingLogIndex > -1) {
    const targetLog = user.dailyLogs[existingLogIndex];
    const stepsExIndex = targetLog.exercises.findIndex(
      (ex: any) => ex.name === "Steps"
    );

    if (stepsExIndex > -1) {
      targetLog.exercises[stepsExIndex].count = String(steps);
    } else {
      targetLog.exercises.push(stepsExercise);
    }
  } else {
    user.dailyLogs.push({
      date: todayStr,
      studyHours: 0,
      dsaSolved: 0,
      sleepHours: 0,
      exercises: [stepsExercise],
    });
  }

  await user.save();
  console.log(`[GoogleFit] Successfully logged ${steps} steps for ${user.username}`);
  return steps;
}
