import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import HabitsTracker from "@/components/dashboard/HabitsTracker";
import { syncGoogleFitStepsForUser } from "@/lib/googlefit";

export default async function HabitsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.id).select("-password");

  if (!user) redirect("/login");

  const params = await searchParams;
  if (params.sync === "googlefit" && user.googleFit?.connected) {
    try {
      await syncGoogleFitStepsForUser(user);
    } catch (err) {
      console.error("Auto-syncing steps failed:", err);
    }
  }

  const logs = JSON.parse(JSON.stringify(user.dailyLogs || []));
  const googleFitConnected = !!user.googleFit?.connected;

  return (
    <div className="min-h-screen pt-24 pb-24 md:pb-12 px-6 md:px-12 text-white">
      <Navbar username={user.username} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Life Log</h1>
        <p className="text-slate-400 mt-1">
          Track your sleep, habits, and workouts.
        </p>
      </div>

      <HabitsTracker initialLogs={logs} googleFitConnected={googleFitConnected} />
    </div>
  );
}
