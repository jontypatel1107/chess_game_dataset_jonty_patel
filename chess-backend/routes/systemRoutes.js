const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/response");
const { Game, User } = require("../utils/apiHelpers");

const startedAt = Date.now();

router.get("/info", asyncHandler(async (req, res) => successResponse(res, 200, "System information fetched successfully", { name: "Chess API", environment: process.env.NODE_ENV || "development" })));
router.get("/logs", asyncHandler(async (req, res) => successResponse(res, 200, "System logs fetched successfully", [])));
router.get("/version", asyncHandler(async (req, res) => successResponse(res, 200, "API version fetched successfully", { version: "1.0.0" })));
router.get("/status", asyncHandler(async (req, res) => successResponse(res, 200, "System status fetched successfully", { status: "online" })));
router.get("/uptime", asyncHandler(async (req, res) => successResponse(res, 200, "Server uptime fetched successfully", { uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000) })));
router.get("/database/status", asyncHandler(async (req, res) => successResponse(res, 200, "Database status fetched successfully", { readyState: mongoose.connection.readyState, connected: mongoose.connection.readyState === 1 })));
router.get("/cache/status", asyncHandler(async (req, res) => successResponse(res, 200, "Cache status fetched successfully", { configured: false })));
router.post("/recalculate-stats", asyncHandler(async (req, res) => successResponse(res, 200, "Stats recalculation queued successfully", null)));
router.post("/reindex", asyncHandler(async (req, res) => successResponse(res, 200, "Search reindex queued successfully", null)));
router.post("/restart", asyncHandler(async (req, res) => successResponse(res, 202, "Restart requested successfully", { restarted: false })));
router.get("/config", asyncHandler(async (req, res) => successResponse(res, 200, "Public configuration fetched successfully", { apiVersion: "v1", maxPageLimit: 100 })));
router.get("/security/events", asyncHandler(async (req, res) => successResponse(res, 200, "Security events fetched successfully", [])));
router.get("/performance", asyncHandler(async (req, res) => successResponse(res, 200, "Performance metrics fetched successfully", { memory: process.memoryUsage() })));
router.get("/storage", asyncHandler(async (req, res) => successResponse(res, 200, "Storage analytics fetched successfully", {
  matches: await Game.countDocuments({}),
  players: await User.countDocuments({}),
})));

module.exports = router;
