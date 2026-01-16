"use client";

import { useState } from "react";
import { Loader2, Link as LinkIcon } from "lucide-react";

export default function ConnectForm() {
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState("leetcode");
  const [usernameInput, setUsernameInput] = useState("");

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, username: usernameInput }),
      });
      if (!res.ok) throw new Error("Failed");
      alert(
        "Profile Linked! Please wait for the nightly Cron Job to fetch stats, or trigger it manually."
      );
      setUsernameInput("");
    } catch (error) {
      alert("Error linking profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl h-fit">
      <div className="flex items-center gap-2 mb-4 text-slate-200">
        <LinkIcon size={20} />
        <h2 className="font-semibold">Connect Profiles</h2>
      </div>

      <form onSubmit={handleConnect} className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full mt-2 bg-black/70 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-blue-500/50 transition-colors "
          >
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">CodeChef</option>
            <option value="codeforces">CodeForces</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Username / Handle
          </label>
          <input
            type="text"
            required
            placeholder="e.g. neetcode"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="w-full mt-2 bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600 text-slate-300"
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "Link Profile"
          )}
        </button>
      </form>
    </div>
  );
}
