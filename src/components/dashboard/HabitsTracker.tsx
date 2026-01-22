"use client";

import { useState } from "react";
import { Trash2, Save, Activity, Moon, Plus } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";

type Exercise = { name: string; count: number; unit: string };
type DailyLog = { date: string; sleepHours: number; exercises: Exercise[] };

export default function HabitsTracker({
  initialLogs,
}: {
  initialLogs: DailyLog[];
}) {
  const router = useRouter();

  const [logs, setLogs] = useState<DailyLog[]>(initialLogs);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
  );
  const [sleep, setSleep] = useState<string>("");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [selectedMetric, setSelectedMetric] = useState("sleep");

  const availableMetrics = Array.from(
    new Set([
      "sleep",
      ...logs.flatMap((log) => log.exercises?.map((ex) => ex.name) || []),
    ]),
  );

  const addExerciseRow = () => {
    setExercises([...exercises, { name: "", count: 0, unit: "reps" }]);
  };

  const updateExercise = (
    index: number,
    field: keyof Exercise,
    value: string | number,
  ) => {
    const newEx = [...exercises];
    // @ts-ignore
    newEx[index] = { ...newEx[index], [field]: value };
    setExercises(newEx);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        date,
        sleepHours: Number(sleep) || 0,
        exercises: exercises.filter((e) => e.name && e.count > 0),
      };

      const res = await fetch("/api/user/log-activity", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");

      alert("Log Saved!");
      router.refresh(); 
    } catch (err) {
      alert("Error saving log.");
    } finally {
      setLoading(false);
    }
  };

  const graphData = logs
    .map((log) => {
      let value = 0;

      if (selectedMetric === "sleep") {
        value = log.sleepHours || 0;
      } else {
        const ex = log.exercises?.find((e) => e.name === selectedMetric);
        value = ex ? ex.count : 0;
      }

      return {
        name: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(new Date(log.date)),
        value: value,
      };
    })
    .slice(-14); 

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 h-fit shadow-xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
          <Activity className="text-blue-400" /> Log Activity
        </h2>

        <div className="space-y-5">
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              Date
            </label>    
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 mt-1 text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase font-bold flex items-center gap-2 tracking-wider">
              <Moon size={14} /> Sleep (Hours)
            </label>
            <input
              type="number"
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 mt-1 text-white outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. 7.5"
            />
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Exercises
              </label>
              <button
                onClick={addExerciseRow}
                className="text-xs flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded text-blue-300 transition-colors"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((ex, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    placeholder="Name (e.g. Pushups)"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    value={ex.name}
                    onChange={(e) => updateExercise(i, "name", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="0"
                    className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-blue-500 text-center"
                    value={ex.count}
                    onChange={(e) =>
                      updateExercise(i, "count", Number(e.target.value))
                    }
                  />
                  <button
                    onClick={() => removeExercise(i)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {exercises.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-2">
                  No exercises added yet.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save size={18} /> Save Log
              </>
            )}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col min-h-[500px] shadow-xl relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white">Performance Trends</h2>

          <div className="relative">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="appearance-none bg-black/40 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-sm text-blue-300 outline-none hover:border-blue-500/50 transition-colors cursor-pointer"
            >
              <option value="sleep">Sleep Hours</option>
              {availableMetrics
                .filter((m) => m !== "sleep")
                .map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-300">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full h-full min-h-[350px]">
          {graphData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Activity size={32} className="opacity-20" />
              <p>No data found for this metric.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={graphData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff10"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    color: "#f1f5f9",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#60a5fa" }}
                  formatter={(value: number) => [
                    value,
                    selectedMetric === "sleep" ? "Hours" : "Count",
                  ]}
                  cursor={{ stroke: "#ffffff20" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVal)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
