import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import AcademicRecord from "@/models/AcademicRecord";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const records = await AcademicRecord.find({ userId: session.id }).sort({ semester: 1 });
    const user = await User.findById(session.id).select("academic");

    return NextResponse.json({
      records,
      targetCgpa: user?.academic?.targetCgpa || 0,
    });
  } catch (error) {
    console.error("GET Academics Error:", error);
    return NextResponse.json({ error: "Failed to fetch academics records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { semester, sgpa, cgpa, subjects, targetCgpa } = body;

    await connectDB();

    // 1. Update Target CGPA if provided
    if (targetCgpa !== undefined) {
      await User.findByIdAndUpdate(session.id, {
        "academic.targetCgpa": Number(targetCgpa) || 0,
      });
    }

    // If only updating target CGPA and not a specific semester, return early
    if (semester === undefined) {
      return NextResponse.json({ message: "Target CGPA updated successfully" });
    }

    // 2. Add or Update Semester Record
    const semNumber = Number(semester);
    let record = await AcademicRecord.findOne({ userId: session.id, semester: semNumber });

    if (record) {
      record.sgpa = sgpa !== undefined ? Number(sgpa) : record.sgpa;
      record.cgpa = cgpa !== undefined ? Number(cgpa) : record.cgpa;
      record.subjects = subjects !== undefined ? subjects : record.subjects;
      await record.save();
    } else {
      record = await AcademicRecord.create({
        userId: session.id,
        semester: semNumber,
        sgpa: Number(sgpa) || 0,
        cgpa: Number(cgpa) || 0,
        subjects: subjects || [],
      });
    }

    return NextResponse.json({ message: "Semester logged successfully", record });
  } catch (error) {
    console.error("POST Academics Error:", error);
    return NextResponse.json({ error: "Failed to log academic record" }, { status: 500 });
  }
}
