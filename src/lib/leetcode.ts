export async function fetchLeetCodeStats(username: string) {
  const query = `
    query userProblemsSolved($username: String!) {
      allQuestionsCount { difficulty count }
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum { difficulty count }
        }
        profile { ranking }
      }
    }
  `;

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) {
      console.error(`LeetCode API HTTP Error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.errors) {
      console.error(`LeetCode GraphQL Error for ${username}:`, data.errors);
      return null;
    }

    if (!data.data.matchedUser) {
      console.error(`LeetCode User ${username} not found.`);
      return null;
    }

    const stats = data.data.matchedUser.submitStats.acSubmissionNum;
    const ranking = data.data.matchedUser.profile.ranking;

    const result = {
      totalSolved: stats.find((s: any) => s.difficulty === "All")?.count || 0,
      easy: stats.find((s: any) => s.difficulty === "Easy")?.count || 0,
      medium: stats.find((s: any) => s.difficulty === "Medium")?.count || 0,
      hard: stats.find((s: any) => s.difficulty === "Hard")?.count || 0,
      ranking: ranking || 0,
    };

    console.log("LeetCode Fetch Success:", result); 
    return result;
  } catch (error) {
    console.error("Fetch failed hard:", error);
    return null;
  }
}
