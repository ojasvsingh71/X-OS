import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Activity,
  ShieldCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="text-center max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
          Your Entire Life <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            One Operating System
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stop switching between LeetCode, Excel sheets, and habit trackers.
          X-OS unifies your academic grades, coding stats, and daily lifestyle
          into one powerful dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href="/register"
            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Get Started Free
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-slate-300 hover:text-white border border-white/10 hover:bg-white/5 transition-all backdrop-blur-sm"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-6xl w-full">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
          <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Academic Tracker
          </h3>
          <p className="text-slate-400 text-sm">
            Track CGPA/SGPA. Visualize your semester performance with
            interactive graphs.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
          <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 mb-4">
            <Code2 size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">DSA Stats Sync</h3>
          <p className="text-slate-400 text-sm">
            Connect LeetCode & CodeForces. Track your problem-solving streaks
            and contest ratings in real-time.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
          <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 mb-4">
            <Activity size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Lifestyle Log</h3>
          <p className="text-slate-400 text-sm">
            Monitor sleep cycles, gym consistency, and daily habits. Build
            streaks to stay disciplined.
          </p>
        </div>
      </div>

      <div className="mt-20 flex items-center gap-2 text-slate-500 text-sm">
        <ShieldCheck size={16} />
        <span>Secure. Private. Open Source.</span>
      </div>
    </div>
  );
}
