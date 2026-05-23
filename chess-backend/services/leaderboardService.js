const Leaderboard = require("../models/Leaderboard");
const User = require("../models/User");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

const getLeaderboard = async ({ page, limit, category = "overall", country }) => {
  const { skip, limit: lim, page: pg } = getPagination(page, limit);

  const filter = { category };

  // If filtering by country, need to lookup from User
  if (country) {
    const users = await User.find({ country: { $regex: country, $options: "i" } }).select("_id");
    const userIds = users.map((u) => u._id);
    filter.player = { $in: userIds };
  }

  const [entries, total] = await Promise.all([
    Leaderboard.find(filter)
      .populate("player", "username avatar country rating")
      .sort({ rating: -1 })
      .skip(skip)
      .limit(lim),
    Leaderboard.countDocuments(filter),
  ]);

  // Attach rank dynamically
  const ranked = entries.map((entry, i) => ({
    rank: skip + i + 1,
    player: entry.player,
    rating: entry.rating,
    gamesPlayed: entry.gamesPlayed,
    wins: entry.wins,
    losses: entry.losses,
    draws: entry.draws,
    winStreak: entry.winStreak,
    bestRating: entry.bestRating,
  }));

  return { leaderboard: ranked, pagination: buildPaginationMeta(total, pg, lim) };
};

const getTopPlayersByTimeControl = async () => {
  // Aggregation: top player per time control category
  return Leaderboard.aggregate([
    { $match: { category: { $ne: "overall" } } },
    { $sort: { category: 1, rating: -1 } },
    {
      $group: {
        _id: "$category",
        topPlayer: { $first: "$player" },
        topRating: { $first: "$rating" },
        totalPlayers: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "topPlayer",
        foreignField: "_id",
        as: "playerInfo",
      },
    },
    { $unwind: "$playerInfo" },
    {
      $project: {
        category: "$_id",
        topRating: 1,
        totalPlayers: 1,
        avgRating: { $round: ["$avgRating", 0] },
        topPlayerName: "$playerInfo.username",
        topPlayerAvatar: "$playerInfo.avatar",
        _id: 0,
      },
    },
    { $sort: { category: 1 } },
  ]);
};

const getRatingDistribution = async () => {
  return Leaderboard.aggregate([
    { $match: { category: "overall" } },
    {
      $bucket: {
        groupBy: "$rating",
        boundaries: [0, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2500, 3000],
        default: "3000+",
        output: {
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    },
    {
      $project: {
        ratingRange: "$_id",
        count: 1,
        avgRating: { $round: ["$avgRating", 0] },
        _id: 0,
      },
    },
  ]);
};

module.exports = { getLeaderboard, getTopPlayersByTimeControl, getRatingDistribution };
