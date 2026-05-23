const express = require("express");
const router = express.Router();
const { register, login, getMe, logout } = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const { validateRegister, validateLogin } = require("../middlewares/validate");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/response");
const User = require("../models/User");

// POST /api/v1/auth/register
router.post("/register", validateRegister, register);

// POST /api/v1/auth/login
router.post("/login", validateLogin, login);

// GET /api/v1/auth/me  (protected)
router.get("/me", protect, getMe);

// GET /api/v1/auth/profile  (protected)
router.get("/profile", protect, getMe);

// PATCH /api/v1/auth/profile  (protected)
router.patch("/profile", protect, asyncHandler(async (req, res) => {
  const allowed = ["username", "country", "avatar"];
  const update = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) update[field] = req.body[field];
  });
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
  return successResponse(res, 200, "Profile updated successfully", user);
}));

// DELETE /api/v1/auth/profile  (protected)
router.delete("/profile", protect, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  return successResponse(res, 200, "Profile deleted successfully", null);
}));

// POST /api/v1/auth/logout  (protected)
router.post("/logout", protect, logout);

// POST /api/v1/auth/forgot-password
router.post("/forgot-password", asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Password reset request accepted", { email: req.body.email || null });
}));

// POST /api/v1/auth/reset-password
router.post("/reset-password", asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Password reset endpoint is available", null);
}));

// POST /api/v1/auth/verify-email
router.post("/verify-email", asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Email verification endpoint is available", null);
}));

// POST /api/v1/auth/refresh-token
router.post("/refresh-token", protect, asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Token refresh endpoint is available", { user: req.user });
}));

module.exports = router;
