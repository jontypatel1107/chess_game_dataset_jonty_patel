require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const requestLogger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const { successResponse } = require("./utils/response");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const matchRoutes = require("./routes/matchRoutes");
const playerRoutes = require("./routes/playerRoutes");
const openingRoutes = require("./routes/openingRoutes");
const searchRoutes = require("./routes/searchRoutes");

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ─── Core Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes.",
  },
});

app.use("/api", limiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

// ─── Health Check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  successResponse(res, 200, "Chess API Server is running", {
    status: "healthy",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ─── API Routes (v1) ─────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/games", gameRoutes);
app.use("/api/v1/tournaments", tournamentRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1/players", playerRoutes);
app.use("/api/v1/openings", openingRoutes);
app.use("/api/v1/search", searchRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Chess API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1\n`);
});

module.exports = app;
