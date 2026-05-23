const express = require("express");
const router = express.Router();
const {
  createTournament, getAllTournaments, getTournamentById,
  updateTournament, deleteTournament, registerForTournament, getTournamentStats,
} = require("../controllers/tournamentController");
const { protect } = require("../middlewares/auth");
const { validateTournament } = require("../middlewares/validate");

// GET  /api/v1/tournaments/stats         → aggregation stats
router.get("/stats", getTournamentStats);

// GET  /api/v1/tournaments               → all tournaments
router.get("/", getAllTournaments);

// POST /api/v1/tournaments               → create tournament (protected)
router.post("/", protect, validateTournament, createTournament);

// GET  /api/v1/tournaments/:id
router.get("/:id", getTournamentById);

// PUT  /api/v1/tournaments/:id           → update (organizer only)
router.put("/:id", protect, updateTournament);

// DELETE /api/v1/tournaments/:id         → delete (organizer only)
router.delete("/:id", protect, deleteTournament);

// POST /api/v1/tournaments/:id/register  → register player
router.post("/:id/register", protect, registerForTournament);

module.exports = router;
