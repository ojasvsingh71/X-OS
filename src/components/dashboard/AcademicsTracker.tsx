"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Save, GraduationCap, X, ChevronDown, ChevronUp } from "lucide-react";
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

type Subject = {
  name: string;
  code: string;
  credits: number;
  grade: string;
};

type AcademicRecord = {
  _id?: string;
  semester: number;
  sgpa: number;
  cgpa: number;
  subjects: Subject[];
};

const GRADE_POINTS: { [key: string]: number } = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5,
  "P": 4,
  "F": 0,
};

export default function AcademicsTracker({
  initialRecords,
  initialTargetCgpa,
}: {
  initialRecords: AcademicRecord[];
  initialTargetCgpa: number;
}) {
  const router = useRouter();
  const [records, setRecords] = useState<AcademicRecord[]>(initialRecords);
  const [targetCgpa, setTargetCgpa] = useState<number>(initialTargetCgpa);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(String(initialTargetCgpa));

  // Modal & Form State
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedSemesters, setExpandedSemesters] = useState<{ [key: number]: boolean }>({});

  const [semNumber, setSemNumber] = useState<number>(records.length + 1);
  const [quickSgpa, setQuickSgpa] = useState("");
  const [quickCgpa, setQuickCgpa] = useState("");
  const [useSubjectDetails, setUseSubjectDetails] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const toggleExpand = (sem: number) => {
    setExpandedSemesters((prev) => ({ ...prev, [sem]: !prev[sem] }));
  };

  const addSubjectRow = () => {
    setSubjects([...subjects, { name: "", code: "", credits: 4, grade: "O" }]);
  };

  const updateSubject = (index: number, field: keyof Subject, value: any) => {
    const updated = [...subjects];
    // @ts-ignore
    updated[index] = { ...updated[index], [field]: value };
    setSubjects(updated);
  };

  const removeSubjectRow = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const calculateSgpaFromSubjects = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    subjects.forEach((sub) => {
      if (sub.credits > 0 && sub.grade in GRADE_POINTS) {
        totalCredits += Number(sub.credits);
        totalPoints += Number(sub.credits) * GRADE_POINTS[sub.grade];
      }
    });
    return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
  };

  const handleSaveTarget = async () => {
    try {
      const res = await fetch("/api/user/academics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCgpa: Number(targetInput) }),
      });
      if (!res.ok) throw new Error("Failed");
      setTargetCgpa(Number(targetInput));
      setEditingTarget(false);
      router.refresh();
    } catch (err) {
      alert("Error updating target CGPA");
    }
  };

  const handleSaveSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalSgpa = 0;
      let finalCgpa = 0;

      if (useSubjectDetails) {
        finalSgpa = calculateSgpaFromSubjects();
        
        // Calculate cumulative CGPA automatically
        const totalPreviousCredits = records
          .filter((r) => r.semester !== semNumber)
          .reduce((sum, r) => sum + r.subjects.reduce((sSum, s) => sSum + Number(s.credits), 0), 0);
        
        const totalPreviousPoints = records
          .filter((r) => r.semester !== semNumber)
          .reduce((sum, r) => sum + r.subjects.reduce((sSum, s) => sSum + (Number(s.credits) * GRADE_POINTS[s.grade || "O"]), 0), 0);

        const currentSemCredits = subjects.reduce((sum, s) => sum + Number(s.credits), 0);
        const currentSemPoints = subjects.reduce((sum, s) => sum + (Number(s.credits) * GRADE_POINTS[s.grade || "O"]), 0);

        const totalCredits = totalPreviousCredits + currentSemCredits;
        const totalPoints = totalPreviousPoints + currentSemPoints;

        finalCgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : finalSgpa;
      } else {
        finalSgpa = Number(quickSgpa) || 0;
        finalCgpa = Number(quickCgpa) || 0;
      }

      const payload = {
        semester: semNumber,
        sgpa: finalSgpa,
        cgpa: finalCgpa,
        subjects: useSubjectDetails ? subjects.filter((s) => s.name.trim()) : [],
      };

      const res = await fetch("/api/user/academics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");

      alert("Semester Logged!");
      setIsOpen(false);
      // Reset form
      setQuickSgpa("");
      setQuickCgpa("");
      setSubjects([]);
      setUseSubjectDetails(false);
      router.refresh();
      
      // Reload page to refresh server components
      window.location.reload();
    } catch (err) {
      alert("Error saving academic record");
    } finally {
      setLoading(false);
    }
  };

  // Calculations for Summary
  const currentCgpa = records.length > 0 ? records[records.length - 1].cgpa : 0;
  const completedSemesters = records.length;
  const totalCredits = records.reduce(
    (sum, r) => sum + (r.subjects?.reduce((sSum, s) => sSum + Number(s.credits), 0) || 0),
    0
  );

  const graphData = records.map((r) => ({
    name: `Sem ${r.semester}`,
    SGPA: r.sgpa,
    CGPA: r.cgpa,
  }));

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Current CGPA</span>
          <h3 className="text-4xl font-extrabold text-white mt-2">
            {currentCgpa > 0 ? currentCgpa.toFixed(2) : "0.00"}
          </h3>
          <p className="text-slate-500 text-xs mt-1">out of 10.00</p>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Target CGPA</span>
            {!editingTarget && (
              <button onClick={() => setEditingTarget(true)} className="text-slate-400 hover:text-white p-0.5">
                <Edit2 size={14} />
              </button>
            )}
          </div>
          {editingTarget ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-lg w-20 outline-none"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
              />
              <button onClick={handleSaveTarget} className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded">
                <Save size={14} />
              </button>
              <button onClick={() => setEditingTarget(false)} className="text-slate-400 hover:text-white text-xs">
                Cancel
              </button>
            </div>
          ) : (
            <h3 className="text-4xl font-extrabold text-white mt-2">
              {targetCgpa > 0 ? targetCgpa.toFixed(2) : "0.00"}
            </h3>
          )}
          <p className="text-slate-500 text-xs mt-1">Goal settings</p>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Credits Earned</span>
          <h3 className="text-4xl font-extrabold text-white mt-2">{totalCredits}</h3>
          <p className="text-slate-500 text-xs mt-1">Across all courses</p>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Semesters Completed</span>
          <h3 className="text-4xl font-extrabold text-white mt-2">{completedSemesters}</h3>
          <p className="text-slate-500 text-xs mt-1">Active records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progression Trend Chart */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
            <GraduationCap className="text-blue-400" /> Academic Progression
          </h3>
          <div className="flex-1 w-full h-full min-h-[300px]">
            {graphData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No academic records yet. Log your first semester to view progression.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" domain={[0, 10]} tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      color: "#f1f5f9",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#60a5fa" }}
                  />
                  <Area type="monotone" dataKey="SGPA" stroke="#3b82f6" strokeWidth={3} fill="url(#colorSgpa)" />
                  <Area type="monotone" dataKey="CGPA" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorCgpa)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Semesters list & Quick add */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Logged Semesters</h3>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus size={14} /> Log Semester
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
            {records.map((rec) => {
              const isExpanded = !!expandedSemesters[rec.semester];
              return (
                <div key={rec.semester} className="border border-white/10 bg-black/20 rounded-2xl overflow-hidden transition-all">
                  <div
                    onClick={() => toggleExpand(rec.semester)}
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/5"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">Semester {rec.semester}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {rec.subjects?.length || 0} Subjects | {rec.subjects?.reduce((sum, s) => sum + Number(s.credits), 0) || 0} Credits
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">SGPA / CGPA</div>
                        <div className="font-semibold text-sm text-blue-400">
                          {rec.sgpa.toFixed(2)} / {rec.cgpa.toFixed(2)}
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && rec.subjects?.length > 0 && (
                    <div className="border-t border-white/5 p-4 bg-black/45 space-y-2 text-xs">
                      <div className="grid grid-cols-6 text-slate-400 font-bold border-b border-white/5 pb-1">
                        <div className="col-span-3">Course</div>
                        <div className="col-span-1 text-center">Code</div>
                        <div className="col-span-1 text-center">Credits</div>
                        <div className="col-span-1 text-center">Grade</div>
                      </div>
                      {rec.subjects.map((sub, idx) => (
                        <div key={idx} className="grid grid-cols-6 py-1 border-b border-white/5 last:border-b-0 text-slate-200">
                          <div className="col-span-3 font-medium truncate">{sub.name}</div>
                          <div className="col-span-1 text-center text-slate-400">{sub.code || "-"}</div>
                          <div className="col-span-1 text-center font-semibold">{sub.credits}</div>
                          <div className="col-span-1 text-center text-teal-400 font-bold">{sub.grade}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {records.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-12">
                No semesters logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Semester Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0f172a] border border-white/10 p-6 rounded-3xl w-full max-w-2xl shadow-2xl relative my-8">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Log Semester Result</h3>

            <form onSubmit={handleSaveSemester} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold">Semester</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={semNumber}
                    onChange={(e) => setSemNumber(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 mt-1 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={useSubjectDetails}
                      onChange={(e) => setUseSubjectDetails(e.target.checked)}
                      className="rounded bg-black/40 border-white/10 text-blue-600 focus:ring-0 w-4 h-4"
                    />
                    Add Subject-wise Details
                  </label>
                </div>
              </div>

              {!useSubjectDetails ? (
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold">SGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required={!useSubjectDetails}
                      value={quickSgpa}
                      onChange={(e) => setQuickSgpa(e.target.value)}
                      placeholder="e.g. 8.45"
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 mt-1 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold">Cumulative CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required={!useSubjectDetails}
                      value={quickCgpa}
                      onChange={(e) => setQuickCgpa(e.target.value)}
                      placeholder="e.g. 8.21"
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 mt-1 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-slate-400 uppercase font-bold">Subjects / Courses</label>
                    <button
                      type="button"
                      onClick={addSubjectRow}
                      className="text-xs bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded text-blue-300 transition-colors"
                    >
                      + Add Course
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {subjects.map((sub, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          placeholder="Course Name"
                          required
                          className="flex-3 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                          value={sub.name}
                          onChange={(e) => updateSubject(i, "name", e.target.value)}
                        />
                        <input
                          placeholder="Code"
                          className="w-20 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                          value={sub.code}
                          onChange={(e) => updateSubject(i, "code", e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Credits"
                          min="1"
                          max="10"
                          required
                          className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-blue-500 text-center"
                          value={sub.credits}
                          onChange={(e) => updateSubject(i, "credits", Number(e.target.value))}
                        />
                        <select
                          className="w-16 bg-black/70 border border-white/10 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-blue-500"
                          value={sub.grade}
                          onChange={(e) => updateSubject(i, "grade", e.target.value)}
                        >
                          {Object.keys(GRADE_POINTS).map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeSubjectRow(i)}
                          className="text-red-400 hover:text-red-300 p-1.5"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {subjects.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">
                        Add courses to calculate SGPA and CGPA automatically.
                      </p>
                    )}
                  </div>

                  {subjects.length > 0 && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-right text-xs text-slate-300">
                      Calculated SGPA:{" "}
                      <span className="font-bold text-sm text-teal-400">
                        {calculateSgpaFromSubjects()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/25 transition-all"
              >
                {loading ? "Saving..." : "Save Semester"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
