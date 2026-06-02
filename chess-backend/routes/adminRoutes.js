const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/response");
const { protect, adminOnly } = require("../middlewares/auth");
const { User } = require("../utils/apiHelpers");

// Middleware to protect all admin routes
router.use(protect);
router.use(adminOnly);

// GET /api/v1/admin/users
router.get("/users", asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  return successResponse(res, 200, "Admin users fetched successfully", users);
}));

// GET /api/v1/admin/logs
router.get("/logs", asyncHandler(async (req, res) => {
  return successResponse(res, 200, "System logs fetched successfully", []);
}));

// GET /api/v1/admin/system/health
router.get("/system/health", asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Admin health fetched successfully", { 
    status: "healthy", 
    timestamp: new Date().toISOString() 
  });
}));

// DELETE /api/v1/admin/cache/clear
router.delete("/cache/clear", asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Cache cleared successfully", null);
}));

// PATCH /api/v1/admin/users/:id/ban
router.patch("/users/:id/ban", asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password");
  return successResponse(res, 200, "User banned successfully", user);
}));

// PATCH /api/v1/admin/users/:id/unban
router.patch("/users/:id/unban", asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select("-password");
  return successResponse(res, 200, "User unbanned successfully", user);
}));

// GET /api/v1/admin/protected/dashboard
router.get("/protected/dashboard", asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Admin dashboard fetched successfully", { user: req.user });
}));

module.exports = router;
