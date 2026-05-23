const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse, paginatedResponse } = require("../utils/response");

const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, sortBy, order } = req.query;
  const { users, pagination } = await userService.getAllUsers({ page, limit, search, sortBy, order });
  return paginatedResponse(res, "Users fetched successfully", users, pagination);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return successResponse(res, 200, "User fetched successfully", user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user._id, req.body);
  return successResponse(res, 200, "Profile updated successfully", user);
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  return successResponse(res, 200, "User deactivated successfully", null);
});

const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats(req.params.id);
  return successResponse(res, 200, "User stats fetched successfully", stats);
});

module.exports = { getAllUsers, getUserById, updateProfile, deleteUser, getUserStats };
