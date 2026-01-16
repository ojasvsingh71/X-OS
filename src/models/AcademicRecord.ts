import mongoose from "mongoose";

const AcademicRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  semester: { type: Number, required: true },
  sgpa: { type: Number },
  cgpa: { type: Number },

  subjects: [
    {
      name: { type: String },
      code: { type: String },
      credits: { type: Number },
      marks: { type: Number },
      grade: { type: String },
    },
  ],
});

export default mongoose.models.AcademicRecord ||
  mongoose.model("AcademicRecord", AcademicRecordSchema);
