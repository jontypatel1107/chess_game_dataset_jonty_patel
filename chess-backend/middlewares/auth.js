const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { errorResponse } = require("../utils/response");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, 401, "Access denied. No token provided.");
    }

    // Verify token and handle expiry specifically
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return errorResponse(res, 401, "Token has expired. Please log in again.");
      }
      if (err.name === "JsonWebTokenError") {
        return errorResponse(res, 401, "Invalid token. Please log in again.");
      }
      return errorResponse(res, 401, "Token verification failed.");
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return errorResponse(res, 401, "User belonging to this token no longer exists.");
    }

    if (!user.isActive) {
      return errorResponse(res, 403, "Your account has been deactivated.");
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 500, "Authentication error", error.message);
  }
};

// Admin-only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return errorResponse(res, 403, "Access denied. Admins only.");
};

module.exports = { protect, adminOnly };
