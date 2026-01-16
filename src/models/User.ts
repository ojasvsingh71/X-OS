import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },

    codingProfiles: {
      leetcode: { type: String, default: "" },
      codechef: { type: String, default: "" },
      codeforces: { type: String, default: "" },
    },
    stats: {
      leetcode: {
        totalSolved: { type: Number, default: 0 },
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
        ranking: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now },
      },
      codechef: {
        rating: { type: Number, default: 0 },
        rank: { type: String, default: "Unrated" },
        lastUpdated: { type: Date, default: Date.now },
      },
      codeforces: {
        rating: { type: Number, default: 0 },
        rank: { type: String, default: "Unrated" },
        lastUpdated: { type: Date, default: Date.now },
      },
    },
    academic: {
      targetCgpa: { type: Number, default: 0 },
    },
    dailyLogs: [
      {
        date: { type: String, required: true },
        studyHours: { type: Number, default: 0 },
        dsaSolved: { type: Number, default: 0 },
        sleepHours: { type: Number, default: 0 },
        exercises: [
          {
            name: { type: String, required: true },
            count: { type: String, required: true },
            unit: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
