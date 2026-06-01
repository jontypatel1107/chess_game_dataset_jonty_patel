const mongoose = require("mongoose");

// Embedded move schema
const moveSchema = new mongoose.Schema(
  {
    moveNumber: { type: Number, required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    from: { type: String, required: true }, // e.g. "e2"
    to: { type: String, required: true },   // e.g. "e4"
    piece: { type: String, required: true }, // "pawn", "knight", etc.
    notation: { type: String },             // algebraic notation e.g. "e4"
    isCapture: { type: Boolean, default: false },
    isCheck: { type: Boolean, default: false },
    isCheckmate: { type: Boolean, default: false },
    isCastle: { type: Boolean, default: false },
    promotedTo: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    whitePlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "White player is required"],
      index: true,
    },
    blackPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Black player is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["waiting", "ongoing", "completed", "abandoned", "draw"],
      default: "waiting",
      index: true,
    },
    result: {
      type: String,
      enum: ["white_wins", "black_wins", "draw", "abandoned", null],
      default: null,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    endReason: {
      type: String,
      enum: [
        "checkmate",
        "resignation",
        "timeout",
        "stalemate",
        "threefold_repetition",
        "insufficient_material",
        "mutual_agreement",
        "abandoned",
        null,
      ],
      default: null,
    },
    moves: [moveSchema], // Embedded moves array
    moveText: { type: String, default: "" },
    totalMoves: { type: Number, default: 0 },
    timeControl: {
      type: String,
      enum: ["bullet", "blitz", "rapid", "classical", "unlimited"],
      default: "rapid",
    },
    timeLimit: { type: Number, default: 600 }, // in seconds
    currentTurn: {
      type: String,
      enum: ["white", "black"],
      default: "white",
    },
    boardState: { type: String, default: "" }, // FEN string
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      default: null,
    },
    ratingChange: {
      white: { type: Number, default: 0 },
      black: { type: Number, default: 0 },
    },
    source: { type: String, default: "app", index: true },
    sourceId: { type: String, default: null, index: true },
    rated: { type: Boolean, default: false },
    incrementCode: { type: String, default: "" },
    opening: {
      eco: { type: String, default: "" },
      name: { type: String, default: "" },
      ply: { type: Number, default: 0 },
    },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Compound index for player game lookup
gameSchema.index({ whitePlayer: 1, status: 1 });
gameSchema.index({ blackPlayer: 1, status: 1 });
gameSchema.index({ createdAt: -1 });
gameSchema.index({ source: 1, sourceId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Game", gameSchema);
