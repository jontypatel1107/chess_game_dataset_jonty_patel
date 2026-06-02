const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");
const { protect, adminOnly } = require("../middlewares/auth");
const {
  Game,
  gamePopulate,
  listGames,
  makePgn,
} = require("../utils/apiHelpers");

const sendMatches = async (req, res, message, extraFilter = {}, sort = null) => {
  const { matches, pagination } = await listGames(req.query, extraFilter, sort);
  return paginatedResponse(res, message, matches, pagination);
};

// Public Match Explorers
router.get("/latest", asyncHandler((req, res) => sendMatches(req, res, "Latest matches fetched successfully", {}, { createdAt: -1 })));
router.get("/trending", asyncHandler((req, res) => sendMatches(req, res, "Trending matches fetched successfully", {}, { totalMoves: -1, updatedAt: -1 })));
router.get("/random", asyncHandler(async (req, res) => {
  const [match] = await Game.aggregate([{ $sample: { size: 1 } }]);
  const populated = match ? await Game.findById(match._id).populate(gamePopulate) : null;
  return successResponse(res, 200, "Random match fetched successfully", populated);
}));
router.get("/scroll", asyncHandler(async (req, res) => {
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || 10)));
  const filter = req.query.cursor ? { _id: { $gt: req.query.cursor } } : {};
  const matches = await Game.find(filter).populate(gamePopulate).sort({ _id: 1 }).limit(limit);
  return successResponse(res, 200, "Cursor matches fetched successfully", {
    matches,
    nextCursor: matches.length ? matches[matches.length - 1]._id : null,
  });
}));

// Filtered Lists (Public)
router.get("/filter/rated", asyncHandler((req, res) => sendMatches(req, res, "Rated matches fetched successfully", { rated: true })));
router.get("/filter/unrated", asyncHandler((req, res) => sendMatches(req, res, "Unrated matches fetched successfully", { rated: false })));
router.get("/filter/white-wins", asyncHandler((req, res) => sendMatches(req, res, "White wins fetched successfully", { result: "white_wins" })));
router.get("/filter/black-wins", asyncHandler((req, res) => sendMatches(req, res, "Black wins fetched successfully", { result: "black_wins" })));
router.get("/filter/rapid", asyncHandler((req, res) => sendMatches(req, res, "Rapid matches fetched successfully", { timeControl: "rapid" })));
router.get("/filter/blitz", asyncHandler((req, res) => sendMatches(req, res, "Blitz matches fetched successfully", { timeControl: "blitz" })));

// ─── PROTECTED OPERATIONS ─────────────────────────────────────
// Use protect for all creation/modification/bulk routes
router.post("/", protect, asyncHandler(async (req, res) => {
  const created = await Game.create(req.body);
  const match = await Game.findById(created._id).populate(gamePopulate);
  return successResponse(res, 201, "Match created successfully", match);
}));

router.post("/bulk-upload", protect, adminOnly, asyncHandler(async (req, res) => {
  const matches = Array.isArray(req.body) ? req.body : req.body.matches || [];
  const created = await Game.insertMany(matches, { ordered: false });
  return successResponse(res, 201, "Matches uploaded successfully", created);
}));

router.patch("/bulk-update", protect, adminOnly, asyncHandler(async (req, res) => {
  const { ids = [], update = {} } = req.body;
  const result = await Game.updateMany({ _id: { $in: ids } }, update);
  return successResponse(res, 200, "Matches updated successfully", result);
}));

router.delete("/bulk-delete", protect, adminOnly, asyncHandler(async (req, res) => {
  const { ids = [] } = req.body;
  const result = await Game.deleteMany({ _id: { $in: ids } });
  return successResponse(res, 200, "Matches deleted successfully", result);
}));

// Individual Match Operations
router.get("/:matchId", asyncHandler(async (req, res) => {
  const match = await Game.findById(req.params.matchId).populate(gamePopulate);
  return successResponse(res, 200, "Match fetched successfully", match);
}));

router.get("/:matchId/pgn", asyncHandler(async (req, res) => {
  const match = await Game.findById(req.params.matchId);
  return successResponse(res, 200, "PGN fetched successfully", { pgn: match ? makePgn(match) : "" });
}));

router.patch("/:matchId", protect, asyncHandler(async (req, res) => {
  const match = await Game.findByIdAndUpdate(req.params.matchId, req.body, { new: true, runValidators: true }).populate(gamePopulate);
  return successResponse(res, 200, "Match updated successfully", match);
}));

router.delete("/:matchId", protect, adminOnly, asyncHandler(async (req, res) => {
  await Game.findByIdAndDelete(req.params.matchId);
  return successResponse(res, 200, "Match deleted successfully", null);
}));

router.get("/", asyncHandler((req, res) => sendMatches(req, res, "Matches fetched successfully")));

module.exports = router;
