const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/response");
const { Game, User, rate } = require("../utils/apiHelpers");

const dateGroup = (unit) => Game.aggregate([
  { $group: { _id: { $dateToString: { format: unit, date: "$createdAt" } }, count: { $sum: 1 } } },
  { $project: { date: "$_id", count: 1, _id: 0 } },
  { $sort: { date: 1 } },
]);

router.get("/total-matches", asyncHandler(async (req, res) => successResponse(res, 200, "Total matches fetched successfully", { total: await Game.countDocuments({}) })));
router.get("/total-players", asyncHandler(async (req, res) => successResponse(res, 200, "Total players fetched successfully", { total: await User.countDocuments({ isActive: true }) })));
router.get("/average-rating", asyncHandler(async (req, res) => {
  const [stats] = await User.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, averageRating: { $avg: "$rating" } } }]);
  return successResponse(res, 200, "Average rating fetched successfully", { averageRating: Number((stats?.averageRating || 0).toFixed(2)) });
}));
router.get("/top-openings", asyncHandler(async (req, res) => {
  const openings = await Game.aggregate([
    { $match: { "opening.name": { $ne: "" } } },
    { $group: { _id: { eco: "$opening.eco", name: "$opening.name" }, count: { $sum: 1 } } },
    { $project: { eco: "$_id.eco", name: "$_id.name", count: 1, _id: 0 } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  return successResponse(res, 200, "Top openings fetched successfully", openings);
}));
router.get("/checkmate-rate", asyncHandler(async (req, res) => successResponse(res, 200, "Checkmate rate fetched successfully", { rate: rate(await Game.countDocuments({ endReason: "checkmate" }), await Game.countDocuments({})) })));
router.get("/resignation-rate", asyncHandler(async (req, res) => successResponse(res, 200, "Resignation rate fetched successfully", { rate: rate(await Game.countDocuments({ endReason: "resignation" }), await Game.countDocuments({})) })));
router.get("/timeout-rate", asyncHandler(async (req, res) => successResponse(res, 200, "Timeout rate fetched successfully", { rate: rate(await Game.countDocuments({ endReason: "timeout" }), await Game.countDocuments({})) })));
router.get("/white-win-rate", asyncHandler(async (req, res) => successResponse(res, 200, "White win rate fetched successfully", { rate: rate(await Game.countDocuments({ result: "white_wins" }), await Game.countDocuments({})) })));
router.get("/black-win-rate", asyncHandler(async (req, res) => successResponse(res, 200, "Black win rate fetched successfully", { rate: rate(await Game.countDocuments({ result: "black_wins" }), await Game.countDocuments({})) })));
router.get("/draw-rate", asyncHandler(async (req, res) => successResponse(res, 200, "Draw rate fetched successfully", { rate: rate(await Game.countDocuments({ result: "draw" }), await Game.countDocuments({})) })));
router.get("/rated-games", asyncHandler(async (req, res) => successResponse(res, 200, "Rated games fetched successfully", { total: await Game.countDocuments({ rated: true }) })));
router.get("/unrated-games", asyncHandler(async (req, res) => successResponse(res, 200, "Unrated games fetched successfully", { total: await Game.countDocuments({ rated: false }) })));
router.get("/daily-games", asyncHandler(async (req, res) => successResponse(res, 200, "Daily games fetched successfully", await dateGroup("%Y-%m-%d"))));
router.get("/monthly-games", asyncHandler(async (req, res) => successResponse(res, 200, "Monthly games fetched successfully", await dateGroup("%Y-%m"))));
router.get("/yearly-games", asyncHandler(async (req, res) => successResponse(res, 200, "Yearly games fetched successfully", await dateGroup("%Y"))));

module.exports = router;
