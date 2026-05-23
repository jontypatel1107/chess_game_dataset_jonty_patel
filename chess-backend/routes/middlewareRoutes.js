const express = require("express");
const router = express.Router();
const { successResponse } = require("../utils/response");

router.get("/logger", (req, res) => successResponse(res, 200, "Logger middleware is enabled", { enabled: true }));
router.get("/auth", (req, res) => successResponse(res, 200, "Auth middleware is available", { enabled: true }));
router.get("/rate-limit", (req, res) => successResponse(res, 200, "Rate limiting middleware is enabled", { enabled: true }));
router.get("/error-handler", (req, res) => successResponse(res, 200, "Error handler middleware is enabled", { enabled: true }));

module.exports = router;
