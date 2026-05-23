const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/response");

const register = asyncHandler(async (req, res) => {
  const { username, email, password, country, avatar } = req.body;
  const result = await authService.registerUser({ username, email, password, country, avatar });
  return successResponse(res, 201, "User registered successfully", result);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });
  return successResponse(res, 200, "Login successful", result);
});

const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Profile fetched successfully", req.user);
});

const logout = asyncHandler(async (req, res) => {
  // Stateless JWT logout — client must discard token
  return successResponse(res, 200, "Logged out successfully. Please discard your token.", null);
});

module.exports = { register, login, getMe, logout };
