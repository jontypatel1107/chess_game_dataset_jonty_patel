const mongoose = require("mongoose");
const Game = require("../models/Game");
const User = require("../models/User");
const Leaderboard = require("../models/Leaderboard");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

const gamePopulate = [
  { path: "whitePlayer", select: "username rating avatar country" },
  { path: "blackPlayer", select: "username rating avatar country" },
  { path: "winner", select: "username rating" },
  { path: "tournament", select: "name format" },
];

const createGame = async (gameData) => {
  const { whitePlayerId, blackPlayerId, timeControl, timeLimit, tournamentId, ...extra } = gameData;
  
  if (whitePlayerId && blackPlayerId && whitePlayerId.toString() === blackPlayerId.toString()) {
    const error = new Error("A player cannot play against themselves");
    error.statusCode = 400;
    throw error;
  }

  const game = await Game.create({
    whitePlayer: whitePlayerId,
    blackPlayer: blackPlayerId,
    timeControl,
    timeLimit,
    tournament: tournamentId || null,
    status: "ongoing",
    startedAt: new Date(),
    ...extra
  });

  return game.populate(gamePopulate);
};

const getAllGames = async (query = {}) => {
  const { page, limit, status, timeControl, playerId, sort, result, endReason, rated, search } = query;
  const { skip, limit: lim, page: pg } = getPagination(page, limit);

  const filter = {};
  if (status) filter.status = status;
  if (timeControl) filter.timeControl = timeControl;
  if (result) filter.result = result;
  if (endReason) filter.endReason = endReason;
  
  // Fix: Only filter by rated if it's explicitly "true" or "false"
  if (rated === "true" || rated === "false") {
    filter.rated = rated === "true";
  }
  
  if (playerId) {
    const pid = mongoose.isValidObjectId(playerId) ? new mongoose.Types.ObjectId(playerId) : null;
    if (pid) filter.$or = [{ whitePlayer: pid }, { blackPlayer: pid }];
  }

  // Simple search implementation
  if (search) {
    filter.$or = [
      { "opening.name": { $regex: search, $options: "i" } },
      { "endReason": { $regex: search, $options: "i" } }
    ];
  }

  const sortOption = sort ? { [sort.replace(/^-/, "")]: sort.startsWith("-") ? -1 : 1 } : { createdAt: -1 };

  const [games, total] = await Promise.all([
    Game.find(filter)
      .populate(gamePopulate)
      .sort(sortOption)
      .skip(skip)
      .limit(lim),
    Game.countDocuments(filter),
  ]);

  return { games, pagination: buildPaginationMeta(total, pg, lim) };
};

const getGameById = async (id) => {
  const game = await Game.findById(id).populate(gamePopulate);
  if (!game) {
    const error = new Error("Game not found");
    error.statusCode = 404;
    throw error;
  }
  return game;
};

const addMove = async (gameId, moveData, playerId) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error("Game not found");
  if (game.status !== "ongoing") throw new Error("Game is not ongoing");

  const isWhite = game.whitePlayer.toString() === playerId.toString();
  const isBlack = game.blackPlayer.toString() === playerId.toString();

  if (!isWhite && !isBlack) {
    const error = new Error("You are not a player in this game");
    error.statusCode = 403;
    throw error;
  }

  game.moves.push({ ...moveData, player: playerId, moveNumber: game.totalMoves + 1 });
  game.totalMoves += 1;
  game.currentTurn = game.currentTurn === "white" ? "black" : "white";

  if (moveData.isCheckmate) {
    game.status = "completed";
    game.result = isWhite ? "white_wins" : "black_wins";
    game.winner = playerId;
    game.endReason = "checkmate";
    game.endedAt = new Date();
    await updatePlayerStats(game);
  }

  await game.save();
  return game;
};

const endGame = async (gameId, { result, endReason }, requesterId) => {
  const game = await Game.findById(gameId);
  if (!game || game.status !== "ongoing") throw new Error("Game not found or already ended");

  game.status = result === "draw" ? "draw" : "completed";
  game.result = result;
  game.endReason = endReason;
  game.endedAt = new Date();
  if (result === "white_wins") game.winner = game.whitePlayer;
  else if (result === "black_wins") game.winner = game.blackPlayer;

  await updatePlayerStats(game);
  await game.save();
  return game.populate(gamePopulate);
};

const bulkOperation = async (type, data) => {
  if (type === "upload") return Game.insertMany(data, { ordered: false });
  if (type === "update") return Game.updateMany({ _id: { $in: data.ids } }, data.update);
  if (type === "delete") return Game.deleteMany({ _id: { $in: data.ids } });
  if (type === "archive") return Game.updateMany({ _id: { $in: data.ids } }, { isArchived: true });
};

const updatePlayerStats = async (game) => {
  const white = await User.findById(game.whitePlayer);
  const black = await User.findById(game.blackPlayer);
  if (!white || !black) return;

  const K = 32;
  const expectedWhite = 1 / (1 + Math.pow(10, (black.rating - white.rating) / 400));
  const actualWhite = game.result === "white_wins" ? 1 : game.result === "draw" ? 0.5 : 0;
  
  const whiteChange = Math.round(K * (actualWhite - expectedWhite));
  const blackChange = -whiteChange;

  white.rating += whiteChange;
  black.rating += blackChange;
  white.gamesPlayed += 1;
  black.gamesPlayed += 1;
  
  if (game.result === "white_wins") white.wins += 1, black.losses += 1;
  else if (game.result === "black_wins") black.wins += 1, white.losses += 1;
  else { white.draws += 1; black.draws += 1; }

  await Promise.all([white.save(), black.save()]);
};

module.exports = { 
  createGame, 
  getAllGames, 
  getGameById, 
  addMove, 
  endGame, 
  bulkOperation,
  gamePopulate
};
