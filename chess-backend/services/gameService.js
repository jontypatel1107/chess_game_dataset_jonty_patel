const mongoose = require("mongoose");
const Game = require("../models/Game");
const User = require("../models/User");
const Leaderboard = require("../models/Leaderboard");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

// ELO rating calculation
const calculateElo = (winnerRating, loserRating, result = "win") => {
  const K = 32;
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;

  if (result === "draw") {
    return {
      winnerChange: Math.round(K * (0.5 - expectedWinner)),
      loserChange: Math.round(K * (0.5 - expectedLoser)),
    };
  }
  return {
    winnerChange: Math.round(K * (1 - expectedWinner)),
    loserChange: Math.round(K * (0 - expectedLoser)),
  };
};

const createGame = async ({ whitePlayerId, blackPlayerId, timeControl, timeLimit, tournamentId }) => {
  if (whitePlayerId.toString() === blackPlayerId.toString()) {
    const error = new Error("A player cannot play against themselves");
    error.statusCode = 400;
    throw error;
  }

  const [white, black] = await Promise.all([
    User.findById(whitePlayerId),
    User.findById(blackPlayerId),
  ]);

  if (!white || !black) {
    const error = new Error("One or both players not found");
    error.statusCode = 404;
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
  });

  return game.populate(["whitePlayer", "blackPlayer"], "username rating avatar");
};

const getAllGames = async ({ page, limit, status, timeControl, playerId }) => {
  const { skip, limit: lim, page: pg } = getPagination(page, limit);

  const filter = {};
  if (status) filter.status = status;
  if (timeControl) filter.timeControl = timeControl;
  if (playerId) {
    const pid = new mongoose.Types.ObjectId(playerId);
    filter.$or = [{ whitePlayer: pid }, { blackPlayer: pid }];
  }

  const [games, total] = await Promise.all([
    Game.find(filter)
      .populate("whitePlayer", "username rating avatar")
      .populate("blackPlayer", "username rating avatar")
      .populate("winner", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim),
    Game.countDocuments(filter),
  ]);

  return { games, pagination: buildPaginationMeta(total, pg, lim) };
};

const getGameById = async (id) => {
  const game = await Game.findById(id)
    .populate("whitePlayer", "username rating avatar country")
    .populate("blackPlayer", "username rating avatar country")
    .populate("winner", "username rating")
    .populate("tournament", "name format");

  if (!game) {
    const error = new Error("Game not found");
    error.statusCode = 404;
    throw error;
  }
  return game;
};

const addMove = async (gameId, { from, to, piece, notation, isCapture, isCheck, isCheckmate, isCastle, promotedTo }, playerId) => {
  const game = await Game.findById(gameId);

  if (!game) {
    const error = new Error("Game not found");
    error.statusCode = 404;
    throw error;
  }

  if (game.status !== "ongoing") {
    const error = new Error("Cannot add moves to a game that is not ongoing");
    error.statusCode = 400;
    throw error;
  }

  const isWhite = game.whitePlayer.toString() === playerId.toString();
  const isBlack = game.blackPlayer.toString() === playerId.toString();

  if (!isWhite && !isBlack) {
    const error = new Error("You are not a player in this game");
    error.statusCode = 403;
    throw error;
  }

  if ((game.currentTurn === "white" && !isWhite) || (game.currentTurn === "black" && !isBlack)) {
    const error = new Error("It is not your turn");
    error.statusCode = 400;
    throw error;
  }

  const move = {
    moveNumber: game.totalMoves + 1,
    player: playerId,
    from, to, piece, notation,
    isCapture: isCapture || false,
    isCheck: isCheck || false,
    isCheckmate: isCheckmate || false,
    isCastle: isCastle || false,
    promotedTo: promotedTo || null,
    timestamp: new Date(),
  };

  game.moves.push(move);
  game.totalMoves += 1;
  game.currentTurn = game.currentTurn === "white" ? "black" : "white";

  // Auto-end on checkmate
  if (isCheckmate) {
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
  if (!game) {
    const error = new Error("Game not found");
    error.statusCode = 404;
    throw error;
  }

  const isPlayer =
    game.whitePlayer.toString() === requesterId.toString() ||
    game.blackPlayer.toString() === requesterId.toString();

  if (!isPlayer) {
    const error = new Error("Only game participants can end the game");
    error.statusCode = 403;
    throw error;
  }

  if (game.status !== "ongoing") {
    const error = new Error("Game is already ended");
    error.statusCode = 400;
    throw error;
  }

  game.status = result === "draw" ? "draw" : "completed";
  game.result = result;
  game.endReason = endReason;
  game.endedAt = new Date();

  if (result === "white_wins") game.winner = game.whitePlayer;
  else if (result === "black_wins") game.winner = game.blackPlayer;

  await updatePlayerStats(game);
  await game.save();

  return game.populate(["whitePlayer", "blackPlayer"], "username rating");
};

// Update ELO + stats after game ends
const updatePlayerStats = async (game) => {
  const white = await User.findById(game.whitePlayer);
  const black = await User.findById(game.blackPlayer);
  if (!white || !black) return;

  let whiteChange = 0, blackChange = 0;

  if (game.result === "white_wins") {
    const elo = calculateElo(white.rating, black.rating, "win");
    whiteChange = elo.winnerChange;
    blackChange = elo.loserChange;
    white.wins += 1;  black.losses += 1;
  } else if (game.result === "black_wins") {
    const elo = calculateElo(black.rating, white.rating, "win");
    blackChange = elo.winnerChange;
    whiteChange = elo.loserChange;
    black.wins += 1;  white.losses += 1;
  } else if (game.result === "draw") {
    const elo = calculateElo(white.rating, black.rating, "draw");
    whiteChange = elo.winnerChange;
    blackChange = elo.loserChange;
    white.draws += 1;  black.draws += 1;
  }

  white.rating = Math.max(100, white.rating + whiteChange);
  black.rating = Math.max(100, black.rating + blackChange);
  white.gamesPlayed += 1;
  black.gamesPlayed += 1;

  game.ratingChange = { white: whiteChange, black: blackChange };

  await Promise.all([
    white.save(),
    black.save(),
    Leaderboard.findOneAndUpdate({ player: white._id }, { rating: white.rating, gamesPlayed: white.gamesPlayed, wins: white.wins, losses: white.losses, draws: white.draws, lastUpdated: new Date() }, { upsert: true }),
    Leaderboard.findOneAndUpdate({ player: black._id }, { rating: black.rating, gamesPlayed: black.gamesPlayed, wins: black.wins, losses: black.losses, draws: black.draws, lastUpdated: new Date() }, { upsert: true }),
  ]);
};

const getGameStats = async () => {
  const stats = await Game.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgMoves: { $avg: "$totalMoves" },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        avgMoves: { $round: ["$avgMoves", 1] },
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ]);

  const resultStats = await Game.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$result", count: { $sum: 1 } } },
    { $project: { result: "$_id", count: 1, _id: 0 } },
  ]);

  const timeControlStats = await Game.aggregate([
    { $group: { _id: "$timeControl", count: { $sum: 1 }, avgMoves: { $avg: "$totalMoves" } } },
    { $project: { timeControl: "$_id", count: 1, avgMoves: { $round: ["$avgMoves", 1] }, _id: 0 } },
    { $sort: { count: -1 } },
  ]);

  return { statusBreakdown: stats, resultBreakdown: resultStats, timeControlBreakdown: timeControlStats };
};

module.exports = { createGame, getAllGames, getGameById, addMove, endGame, getGameStats };
