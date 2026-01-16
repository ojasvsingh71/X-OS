import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { studyHours, dsaSolved, sleepHours, exercises, date } =
      await req.json();

    await connectDB();
    const user = await User.findById(session.id);

    const existingLogIndex = user.dailyLogs.findIndex(
      (log: any) => log.date === date
    );

    if (existingLogIndex > -1) {
      user.dailyLogs[existingLogIndex].studyHours = studyHours;
      user.dailyLogs[existingLogIndex].dsaSolved = dsaSolved;
      user.dailyLogs[existingLogIndex].sleepHours = sleepHours;
      user.dailyLogs[existingLogIndex].exercises = exercises;
    } else {
      user.dailyLogs.push({
        date,
        studyHours,
        dsaSolved,
        sleepHours,
        exercises,
      });
    }

    await user.save();
    return NextResponse.json({ message: "Activity Logged" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}
