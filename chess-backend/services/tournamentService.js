const Tournament = require("../models/Tournament");
const User = require("../models/User");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

const createTournament = async (data, organizerId) => {
  const tournament = await Tournament.create({ ...data, organizer: organizerId });
  return tournament;
};

const getAllTournaments = async ({ page, limit, status, search, format }) => {
  const { skip, limit: lim, page: pg } = getPagination(page, limit);
  const filter = {};

  if (status) filter.status = status;
  if (format) filter.format = format;
  if (search) filter.name = { $regex: search, $options: "i" };

  const [tournaments, total] = await Promise.all([
    Tournament.find(filter)
      .populate("organizer", "username avatar")
      .populate("winner", "username rating")
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(lim),
    Tournament.countDocuments(filter),
  ]);

  return { tournaments, pagination: buildPaginationMeta(total, pg, lim) };
};

const getTournamentById = async (id) => {
  const tournament = await Tournament.findById(id)
    .populate("organizer", "username avatar rating")
    .populate("registeredPlayers.player", "username rating avatar country")
    .populate("winner", "username rating")
    .populate("games");

  if (!tournament) {
    const error = new Error("Tournament not found");
    error.statusCode = 404;
    throw error;
  }
  return tournament;
};

const updateTournament = async (id, updates, userId) => {
  const tournament = await Tournament.findById(id);
  if (!tournament) {
    const error = new Error("Tournament not found");
    error.statusCode = 404;
    throw error;
  }

  if (tournament.organizer.toString() !== userId.toString()) {
    const error = new Error("Only the organizer can update this tournament");
    error.statusCode = 403;
    throw error;
  }

  if (tournament.status === "completed" || tournament.status === "cancelled") {
    const error = new Error("Cannot update a completed or cancelled tournament");
    error.statusCode = 400;
    throw error;
  }

  const allowedUpdates = ["name", "description", "maxPlayers", "startDate", "status", "prizePool", "isPublic"];
  allowedUpdates.forEach((field) => { if (updates[field] !== undefined) tournament[field] = updates[field]; });

  await tournament.save();
  return tournament;
};

const deleteTournament = async (id, userId) => {
  const tournament = await Tournament.findById(id);
  if (!tournament) {
    const error = new Error("Tournament not found");
    error.statusCode = 404;
    throw error;
  }
  if (tournament.organizer.toString() !== userId.toString()) {
    const error = new Error("Only the organizer can delete this tournament");
    error.statusCode = 403;
    throw error;
  }
  await tournament.deleteOne();
};

const registerForTournament = async (tournamentId, userId) => {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    const error = new Error("Tournament not found");
    error.statusCode = 404;
    throw error;
  }

  if (tournament.status !== "upcoming") {
    const error = new Error("Registration is closed for this tournament");
    error.statusCode = 400;
    throw error;
  }

  const alreadyRegistered = tournament.registeredPlayers.some(
    (rp) => rp.player.toString() === userId.toString()
  );
  if (alreadyRegistered) {
    const error = new Error("You are already registered for this tournament");
    error.statusCode = 409;
    throw error;
  }

  if (tournament.registeredPlayers.length >= tournament.maxPlayers) {
    const error = new Error("Tournament is full");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (user.rating < tournament.minRating || user.rating > tournament.maxRating) {
    const error = new Error(`Your rating (${user.rating}) does not meet the tournament rating requirements`);
    error.statusCode = 400;
    throw error;
  }

  tournament.registeredPlayers.push({ player: userId });
  await tournament.save();
  return tournament;
};

const getTournamentStats = async () => {
  return Tournament.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgPlayers: { $avg: { $size: "$registeredPlayers" } },
        totalPrizePool: { $sum: "$prizePool" },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        avgPlayers: { $round: ["$avgPlayers", 0] },
        totalPrizePool: 1,
        _id: 0,
      },
    },
  ]);
};

module.exports = {
  createTournament, getAllTournaments, getTournamentById,
  updateTournament, deleteTournament, registerForTournament, getTournamentStats,
};
