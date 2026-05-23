const express = require("express");
const router = express.Router();
const {
  getLeaderboard, getTopPlayersByTimeControl, getRatingDistribution,
} = require("../controllers/leaderboardController");

// GET /api/v1/leaderboard                       → paginated leaderboard
router.get("/", getLeaderboard);

// GET /api/v1/leaderboard/top-by-time-control   → aggregation: top per category
router.get("/top-by-time-control", getTopPlayersByTimeControl);

// GET /api/v1/leaderboard/rating-distribution   → aggregation: bucket distribution
router.get("/rating-distribution", getRatingDistribution);

module.exports = router;
