const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");
const openings = require("../data/openings");

const contains = (opening, q) => {
  const query = String(q || "").toLowerCase();
  return [opening.name, opening.eco, opening.family, opening.moves, ...(opening.tags || [])]
    .join(" ")
    .toLowerCase()
    .includes(query);
};

const sendOpenings = (res, message, data) => successResponse(res, 200, message, data);

router.get("/popular", asyncHandler(async (req, res) => sendOpenings(res, "Popular openings fetched successfully", [...openings].sort((a, b) => b.popularity - a.popularity))));
router.get("/trending", asyncHandler(async (req, res) => sendOpenings(res, "Trending openings fetched successfully", [...openings].sort((a, b) => b.popularity - a.popularity).slice(0, 5))));
router.get("/search", asyncHandler(async (req, res) => sendOpenings(res, "Openings search fetched successfully", openings.filter((opening) => contains(opening, req.query.q)))));
router.get("/win-rates", asyncHandler(async (req, res) => sendOpenings(res, "Opening win rates fetched successfully", openings.map(({ eco, name, whiteWinRate, blackWinRate, drawRate }) => ({ eco, name, whiteWinRate, blackWinRate, drawRate })))));
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
  const opening = openings.find((item) => item.eco.toLowerCase() === req.params.ecoCode.toLowerCase());
  return sendOpenings(res, "Opening by ECO fetched successfully", opening || null);
}));
router.get("/", asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req.query.page, req.query.limit);
  const data = openings.slice(skip, skip + limit);
  return paginatedResponse(res, "Openings fetched successfully", data, buildPaginationMeta(openings.length, page, limit));
}));

module.exports = router;
