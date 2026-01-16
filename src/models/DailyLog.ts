import mongoose from "mongoose";

const DailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, required: true },

  sleepTime: { type: Date },
  wakeTime: { type: Date },
  sleepDuration: { type: Number },

  habits: {
    gym: { type: Boolean, default: false },
    reading: { type: Boolean, default: false },
    coding: { type: Boolean, default: false },
  },

  activityLog: [
    {
      time: String,
      activity: String,
      duration: Number,
    },
  ],
});

export default mongoose.models.DailyLog ||
  mongoose.model("DailyLog", DailyLogSchema);
