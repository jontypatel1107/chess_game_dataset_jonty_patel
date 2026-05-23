const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const { Game, User, findUserByUsername, rate, escapeRegExp } = require("../utils/apiHelpers");

const publicUser = "username email rating gamesPlayed wins losses draws avatar country createdAt updatedAt";

router.get("/top-rated", asyncHandler(async (req, res) => {
  const players = await User.find({ isActive: true }).select(publicUser).sort({ rating: -1 }).limit(parseInt(req.query.limit || 10));
  return successResponse(res, 200, "Top rated players fetched successfully", players);
}));
router.get("/top-active", asyncHandler(async (req, res) => {
  const players = await User.find({ isActive: true }).select(publicUser).sort({ gamesPlayed: -1 }).limit(parseInt(req.query.limit || 10));
  return successResponse(res, 200, "Most active players fetched successfully", players);
}));
router.get("/top-winning", asyncHandler(async (req, res) => {
  const players = await User.find({ isActive: true }).select(publicUser).sort({ wins: -1 }).limit(parseInt(req.query.limit || 10));
  return successResponse(res, 200, "Highest winning players fetched successfully", players);
}));
router.get("/rating-range", asyncHandler(async (req, res) => {
  const min = parseInt(req.query.min || 0);
  const max = parseInt(req.query.max || 9999);
  const players = await User.find({ isActive: true, rating: { $gte: min, $lte: max } }).select(publicUser).sort({ rating: -1 });
  return successResponse(res, 200, "Players by rating range fetched successfully", players);
}));
router.get("/compare/:player1/:player2", asyncHandler(async (req, res) => {
  const [player1, player2] = await Promise.all([
    findUserByUsername(req.params.player1),
    findUserByUsername(req.params.player2),
  ]);
  return successResponse(res, 200, "Players compared successfully", {
    player1,
    player2,
    ratingDifference: player1.rating - player2.rating,
    gamesPlayedDifference: player1.gamesPlayed - player2.gamesPlayed,
  });
}));

router.get("/", asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req.query.page, req.query.limit);
  const filter = { isActive: true };
  if (req.query.search) filter.username = new RegExp(escapeRegExp(req.query.search), "i");
  const [players, total] = await Promise.all([
    User.find(filter).select(publicUser).sort({ rating: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return paginatedResponse(res, "Players fetched successfully", players, buildPaginationMeta(total, page, limit));
}));

router.get("/:username/history", asyncHandler(async (req, res) => {
  const user = await findUserByUsername(req.params.username);
  const { skip, limit, page } = getPagination(req.query.page, req.query.limit);
  const filter = { $or: [{ whitePlayer: user._id }, { blackPlayer: user._id }] };
  const [matches, total] = await Promise.all([
    Game.find(filter).populate("whitePlayer blackPlayer winner", "username rating").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Game.countDocuments(filter),
  ]);
  return paginatedResponse(res, "Player history fetched successfully", matches, buildPaginationMeta(total, page, limit));
}));
router.get("/:username/stats", asyncHandler(async (req, res) => {
  const user = await findUserByUsername(req.params.username);
  return successResponse(res, 200, "Player statistics fetched successfully", {
    gamesPlayed: user.gamesPlayed,
    wins: user.wins,
    losses: user.losses,
    draws: user.draws,
    winRate: rate(user.wins, user.gamesPlayed),
    lossRate: rate(user.losses, user.gamesPlayed),
    drawRate: rate(user.draws, user.gamesPlayed),
    rating: user.rating,
  });
}));
router.get("/:username/openings", asyncHandler(async (req, res) => successResponse(res, 200, "Player opening usage fetched successfully", [])));
router.get("/:username/rating-history", asyncHandler(async (req, res) => {
  const user = await findUserByUsername(req.params.username);
  return successResponse(res, 200, "Rating history fetched successfully", [{ rating: user.rating, date: user.updatedAt }]);
}));
router.get("/:username/win-rate", asyncHandler(async (req, res) => {
  const user = await findUserByUsername(req.params.username);
  return successResponse(res, 200, "Win rate fetched successfully", { winRate: rate(user.wins, user.gamesPlayed) });
}));
router.get("/:username/loss-rate", asyncHandler(async (req, res) => {
  const user = await findUserByUsername(req.params.username);
  return successResponse(res, 200, "Loss rate fetched successfully", { lossRate: rate(user.losses, user.gamesPlayed) });
}));
router.get("/:username/draw-rate", asyncHandler(async (req, res) => {
  const user = await findUserByUsername(req.params.username);
  return successResponse(res, 200, "Draw rate fetched successfully", { drawRate: rate(user.draws, user.gamesPlayed) });
}));
router.get("/:username/recent", asyncHandler(async (req, res) => {
  req.query.limit = req.query.limit || 5;
  const user = await findUserByUsername(req.params.username);
  const matches = await Game.find({ $or: [{ whitePlayer: user._id }, { blackPlayer: user._id }] })
    .populate("whitePlayer blackPlayer winner", "username rating")
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit));
  return successResponse(res, 200, "Recent matches fetched successfully", matches);
}));
router.get("/:username", asyncHandler(async (req, res) => {
  const user = await findUserByUsername(req.params.username);
  return successResponse(res, 200, "Player fetched successfully", user);
}));

module.exports = router;
