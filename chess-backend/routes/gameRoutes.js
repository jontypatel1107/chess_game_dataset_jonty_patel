const express = require("express");
const router = express.Router();
const {
  createGame, 
  getAllGames, 
  getGameById, 
  addMove, 
  endGame, 
  handleBulkOperation
} = require("../controllers/gameController");
const { protect, adminOnly } = require("../middlewares/auth");
const { validateGame } = require("../middlewares/validate");

// ─── PUBLIC ROUTES ────────────────────────────────────────────

// GET /api/v1/games - List games with filters (status, timeControl, playerId, rated, etc.)
router.get("/", getAllGames);

// GET /api/v1/games/:id - Get specific game details
router.get("/:id", getGameById);


// ─── PROTECTED ROUTES (USER) ──────────────────────────────────

// POST /api/v1/games - Create a new game
router.post("/", protect, validateGame, createGame);

// POST /api/v1/games/:id/move - Add a move to an ongoing game
router.post("/:id/move", protect, addMove);

// PATCH /api/v1/games/:id/end - Manually end a game (resign/draw)
router.patch("/:id/end", protect, endGame);


// ─── ADMIN ROUTES (BULK OPERATIONS) ───────────────────────────

// POST /api/v1/games/bulk/:type (upload, update, delete, archive)
router.post("/bulk/:type", protect, adminOnly, handleBulkOperation);

module.exports = router;
