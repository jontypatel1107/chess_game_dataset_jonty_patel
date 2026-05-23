const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tournament name is required"],
      trim: true,
      index: true,
    },
    description: { type: String, default: "" },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    format: {
      type: String,
      enum: ["round_robin", "swiss", "knockout", "double_elimination"],
      default: "swiss",
    },
    timeControl: {
      type: String,
      enum: ["bullet", "blitz", "rapid", "classical"],
      default: "rapid",
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
      index: true,
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: [2, "At least 2 players required"],
      max: [256, "Max 256 players allowed"],
    },
    registeredPlayers: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        registeredAt: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
      },
    ],
    games: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
    startDate: { type: Date, required: [true, "Start date is required"] },
    endDate: { type: Date, default: null },
    prizePool: { type: Number, default: 0 },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    minRating: { type: Number, default: 0 },
    maxRating: { type: Number, default: 9999 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tournamentSchema.index({ startDate: 1 });
tournamentSchema.index({ status: 1, startDate: 1 });

module.exports = mongoose.model("Tournament", tournamentSchema);
