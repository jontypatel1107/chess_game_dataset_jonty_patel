const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const openings = require("../data/openings");
const Game = require("../models/Game");

const contains = (opening, q) => {
  const query = String(q || "").toLowerCase();
  return [opening.name, opening.eco, opening.family, opening.moves, ...(opening.tags || [])]
    .join(" ")
    .toLowerCase()
    .includes(query);
};

const sendOpenings = (res, message, data) => successResponse(res, 200, message, data);
const datasetPopularOpenings = (limit = 50, match = {}) => Game.aggregate([
  { $match: { "opening.name": { $ne: "" }, ...match } },
  { $group: { _id: { eco: "$opening.eco", name: "$opening.name" }, games: { $sum: 1 } } },
  { $project: { eco: "$_id.eco", name: "$_id.name", games: 1, source: "dataset", _id: 0 } },
  { $sort: { games: -1 } },
  { $limit: limit },
]);
const datasetOpeningWinRates = (limit = 50, match = {}) => Game.aggregate([
  { $match: { "opening.name": { $ne: "" }, ...match } },
  {
    $group: {
      _id: { eco: "$opening.eco", name: "$opening.name" },
      games: { $sum: 1 },
      whiteWins: { $sum: { $cond: [{ $eq: ["$result", "white_wins"] }, 1, 0] } },
      blackWins: { $sum: { $cond: [{ $eq: ["$result", "black_wins"] }, 1, 0] } },
      draws: { $sum: { $cond: [{ $eq: ["$result", "draw"] }, 1, 0] } },
    },
  },
  { $match: { games: { $gte: 5 } } },
  {
    $project: {
      eco: "$_id.eco",
      name: "$_id.name",
      games: 1,
      whiteWinRate: { $round: [{ $multiply: [{ $divide: ["$whiteWins", "$games"] }, 100] }, 2] },
      blackWinRate: { $round: [{ $multiply: [{ $divide: ["$blackWins", "$games"] }, 100] }, 2] },
      drawRate: { $round: [{ $multiply: [{ $divide: ["$draws", "$games"] }, 100] }, 2] },
      source: "dataset",
      _id: 0,
    },
  },
  { $sort: { games: -1 } },
  { $limit: limit },
]);

router.get("/popular", asyncHandler(async (req, res) => sendOpenings(res, "Popular openings fetched successfully", await datasetPopularOpenings(50))));
router.get("/dataset/popular", asyncHandler(async (req, res) => {
  const data = await datasetPopularOpenings(50);
  return sendOpenings(res, "Popular dataset openings fetched successfully", data);
}));
router.get("/dataset/win-rates", asyncHandler(async (req, res) => {
  const data = await datasetOpeningWinRates(50);
  return sendOpenings(res, "Dataset opening win rates fetched successfully", data);
}));
router.get("/trending", asyncHandler(async (req, res) => sendOpenings(res, "Trending openings fetched successfully", await datasetPopularOpenings(5))));
router.get("/search", asyncHandler(async (req, res) => {
  const regex = new RegExp(String(req.query.q || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  return sendOpenings(res, "Openings search fetched successfully", await datasetPopularOpenings(50, { $or: [{ "opening.name": regex }, { "opening.eco": regex }] }));
}));
router.get("/win-rates", asyncHandler(async (req, res) => sendOpenings(res, "Opening win rates fetched successfully", await datasetOpeningWinRates(50))));
router.get("/aggressive", asyncHandler(async (req, res) => sendOpenings(res, "Aggressive openings fetched successfully", openings.filter((opening) => opening.style === "aggressive" || opening.tags.includes("aggressive")))));
router.get("/defensive", asyncHandler(async (req, res) => sendOpenings(res, "Defensive openings fetched successfully", openings.filter((opening) => opening.style === "defensive" || opening.tags.includes("defensive")))));
router.get("/gambits", asyncHandler(async (req, res) => sendOpenings(res, "Gambit openings fetched successfully", openings.filter((opening) => opening.tags.includes("gambit")))));
router.get("/checkmates", asyncHandler(async (req, res) => sendOpenings(res, "Fastest mate openings fetched successfully", openings.filter((opening) => opening.tags.includes("checkmate")))));
router.get("/rare", asyncHandler(async (req, res) => sendOpenings(res, "Rare openings fetched successfully", openings.filter((opening) => opening.tags.includes("rare") || opening.popularity < 25))));
router.get("/white-advantage", asyncHandler(async (req, res) => sendOpenings(res, "White advantage openings fetched successfully", openings.filter((opening) => opening.whiteWinRate > opening.blackWinRate))));
router.get("/black-advantage", asyncHandler(async (req, res) => sendOpenings(res, "Black advantage openings fetched successfully", openings.filter((opening) => opening.blackWinRate > opening.whiteWinRate))));
router.get("/beginner-friendly", asyncHandler(async (req, res) => sendOpenings(res, "Beginner friendly openings fetched successfully", openings.filter((opening) => opening.tags.includes("beginner-friendly") || opening.complexity === "beginner"))));
router.get("/complexity", asyncHandler(async (req, res) => {
  const level = req.query.level || req.query.q;
  const data = level ? openings.filter((opening) => opening.complexity === level) : openings;
  return sendOpenings(res, "Openings by complexity fetched successfully", data);
}));
router.get("/eco/:ecoCode", asyncHandler(async (req, res) => {
  const openingsByEco = await datasetPopularOpenings(50, { "opening.eco": new RegExp(`^${req.params.ecoCode}$`, "i") });
  return sendOpenings(res, "Opening by ECO fetched successfully", openingsByEco);
}));
router.get("/", asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req.query.page, req.query.limit);
  const data = openings.slice(skip, skip + limit);
  return paginatedResponse(res, "Openings fetched successfully", data, buildPaginationMeta(openings.length, page, limit));
}));

module.exports = router;
