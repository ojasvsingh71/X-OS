import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const scope = "https://www.googleapis.com/auth/fitness.activity.read";

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI) not configured inside .env.local" },
      { status: 500 }
    );
  }

  // Construct URL with access_type=offline and prompt=consent to ensure a refresh token is returned
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(
    scope
  )}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
