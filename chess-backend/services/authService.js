const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Leaderboard = require("../models/Leaderboard");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const registerUser = async ({ username, email, password, country, avatar }) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const field = existingUser.email === email ? "Email" : "Username";
    const error = new Error(`${field} already exists`);
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ username, email, password, country, avatar });

  // Create leaderboard entries for all categories
  const categories = ["overall", "bullet", "blitz", "rapid", "classical"];
  try {
    await Leaderboard.insertMany(
      categories.map((cat) => ({ player: user._id, rating: user.rating, category: cat })),
      { ordered: false }
    );
  } catch (leaderboardError) {
    // Log error but don't fail registration if leaderboard creation fails
    console.error("Leaderboard creation error:", leaderboardError.message);
  }

  const token = generateToken(user._id);
  return { user: sanitizeUser(user), token };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Account is deactivated. Contact support.");
    error.statusCode = 403;
    throw error;
  }

  const token = generateToken(user._id);
  return { user: sanitizeUser(user), token };
};

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  rating: user.rating,
  gamesPlayed: user.gamesPlayed,
  wins: user.wins,
  losses: user.losses,
  draws: user.draws,
  role: user.role,
  country: user.country,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

module.exports = { registerUser, loginUser, generateToken };
