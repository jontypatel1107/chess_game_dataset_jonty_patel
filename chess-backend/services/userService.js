const User = require("../models/User");
const Game = require("../models/Game");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

const getAllUsers = async ({ page, limit, search, sortBy = "rating", order = "desc" }) => {
  const { skip, limit: lim, page: pg } = getPagination(page, limit);

  const filter = { isActive: true };
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  const sortOrder = order === "asc" ? 1 : -1;
  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(lim),
    User.countDocuments(filter),
  ]);

  return { users, pagination: buildPaginationMeta(total, pg, lim) };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateUserProfile = async (id, updates) => {
  const allowedFields = ["username", "country", "avatar"];
  const sanitized = {};
  allowedFields.forEach((f) => { if (updates[f] !== undefined) sanitized[f] = updates[f]; });

  const user = await User.findByIdAndUpdate(id, sanitized, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const getUserStats = async (userId) => {
  const stats = await Game.aggregate([
    {
      $match: {
        $or: [
          { whitePlayer: userId, status: "completed" },
          { blackPlayer: userId, status: "completed" },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalGames: { $sum: 1 },
        wins: {
          $sum: {
            $cond: [{ $eq: ["$winner", userId] }, 1, 0],
          },
        },
        draws: {
          $sum: { $cond: [{ $eq: ["$result", "draw"] }, 1, 0] },
        },
        avgMoves: { $avg: "$totalMoves" },
      },
    },
    {
      $project: {
        _id: 0,
        totalGames: 1,
        wins: 1,
        draws: 1,
        losses: { $subtract: ["$totalGames", { $add: ["$wins", "$draws"] }] },
        avgMoves: { $round: ["$avgMoves", 1] },
      },
    },
  ]);

  return stats[0] || { totalGames: 0, wins: 0, losses: 0, draws: 0, avgMoves: 0 };
};

module.exports = { getAllUsers, getUserById, updateUserProfile, deleteUser, getUserStats };
