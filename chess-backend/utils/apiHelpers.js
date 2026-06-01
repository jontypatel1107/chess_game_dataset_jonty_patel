const Game = require("../models/Game");
const User = require("../models/User");
const { getPagination, buildPaginationMeta } = require("./pagination");

const gamePopulate = [
  { path: "whitePlayer", select: "username rating avatar country" },
  { path: "blackPlayer", select: "username rating avatar country" },
  { path: "winner", select: "username rating" },
  { path: "tournament", select: "name format" },
];

const parseSort = (sort = "-createdAt") => {
  const aliases = {
    turns: "totalMoves",
    white_rating: "whitePlayer.rating",
    black_rating: "blackPlayer.rating",
    winner: "result",
    time_control: "timeControl",
    opening_name: "opening.name",
    popularity: "createdAt",
    accuracy: "createdAt",
    duration: "endedAt",
  };
  const direction = String(sort).startsWith("-") ? -1 : 1;
  const rawField = String(sort).replace(/^-/, "");
  return { [aliases[rawField] || rawField]: direction };
};

const buildGameFilter = (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.timeControl) filter.timeControl = query.timeControl;
  if (query.result) filter.result = query.result;
  if (query.endReason) filter.endReason = query.endReason;
  if (query.archived !== undefined) filter.isArchived = query.archived === "true";
  if (query.playerId) filter.$or = [{ whitePlayer: query.playerId }, { blackPlayer: query.playerId }];
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }
  return filter;
};

const listGames = async (query = {}, extraFilter = {}, sortOverride = null) => {
  const { skip, limit, page } = getPagination(query.page, query.limit);
  const filter = { ...buildGameFilter(query), ...extraFilter };
  const sort = sortOverride || parseSort(query.sort);
  const [matches, total] = await Promise.all([
    Game.find(filter).populate(gamePopulate).sort(sort).skip(skip).limit(limit),
    Game.countDocuments(filter),
  ]);
  return { matches, pagination: buildPaginationMeta(total, page, limit) };
};

const findUserByUsername = async (username) => {
  const user = await User.findOne({ username: new RegExp(`^${escapeRegExp(username)}$`, "i"), isActive: true });
  if (!user) {
    const error = new Error("Player not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const rate = (part, total) => (total ? Number(((part / total) * 100).toFixed(2)) : 0);

const makePgn = (game) => {
  const moves = game.moves || [];
  const body = moves.length
    ? moves
    .map((move, index) => {
      const notation = move.notation || `${move.from || ""}${move.to || ""}` || "...";
      return index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ${notation}` : notation;
    })
      .join(" ")
    : game.moveText || "";
  const result = game.result === "white_wins" ? "1-0" : game.result === "black_wins" ? "0-1" : game.result === "draw" ? "1/2-1/2" : "*";
  return `${body} ${result}`.trim();
};

module.exports = {
  Game,
  User,
  gamePopulate,
  parseSort,
  buildGameFilter,
  listGames,
  findUserByUsername,
  escapeRegExp,
  rate,
  makePgn,
};
