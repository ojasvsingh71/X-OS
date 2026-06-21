import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    
    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: "Google OAuth credentials not configured on server" }, { status: 500 });
    }

    console.log("[GoogleFit] Exchanging code for tokens...");

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("[GoogleFit] OAuth token exchange failed:", err);
      return NextResponse.json({ error: "OAuth token exchange failed" }, { status: 500 });
    }

    const tokens = await response.json();

    await connectDB();
    const user = await User.findById(session.id);
    
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Google only sends the refresh_token on the first authorization.
    // If the user is re-authorizing, we preserve their existing refresh token if none was returned.
    const refreshToken = tokens.refresh_token || user.googleFit?.refreshToken || "";

    user.googleFit = {
      connected: true,
      accessToken: tokens.access_token,
      refreshToken: refreshToken,
      expiryDate: Date.now() + tokens.expires_in * 1000,
    };

    await user.save();
    console.log(`[GoogleFit] Connected successfully for user: ${user.username}`);

    // Redirect the user back to the Habits tab
    return NextResponse.redirect(new URL("/dashboard/habits?sync=googlefit", req.url));
  } catch (error: any) {
    console.error("[GoogleFit] OAuth callback error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
