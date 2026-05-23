const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    rating: { type: Number, required: true, default: 1200, index: true },
    rank: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    winStreak: { type: Number, default: 0 },
    bestRating: { type: Number, default: 1200 },
    category: {
      type: String,
      enum: ["bullet", "blitz", "rapid", "classical", "overall"],
      default: "overall",
      index: true,
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

leaderboardSchema.index({ rating: -1, category: 1 });

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
