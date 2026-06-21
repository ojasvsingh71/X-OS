function calculateStars(rating: number): string {
  if (rating <= 0) return "Unrated";
  if (rating < 1400) return "1★";
  if (rating < 1600) return "2★";
  if (rating < 1800) return "3★";
  if (rating < 2000) return "4★";
  if (rating < 2200) return "5★";
  if (rating < 2500) return "6★";
  return "7★";
}

export async function fetchCodechefStats(username: string, forceRefresh = false) {
  // Try unofficial community API first
  try {
    const response = await fetch(`https://codechef-api.vercel.app/handle/${username}`, {
      cache: forceRefresh ? "no-store" : undefined,
      next: forceRefresh ? undefined : { revalidate: 3600 }
    });

    if (response.ok) {
      const json = await response.json();
      const rating = json.rating || json.currentRating || (json.data && (json.data.rating || json.data.currentRating));

      if (rating !== undefined) {
        const ratingNum = Number(rating) || 0;
        const stars = json.stars || (json.data && json.data.stars) || calculateStars(ratingNum);
        return {
          rating: ratingNum,
          rank: stars ? String(stars) : "Unrated",
        };
      }
    }
  } catch (apiError) {
    console.warn("CodeChef community API failed, falling back to scraping:", apiError);
  }

  // Fallback: scrape profile page directly
  try {
    const response = await fetch(`https://www.codechef.com/users/${username}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      cache: forceRefresh ? "no-store" : undefined,
      next: forceRefresh ? undefined : { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error(`CodeChef HTML Profile HTTP Error: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Look for rating number: e.g. <div class="rating-number">1657</div>
    const ratingMatch = html.match(/class="rating-number"[^>]*>\s*([0-9]+)\s*</i);
    const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;

    // Look for stars: e.g. <span class="rating">3★</span> or similar
    const starsMatch = html.match(/class="rating"[^>]*>\s*([1-7]★?|Unrated)\s*</i) || html.match(/\b([1-7]★)\b/);
    const rank = starsMatch ? starsMatch[1].trim() : calculateStars(rating);

    return {
      rating: rating || 0,
      rank: rank || "Unrated",
    };
  } catch (scrapeError) {
    console.error("Fetch CodeChef scraping fallback failed:", scrapeError);
    return null;
  }
}
