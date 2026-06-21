"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SyncDsaButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/sync-dsa", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Sync failed");
      }

      const data = await res.json();
      alert(data.message || "Stats synced successfully!");
      router.refresh();
    } catch (error) {
      alert("Error syncing coding stats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="flex items-center gap-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
    >
      <RefreshCw
        size={16}
        className={`${loading ? "animate-spin text-blue-400" : "text-slate-400 group-hover:rotate-180 transition-transform duration-500"}`}
      />
      <span>{loading ? "Syncing..." : "Sync Profiles"}</span>
    </button>
  );
}
