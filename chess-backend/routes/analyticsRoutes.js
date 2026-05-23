const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const { Game, User, rate } = require("../utils/apiHelpers");

const groupCount = async (field, match = {}) => Game.aggregate([
  { $match: match },
  { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  { $project: { label: "$_id", count: 1, _id: 0 } },
  { $sort: { count: -1 } },
]);

router.get("/top-games", asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req.query.page, req.query.limit);
  const [games, total] = await Promise.all([
    Game.find({}).populate("whitePlayer blackPlayer winner", "username rating").sort({ totalMoves: -1 }).skip(skip).limit(limit),
    Game.countDocuments({}),
  ]);
  return paginatedResponse(res, "Top games fetched successfully", games, buildPaginationMeta(total, page, limit));
}));
router.get("/victory-distribution", asyncHandler(async (req, res) => successResponse(res, 200, "Victory distribution fetched successfully", await groupCount("result"))));
router.get("/color-advantage", asyncHandler(async (req, res) => {
  const [white, black, draw, total] = await Promise.all([
    Game.countDocuments({ result: "white_wins" }),
    Game.countDocuments({ result: "black_wins" }),
    Game.countDocuments({ result: "draw" }),
    Game.countDocuments({}),
  ]);
  return successResponse(res, 200, "Color advantage fetched successfully", {
    whiteWinRate: rate(white, total),
    blackWinRate: rate(black, total),
    drawRate: rate(draw, total),
  });
}));
router.get("/turn-count-average", asyncHandler(async (req, res) => {
  const [stats] = await Game.aggregate([{ $group: { _id: null, averageTurns: { $avg: "$totalMoves" } } }]);
  return successResponse(res, 200, "Average turn count fetched successfully", { averageTurns: Number((stats?.averageTurns || 0).toFixed(2)) });
}));
router.get("/rated-vs-casual", asyncHandler(async (req, res) => successResponse(res, 200, "Rated vs casual fetched successfully", {
  rated: await Game.countDocuments({ "ratingChange.white": { $ne: 0 } }),
  casual: await Game.countDocuments({ "ratingChange.white": 0, "ratingChange.black": 0 }),
})));
router.get("/time-control-usage", asyncHandler(async (req, res) => successResponse(res, 200, "Time control usage fetched successfully", await groupCount("timeControl"))));
router.get("/shortest-games", asyncHandler(async (req, res) => successResponse(res, 200, "Shortest games fetched successfully", await Game.find({}).sort({ totalMoves: 1 }).limit(10).populate("whitePlayer blackPlayer", "username rating"))));
router.get("/longest-games", asyncHandler(async (req, res) => successResponse(res, 200, "Longest games fetched successfully", await Game.find({}).sort({ totalMoves: -1 }).limit(10).populate("whitePlayer blackPlayer", "username rating"))));
router.get("/rating-gap-upsets", asyncHandler(async (req, res) => successResponse(res, 200, "Rating gap upsets fetched successfully", [])));
router.get("/checkmate-frequency", asyncHandler(async (req, res) => {
  const total = await Game.countDocuments({});
  const checkmates = await Game.countDocuments({ endReason: "checkmate" });
  return successResponse(res, 200, "Checkmate frequency fetched successfully", { count: checkmates, rate: rate(checkmates, total) });
}));
router.get("/draw-frequency", asyncHandler(async (req, res) => {
  const total = await Game.countDocuments({});
  const draws = await Game.countDocuments({ result: "draw" });
  return successResponse(res, 200, "Draw frequency fetched successfully", { count: draws, rate: rate(draws, total) });
}));
router.get("/resignation-frequency", asyncHandler(async (req, res) => {
  const total = await Game.countDocuments({});
  const resignations = await Game.countDocuments({ endReason: "resignation" });
  return successResponse(res, 200, "Resignation frequency fetched successfully", { count: resignations, rate: rate(resignations, total) });
}));
router.get("/timeouts", asyncHandler(async (req, res) => {
  const total = await Game.countDocuments({});
  const timeouts = await Game.countDocuments({ endReason: "timeout" });
  return successResponse(res, 200, "Timeout analytics fetched successfully", { count: timeouts, rate: rate(timeouts, total) });
}));
router.get("/opening-success", asyncHandler(async (req, res) => successResponse(res, 200, "Opening success fetched successfully", [])));
router.get("/player-growth", asyncHandler(async (req, res) => {
  const players = await User.find({ isActive: true }).select("username rating gamesPlayed createdAt").sort({ createdAt: -1 }).limit(20);
  return successResponse(res, 200, "Player growth fetched successfully", players);
}));
router.get("/hourly-activity", asyncHandler(async (req, res) => {
  const data = await Game.aggregate([
    { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
    { $project: { hour: "$_id", count: 1, _id: 0 } },
    { $sort: { hour: 1 } },
  ]);
  return successResponse(res, 200, "Hourly activity fetched successfully", data);
}));

module.exports = router;
