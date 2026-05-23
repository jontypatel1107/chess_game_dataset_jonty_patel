const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/response");
const { protect, adminOnly } = require("../middlewares/auth");
const { User } = require("../utils/apiHelpers");

router.get("/users", asyncHandler(async (req, res) => successResponse(res, 200, "Admin users fetched successfully", await User.find({}).select("-password"))));
router.get("/logs", asyncHandler(async (req, res) => successResponse(res, 200, "System logs fetched successfully", [])));
router.get("/system/health", asyncHandler(async (req, res) => successResponse(res, 200, "Admin health fetched successfully", { status: "healthy", timestamp: new Date().toISOString() })));
router.delete("/cache/clear", asyncHandler(async (req, res) => successResponse(res, 200, "Cache cleared successfully", null)));
router.patch("/users/:id/ban", asyncHandler(async (req, res) => successResponse(res, 200, "User banned successfully", await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password"))));
router.patch("/users/:id/unban", asyncHandler(async (req, res) => successResponse(res, 200, "User unbanned successfully", await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select("-password"))));
router.get("/protected/dashboard", protect, adminOnly, asyncHandler(async (req, res) => successResponse(res, 200, "Admin dashboard fetched successfully", { user: req.user })));

module.exports = router;
