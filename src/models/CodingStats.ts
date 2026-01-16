import mongoose from "mongoose";

const CodingStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  platform: { type: String, enum: ["leetcode", "codechef", "codeforces"] },

  data: {
    rating: Number,
    globalRank: Number,
    problemsSolved: Number,
    contestRating: Number,
  },

  snapshotDate: { type: Date, default: Date.now }, 
});

export default mongoose.models.CodingStats || mongoose.model("CodingStats",CodingStatsSchema);