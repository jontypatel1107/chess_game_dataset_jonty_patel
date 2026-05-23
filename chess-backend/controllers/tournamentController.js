const tournamentService = require("../services/tournamentService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");

const createTournament = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.createTournament(req.body, req.user._id);
  return successResponse(res, 201, "Tournament created successfully", tournament);
});

const getAllTournaments = asyncHandler(async (req, res) => {
  const { page, limit, status, search, format } = req.query;
  const { tournaments, pagination } = await tournamentService.getAllTournaments({ page, limit, status, search, format });
  return paginatedResponse(res, "Tournaments fetched successfully", tournaments, pagination);
});

const getTournamentById = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.getTournamentById(req.params.id);
  return successResponse(res, 200, "Tournament fetched successfully", tournament);
});

const updateTournament = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.updateTournament(req.params.id, req.body, req.user._id);
  return successResponse(res, 200, "Tournament updated successfully", tournament);
});

const deleteTournament = asyncHandler(async (req, res) => {
  await tournamentService.deleteTournament(req.params.id, req.user._id);
  return successResponse(res, 200, "Tournament deleted successfully", null);
});

const registerForTournament = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.registerForTournament(req.params.id, req.user._id);
  return successResponse(res, 200, "Registered for tournament successfully", tournament);
});

const getTournamentStats = asyncHandler(async (req, res) => {
  const stats = await tournamentService.getTournamentStats();
  return successResponse(res, 200, "Tournament statistics fetched successfully", stats);
});

module.exports = {
  createTournament, getAllTournaments, getTournamentById,
  updateTournament, deleteTournament, registerForTournament, getTournamentStats,
};
