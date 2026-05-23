const leaderboardService = require("../services/leaderboardService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");

const getLeaderboard = asyncHandler(async (req, res) => {
  const { page, limit, category, country } = req.query;
  const { leaderboard, pagination } = await leaderboardService.getLeaderboard({ page, limit, category, country });
  return paginatedResponse(res, "Leaderboard fetched successfully", leaderboard, pagination);
});

const getTopPlayersByTimeControl = asyncHandler(async (req, res) => {
  const data = await leaderboardService.getTopPlayersByTimeControl();
  return successResponse(res, 200, "Top players by time control fetched", data);
});

const getRatingDistribution = asyncHandler(async (req, res) => {
  const data = await leaderboardService.getRatingDistribution();
  return successResponse(res, 200, "Rating distribution fetched successfully", data);
});

module.exports = { getLeaderboard, getTopPlayersByTimeControl, getRatingDistribution };
