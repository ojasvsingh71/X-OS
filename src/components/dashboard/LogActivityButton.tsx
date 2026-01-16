"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogActivityButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Default to today
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    studyHours: 0,
    dsaSolved: 0,
    sleepHours: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/user/log-activity", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    setLoading(false);
    setIsOpen(false);
    router.refresh(); // Refresh dashboard to show new graph data
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Plus size={16} /> Log Today
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Log Activity</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">
                  Study Hours
                </label>
                <input
                  type="number"
                  value={formData.studyHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studyHours: Number(e.target.value),
                    })
                  }
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">
                  DSA Problems Solved
                </label>
                <input
                  type="number"
                  value={formData.dsaSolved}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dsaSolved: Number(e.target.value),
                    })
                  }
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">
                  Sleep (Hrs)
                </label>
                <input
                  type="number"
                  value={formData.sleepHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sleepHours: Number(e.target.value),
                    })
                  }
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white mt-1"
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium"
              >
                {loading ? "Saving..." : "Save Log"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
