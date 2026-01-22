import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Navbar from "@/components/Navbar";
import ActivityGraph from "@/components/dashboard/ActivityGraph";
import LogActivityButton from "@/components/dashboard/LogActivityButton";

async function getUserData() {
  const session = await getSession();
  if (!session) return null;

  await connectDB();
  return await User.findById(session.id).select("-password");
}

export default async function Dashboard() {
  const user = await getUserData();

  if (!user) {
    redirect("/login");
  }

  const logs = user.dailyLogs || [];
  const daysMap = new Map();

  const getIndianDateKey = (date: Date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  logs.forEach((log: any) => {
    daysMap.set(log.date, log);
  });

  const graphData = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const dateKey = getIndianDateKey(d);

    const dateLabel = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(d);

    const log = daysMap.get(dateKey);

    graphData.push({
      name: dateLabel,
      dsa: log?.dsaSolved || 0,
      study: log?.studyHours || 0,
      sleep: log?.sleepHours || 0,
    });
  }

  const totalSleep = logs.reduce(
    (sum: number, log: any) => sum + (log.sleepHours || 0),
    0
  );

  const averageSleep =
    logs.length > 0 ? (totalSleep / logs.length).toFixed(2) : "0";

  return (
    <div className="min-h-screen pt-24 pb-24 md:pb-12 px-6 md:px-12 text-white">
      <Navbar username={user.username} />

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Your performance at a glance.</p>
        </div>
        <LogActivityButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl relative min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Activity Graph</h2>
            <div className="bg-black/40 border border-white/10 text-slate-300 text-xs font-medium rounded-lg px-3 py-1">
              Last 30 Days (IST)
            </div>
          </div>

          <div className="flex-1 w-full h-full min-h-[300px]">
            <ActivityGraph data={graphData} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">
              Quick Stats
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-slate-300">CGPA</span>
                <span className="text-xl font-bold">0.00</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-slate-300">LeetCode Solved</span>
                <span className="text-xl font-bold text-orange-400">
                  {user.stats?.leetcode?.totalSolved || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-300">Sleep Avg</span>
                <span
                  className={`text-xl font-bold ${
                    Number(averageSleep) >= 7
                      ? "text-green-400"
                      : "text-indigo-400"
                  }`}
                >
                  {averageSleep} hrs
                </span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6 shadow-xl">
            <h3 className="text-blue-200 text-sm font-medium mb-2">
              Today's Focus
            </h3>
            <p className="text-white font-semibold text-lg">
              "Consistency is the key to mastery."
            </p>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30 font-medium">
                DSA
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30 font-medium">
                Study
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
