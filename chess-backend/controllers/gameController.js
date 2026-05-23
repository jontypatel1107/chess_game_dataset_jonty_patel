const gameService = require("../services/gameService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");

const createGame = asyncHandler(async (req, res) => {
  const { blackPlayer, timeControl, timeLimit, tournamentId } = req.body;
  const game = await gameService.createGame({
    whitePlayerId: req.user._id,
    blackPlayerId: blackPlayer,
    timeControl,
    timeLimit,
    tournamentId,
  });
  return successResponse(res, 201, "Game created successfully", game);
});

const getAllGames = asyncHandler(async (req, res) => {
  const { page, limit, status, timeControl, playerId } = req.query;
  const { games, pagination } = await gameService.getAllGames({ page, limit, status, timeControl, playerId });
  return paginatedResponse(res, "Games fetched successfully", games, pagination);
});

const getGameById = asyncHandler(async (req, res) => {
  const game = await gameService.getGameById(req.params.id);
  return successResponse(res, 200, "Game fetched successfully", game);
});

const addMove = asyncHandler(async (req, res) => {
  const game = await gameService.addMove(req.params.id, req.body, req.user._id);
  return successResponse(res, 200, "Move added successfully", game);
});

const endGame = asyncHandler(async (req, res) => {
  const game = await gameService.endGame(req.params.id, req.body, req.user._id);
  return successResponse(res, 200, "Game ended successfully", game);
});

const getGameStats = asyncHandler(async (req, res) => {
  const stats = await gameService.getGameStats();
  return successResponse(res, 200, "Game statistics fetched successfully", stats);
});

module.exports = { createGame, getAllGames, getGameById, addMove, endGame, getGameStats };
