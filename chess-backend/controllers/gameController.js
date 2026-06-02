const gameService = require("../services/gameService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");

const createGame = asyncHandler(async (req, res) => {
  const game = await gameService.createGame({
    ...req.body,
    whitePlayerId: req.body.whitePlayerId || req.user._id,
  });
  return successResponse(res, 201, "Game created successfully", game);
});

const getAllGames = asyncHandler(async (req, res) => {
  const { games, pagination } = await gameService.getAllGames(req.query);
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

const handleBulkOperation = asyncHandler(async (req, res) => {
  const { type } = req.params; // upload, update, delete, archive
  const result = await gameService.bulkOperation(type, req.body);
  return successResponse(res, 200, `Bulk ${type} operation successful`, result);
});

module.exports = { 
  createGame, 
  getAllGames, 
  getGameById, 
  addMove, 
  endGame, 
  handleBulkOperation 
};
