import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { syncGoogleFitStepsForUser } from "@/lib/googlefit";

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

    if (!user.googleFit?.connected) {
      return NextResponse.json({ error: "Google Fit is not connected" }, { status: 400 });
    }

    console.log(`[API] Bypassing cache to sync Google Fit steps for ${user.username}...`);
    const steps = await syncGoogleFitStepsForUser(user);

    return NextResponse.json({
      message: `Steps synced successfully!`,
      steps: steps,
    });
  } catch (error: any) {
    console.error("[SyncFit] Error:", error.message);
    return NextResponse.json({ error: "Failed to sync steps" }, { status: 500 });
  }
}
