const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const { Game, User, makePgn, escapeRegExp } = require("../utils/apiHelpers");
const openings = require("../data/openings");

const recentSearches = [];
const remember = (type, q) => {
  if (q) recentSearches.unshift({ type, q, searchedAt: new Date() });
  if (recentSearches.length > 25) recentSearches.pop();
};

router.get("/matches", asyncHandler(async (req, res) => {
  remember("matches", req.query.q);
  const { skip, limit, page } = getPagination(req.query.page, req.query.limit);
  const regex = new RegExp(escapeRegExp(req.query.q || ""), "i");
  const all = await Game.find({}).populate("whitePlayer blackPlayer winner", "username rating").sort({ createdAt: -1 });
  const filtered = all.filter((game) => regex.test(makePgn(game)) || regex.test(game.moveText || "") || regex.test(game.opening?.name || "") || regex.test(game.opening?.eco || "") || regex.test(game.result || "") || regex.test(game.endReason || ""));
  return paginatedResponse(res, "Match search fetched successfully", filtered.slice(skip, skip + limit), buildPaginationMeta(filtered.length, page, limit));
}));
router.get("/players", asyncHandler(async (req, res) => {
  remember("players", req.query.q);
  const regex = new RegExp(escapeRegExp(req.query.q || ""), "i");
  const players = await User.find({ isActive: true, username: regex }).select("username rating gamesPlayed wins losses draws avatar country");
  return successResponse(res, 200, "Player search fetched successfully", players);
}));
router.get("/openings", asyncHandler(async (req, res) => {
  remember("openings", req.query.q);
  const regex = new RegExp(escapeRegExp(req.query.q || ""), "i");
  const datasetOpenings = await Game.aggregate([
    { $match: { $or: [{ "opening.name": regex }, { "opening.eco": regex }] } },
    { $group: { _id: { eco: "$opening.eco", name: "$opening.name" }, games: { $sum: 1 } } },
    { $project: { eco: "$_id.eco", name: "$_id.name", games: 1, source: "dataset", _id: 0 } },
    { $sort: { games: -1 } },
    { $limit: 50 },
  ]);
  return successResponse(res, 200, "Opening search fetched successfully", datasetOpenings);
}));
router.get("/eco", asyncHandler(async (req, res) => {
  remember("eco", req.query.q);
  const regex = new RegExp(escapeRegExp(req.query.q || ""), "i");
  const datasetOpenings = await Game.aggregate([
    { $match: { "opening.eco": regex } },
    { $group: { _id: { eco: "$opening.eco", name: "$opening.name" }, games: { $sum: 1 } } },
    { $project: { eco: "$_id.eco", name: "$_id.name", games: 1, source: "dataset", _id: 0 } },
    { $sort: { games: -1 } },
  ]);
  return successResponse(res, 200, "ECO search fetched successfully", datasetOpenings);
}));
router.get("/moves", asyncHandler(async (req, res) => {
  remember("moves", req.query.q);
  const sequence = String(req.query.q || "").split(/[,\s]+/).map((move) => move.trim()).filter(Boolean).join(" ");
  const matches = await Game.find({ moveText: new RegExp(escapeRegExp(sequence), "i") }).populate("whitePlayer blackPlayer", "username rating").limit(50);
  return successResponse(res, 200, "Move sequence search fetched successfully", matches);
}));
router.get("/fuzzy", asyncHandler(async (req, res) => {
  remember("fuzzy", req.query.q);
  const q = String(req.query.q || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const openingResults = openings.filter((opening) => opening.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q));
  return successResponse(res, 200, "Fuzzy search fetched successfully", openingResults);
}));
router.get("/autocomplete", asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const openingNames = openings.map((opening) => opening.name);
  const playerNames = (await User.find({ username: new RegExp(escapeRegExp(q), "i") }).select("username").limit(5)).map((user) => user.username);
  return successResponse(res, 200, "Autocomplete suggestions fetched successfully", [...openingNames, ...playerNames].filter((item) => item.toLowerCase().includes(q)).slice(0, 10));
}));
router.get("/recent", asyncHandler(async (req, res) => successResponse(res, 200, "Recent searches fetched successfully", recentSearches)));
router.get("/popular", asyncHandler(async (req, res) => successResponse(res, 200, "Popular searches fetched successfully", ["sicilian", "queen", "mate", "magnus", "rook"])));
router.get("/advanced", asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.result) filters.result = req.query.result;
  if (req.query.timeControl) filters.timeControl = req.query.timeControl;
  if (req.query.endReason) filters.endReason = req.query.endReason;
  if (req.query.rated !== undefined) filters.rated = req.query.rated === "true";
  if (req.query.opening) filters["opening.name"] = new RegExp(escapeRegExp(req.query.opening), "i");
  if (req.query.eco) filters["opening.eco"] = new RegExp(escapeRegExp(req.query.eco), "i");
  const matches = await Game.find(filters).populate("whitePlayer blackPlayer winner", "username rating");
  return successResponse(res, 200, "Advanced search fetched successfully", matches);
}));
router.get("/player-rating", asyncHandler(async (req, res) => {
  const rating = parseInt(req.query.rating || 0);
  const players = await User.find({ isActive: true, rating: { $gte: rating } }).select("username rating gamesPlayed");
  return successResponse(res, 200, "Player rating search fetched successfully", players);
}));
router.get("/date-range", asyncHandler(async (req, res) => {
  const matches = await Game.find({ createdAt: { $gte: new Date(req.query.from), $lte: new Date(req.query.to) } }).populate("whitePlayer blackPlayer winner", "username rating");
  return successResponse(res, 200, "Date range search fetched successfully", matches);
}));
router.get("/opening-family", asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  return successResponse(res, 200, "Opening family search fetched successfully", openings.filter((opening) => opening.family.toLowerCase().includes(q)));
}));
router.get("/checkmate-patterns", asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  return successResponse(res, 200, "Checkmate pattern search fetched successfully", openings.filter((opening) => opening.tags.includes("checkmate") || opening.name.toLowerCase().includes(q)));
}));
router.get("/endgames", asyncHandler(async (req, res) => successResponse(res, 200, "Endgame search fetched successfully", [
  { name: "Rook endgame", query: req.query.q, principles: ["active king", "rook behind passed pawn"] },
])));

module.exports = router;
