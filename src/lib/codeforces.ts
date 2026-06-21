export async function fetchCodeforcesStats(username: string, forceRefresh = false) {
  try {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`, {
      cache: forceRefresh ? "no-store" : undefined,
      next: forceRefresh ? undefined : { revalidate: 3600 } // cache for 1 hour in Next.js
    });

    if (!response.ok) {
      console.error(`Codeforces API HTTP Error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.result || data.result.length === 0) {
      console.error(`Codeforces user ${username} not found.`);
      return null;
    }

    const info = data.result[0];
    return {
      rating: info.rating || info.maxRating || 0,
      rank: info.rank || "Unrated",
    };
  } catch (error) {
    console.error("Fetch Codeforces stats failed:", error);
    return null;
  }
}
