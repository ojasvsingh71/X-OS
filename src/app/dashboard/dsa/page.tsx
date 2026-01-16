export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import ConnectForm from "@/components/dsa/ConnectForm";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { Code2, Trophy, ExternalLink } from "lucide-react";
import { redirect } from "next/navigation";

const calculateWidth = (solved: number, total: number) => {
  const pct = (solved / total) * 100;
  return pct > 100 ? "100%" : `${pct}%`;
};

export default async function DSAPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.id).select("-password");

  const lcStats = user.stats?.leetcode || {
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  };
  const cfStats = user.stats?.codeforces || { rating: 0, rank: "Unrated" };

  const isLcConnected = !!user.codingProfiles?.leetcode;
  const isCfConnected = !!user.codingProfiles?.codeforces;
  const isCcconnected = !!user.codingProfiles?.codechef;

  const showConnectForm = !isLcConnected || !isCfConnected || !isCcconnected;

  return (
    <div className="min-h-screen pt-24 pb-24 md:pb-12 px-6 md:px-12 text-white">
      <Navbar username={user.username} />

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">DSA Tracker</h1>
          <p className="text-slate-400 mt-1">
            Monitor your problem-solving consistency.
          </p>
        </div>

        <a
          href="https://leetcode.com/problemset/all/"
          target="_blank"
          className="hidden md:flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Solve a Problem <ExternalLink size={14} />
        </a>
      </div>

      <div
        className={`grid grid-cols-1 ${
          showConnectForm ? "lg:grid-cols-3" : "lg:grid-cols-2"
        } gap-6`}
      >
        {showConnectForm && <ConnectForm />}

        <div
          className={
            showConnectForm
              ? "lg:col-span-2 space-y-6"
              : "col-span-1 lg:col-span-2 grid lg:grid-cols-2 gap-6 space-y-0"
          }
        >
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-all"></div>

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                  <Code2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">LeetCode</h3>
                  <p className="text-xs text-slate-400">
                    {isLcConnected
                      ? `@${user.codingProfiles.leetcode}`
                      : "Not Connected"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-3xl font-bold text-white">
                  {lcStats.totalSolved}
                </span>
                <span className="text-xs text-slate-400">Total Solved</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span className="text-teal-400">Easy</span>
                  <span>{lcStats.easy}</span>
                </div>
                <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400"
                    style={{ width: calculateWidth(lcStats.easy, 800) }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span className="text-yellow-400">Medium</span>
                  <span>{lcStats.medium}</span>
                </div>
                <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: calculateWidth(lcStats.medium, 1600) }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span className="text-red-400">Hard</span>
                  <span>{lcStats.hard}</span>
                </div>
                <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400"
                    style={{ width: calculateWidth(lcStats.hard, 700) }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all"></div>

            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">CodeForces</h3>
                  <p className="text-xs text-slate-400">
                    {isCfConnected
                      ? `@${user.codingProfiles.codeforces}`
                      : "Not Connected"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full border text-sm font-medium ${
                    cfStats.rating > 0
                      ? "bg-blue-900/30 border-blue-500 text-blue-300"
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  {cfStats.rank || "Unrated"}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">
                  {cfStats.rating}
                </div>
                <div className="text-xs text-slate-500">Max Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">--</div>
                <div className="text-xs text-slate-500">Contests</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
