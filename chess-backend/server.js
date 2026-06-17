require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const requestLogger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const { successResponse } = require("./utils/response");

// Import unified routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const playerRoutes = require("./routes/playerRoutes");
const openingRoutes = require("./routes/openingRoutes");
const searchRoutes = require("./routes/searchRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const statsRoutes = require("./routes/statsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const systemRoutes = require("./routes/systemRoutes");

// Connect to MongoDB Atlas
connectDB();

const app = express();
const path = require('path');
const fs = require('fs');

// ─── Core Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Serve Frontend Static Files (if exists) ──────────────────
const frontendBuildPath = path.join(__dirname, '../chess-frontend/dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// ─── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});

app.use("/api", limiter);

// ─── Health Check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  successResponse(res, 200, "Chess API Server is healthy", {
    timestamp: new Date().toISOString(),
    version: "1.1.0",
  });
});

// ─── API Routes (v1) ─────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/games", gameRoutes); // Unified: handles games, matches, and protected actions
app.use("/api/v1/tournaments", tournamentRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);
app.use("/api/v1/players", playerRoutes);
app.use("/api/v1/openings", openingRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/stats", statsRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/system", systemRoutes);

// ─── Fallback to Frontend for Client-Side Routing ──────────────
app.get('*', (req, res) => {
  // If it's not an API route, try to serve the frontend index.html for client-side routing
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(frontendBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Frontend not available. Build and deploy the frontend separately or build it before starting the server.'
      });
    }
  } else {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  }
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Chess API Server running on port ${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1\n`);
});

module.exports = app;
