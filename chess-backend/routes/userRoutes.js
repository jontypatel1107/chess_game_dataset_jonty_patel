const express = require("express");
const router = express.Router();
const {
  getAllUsers, getUserById, updateProfile, deleteUser, getUserStats,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middlewares/auth");

// GET /api/v1/users           → all users (public, filterable)
router.get("/", getAllUsers);

// GET /api/v1/users/:id       → single user profile
router.get("/:id", getUserById);

// GET /api/v1/users/:id/stats → user game stats (aggregation)
router.get("/:id/stats", getUserStats);

// PUT /api/v1/users/profile   → update own profile (protected)
router.put("/profile", protect, updateProfile);

// DELETE /api/v1/users/:id    → soft delete user (admin only)
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
