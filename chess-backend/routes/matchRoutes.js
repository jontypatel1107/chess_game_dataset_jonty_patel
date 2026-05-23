const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");
const {
  Game,
  User,
  gamePopulate,
  listGames,
  makePgn,
  escapeRegExp,
} = require("../utils/apiHelpers");

const sendMatches = async (req, res, message, extraFilter = {}, sort = null) => {
  const { matches, pagination } = await listGames(req.query, extraFilter, sort);
  return paginatedResponse(res, message, matches, pagination);
};

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
router.get("/infinite", asyncHandler((req, res) => sendMatches(req, res, "Infinite-scroll matches fetched successfully", {}, { createdAt: -1 })));

router.get("/filter/rated", asyncHandler((req, res) => sendMatches(req, res, "Rated matches fetched successfully", { "ratingChange.white": { $ne: 0 } })));
router.get("/filter/unrated", asyncHandler((req, res) => sendMatches(req, res, "Unrated matches fetched successfully", { "ratingChange.white": 0, "ratingChange.black": 0 })));
router.get("/filter/white-wins", asyncHandler((req, res) => sendMatches(req, res, "White wins fetched successfully", { result: "white_wins" })));
router.get("/filter/black-wins", asyncHandler((req, res) => sendMatches(req, res, "Black wins fetched successfully", { result: "black_wins" })));
router.get("/filter/draws", asyncHandler((req, res) => sendMatches(req, res, "Draw matches fetched successfully", { result: "draw" })));
router.get("/filter/checkmates", asyncHandler((req, res) => sendMatches(req, res, "Checkmate matches fetched successfully", { endReason: "checkmate" })));
router.get("/filter/resignations", asyncHandler((req, res) => sendMatches(req, res, "Resignation matches fetched successfully", { endReason: "resignation" })));
router.get("/filter/timeouts", asyncHandler((req, res) => sendMatches(req, res, "Timeout matches fetched successfully", { endReason: "timeout" })));
router.get("/filter/rapid", asyncHandler((req, res) => sendMatches(req, res, "Rapid matches fetched successfully", { timeControl: "rapid" })));
router.get("/filter/blitz", asyncHandler((req, res) => sendMatches(req, res, "Blitz matches fetched successfully", { timeControl: "blitz" })));
router.get("/filter/bullet", asyncHandler((req, res) => sendMatches(req, res, "Bullet matches fetched successfully", { timeControl: "bullet" })));
router.get("/filter/classical", asyncHandler((req, res) => sendMatches(req, res, "Classical matches fetched successfully", { timeControl: "classical" })));
router.get("/filter/high-rated", asyncHandler((req, res) => sendMatches(req, res, "High rated matches fetched successfully")));
router.get("/filter/low-rated", asyncHandler((req, res) => sendMatches(req, res, "Low rated matches fetched successfully")));
router.get("/filter/long-games", asyncHandler((req, res) => sendMatches(req, res, "Long games fetched successfully", { totalMoves: { $gte: 60 } })));

router.get("/sort/shortest", asyncHandler((req, res) => sendMatches(req, res, "Shortest matches fetched successfully", {}, { totalMoves: 1 })));
router.get("/sort/longest", asyncHandler((req, res) => sendMatches(req, res, "Longest matches fetched successfully", {}, { totalMoves: -1 })));
router.get("/sort/highest-rated", asyncHandler((req, res) => sendMatches(req, res, "Highest rated matches fetched successfully", {}, { createdAt: -1 })));

router.post("/bulk-upload", asyncHandler(async (req, res) => {
  const matches = Array.isArray(req.body) ? req.body : req.body.matches || [];
  const created = await Game.insertMany(matches, { ordered: false });
  return successResponse(res, 201, "Matches uploaded successfully", created);
}));
router.patch("/bulk-update", asyncHandler(async (req, res) => {
  const { ids = [], update = {} } = req.body;
  const result = await Game.updateMany({ _id: { $in: ids } }, update);
  return successResponse(res, 200, "Matches updated successfully", result);
}));
router.delete("/bulk-delete", asyncHandler(async (req, res) => {
  const { ids = [] } = req.body;
  const result = await Game.deleteMany({ _id: { $in: ids } });
  return successResponse(res, 200, "Matches deleted successfully", result);
}));
router.patch("/bulk/archive", asyncHandler(async (req, res) => {
  const { ids = [] } = req.body;
  const result = await Game.updateMany({ _id: { $in: ids } }, { isArchived: true });
  return successResponse(res, 200, "Matches archived successfully", result);
}));
router.patch("/bulk/restore", asyncHandler(async (req, res) => {
  const { ids = [] } = req.body;
  const result = await Game.updateMany({ _id: { $in: ids } }, { isArchived: false });
  return successResponse(res, 200, "Matches restored successfully", result);
}));

router.get("/", asyncHandler((req, res) => sendMatches(req, res, "Matches fetched successfully")));
router.post("/", asyncHandler(async (req, res) => {
  const created = await Game.create(req.body);
  const match = await Game.findById(created._id).populate(gamePopulate);
  return successResponse(res, 201, "Match created successfully", match);
}));

router.get("/:matchId/moves", asyncHandler(async (req, res) => {
  const match = await Game.findById(req.params.matchId).populate("moves.player", "username rating");
  return successResponse(res, 200, "Match moves fetched successfully", match ? match.moves : []);
}));
router.get("/:matchId/pgn", asyncHandler(async (req, res) => {
  const match = await Game.findById(req.params.matchId);
  return successResponse(res, 200, "PGN fetched successfully", { pgn: match ? makePgn(match) : "" });
}));
router.get("/:matchId/fen", asyncHandler(async (req, res) => {
  const match = await Game.findById(req.params.matchId);
  return successResponse(res, 200, "FEN fetched successfully", { fen: match ? match.boardState || "" : "" });
}));
router.get("/:matchId/analysis", asyncHandler(async (req, res) => {
  const match = await Game.findById(req.params.matchId);
  return successResponse(res, 200, "Analysis fetched successfully", {
    matchId: req.params.matchId,
    totalMoves: match ? match.totalMoves : 0,
    checks: match ? match.moves.filter((move) => move.isCheck).length : 0,
    captures: match ? match.moves.filter((move) => move.isCapture).length : 0,
    engine: "not_configured",
  });
}));
router.patch("/:matchId/archive", asyncHandler(async (req, res) => {
  const match = await Game.findByIdAndUpdate(req.params.matchId, { isArchived: true }, { new: true }).populate(gamePopulate);
  return successResponse(res, 200, "Match archived successfully", match);
}));
router.patch("/:matchId/restore", asyncHandler(async (req, res) => {
  const match = await Game.findByIdAndUpdate(req.params.matchId, { isArchived: false }, { new: true }).populate(gamePopulate);
  return successResponse(res, 200, "Match restored successfully", match);
}));
router.get("/:matchId", asyncHandler(async (req, res) => {
  const match = await Game.findById(req.params.matchId).populate(gamePopulate);
  return successResponse(res, 200, "Match fetched successfully", match);
}));
router.put("/:matchId", asyncHandler(async (req, res) => {
  const match = await Game.findByIdAndUpdate(req.params.matchId, req.body, { new: true, overwrite: true, runValidators: true }).populate(gamePopulate);
  return successResponse(res, 200, "Match replaced successfully", match);
}));
router.patch("/:matchId", asyncHandler(async (req, res) => {
  const match = await Game.findByIdAndUpdate(req.params.matchId, req.body, { new: true, runValidators: true }).populate(gamePopulate);
  return successResponse(res, 200, "Match updated successfully", match);
}));
router.delete("/:matchId", asyncHandler(async (req, res) => {
  await Game.findByIdAndDelete(req.params.matchId);
  return successResponse(res, 200, "Match deleted successfully", null);
}));

module.exports = router;
