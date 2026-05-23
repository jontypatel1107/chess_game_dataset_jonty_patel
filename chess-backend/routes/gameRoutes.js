const express = require("express");
const router = express.Router();
const {
  createGame, getAllGames, getGameById, addMove, endGame, getGameStats,
} = require("../controllers/gameController");
const { protect } = require("../middlewares/auth");
const { validateGame } = require("../middlewares/validate");

// GET  /api/v1/games/stats         → game statistics (aggregation)
router.get("/stats", getGameStats);

// GET  /api/v1/games               → all games (filterable, paginated)
router.get("/", getAllGames);

// POST /api/v1/games               → create new game (protected)
router.post("/", protect, validateGame, createGame);

// GET  /api/v1/games/:id           → single game with moves
router.get("/:id", getGameById);

// POST /api/v1/games/:id/move      → add a move (protected)
router.post("/:id/move", protect, addMove);

// PATCH /api/v1/games/:id/end      → end game (protected)
router.patch("/:id/end", protect, endGame);

module.exports = router;
