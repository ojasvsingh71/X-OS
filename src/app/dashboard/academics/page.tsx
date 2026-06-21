import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import AcademicRecord from "@/models/AcademicRecord";
import User from "@/models/User";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AcademicsTracker from "@/components/dashboard/AcademicsTracker";

export const dynamic = "force-dynamic";

export default async function AcademicsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  
  const user = await User.findById(session.id).select("username academic");
  if (!user) redirect("/login");

  const rawRecords = await AcademicRecord.find({ userId: session.id }).sort({ semester: 1 });
  const records = JSON.parse(JSON.stringify(rawRecords));
  const targetCgpa = user.academic?.targetCgpa || 0;

  return (
    <div className="min-h-screen pt-24 pb-24 md:pb-12 px-6 md:px-12 text-white">
      <Navbar username={user.username} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Academics Tracker</h1>
        <p className="text-slate-400 mt-1">
          Monitor your semester-wise CGPA & SGPA progression.
        </p>
      </div>

      <AcademicsTracker initialRecords={records} initialTargetCgpa={targetCgpa} />
    </div>
  );
}
