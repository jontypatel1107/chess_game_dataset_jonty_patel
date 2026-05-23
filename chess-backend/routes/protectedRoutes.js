const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/response");
const { protect } = require("../middlewares/auth");
const { Game, gamePopulate } = require("../utils/apiHelpers");

router.use(protect);

router.get("/matches", asyncHandler(async (req, res) => {
  const matches = await Game.find({ $or: [{ whitePlayer: req.user._id }, { blackPlayer: req.user._id }] }).populate(gamePopulate);
  return successResponse(res, 200, "Protected matches fetched successfully", matches);
}));
router.post("/matches", asyncHandler(async (req, res) => {
  const match = await Game.create({ ...req.body, whitePlayer: req.body.whitePlayer || req.user._id });
  return successResponse(res, 201, "Protected match created successfully", match);
}));
router.patch("/matches/:id", asyncHandler(async (req, res) => {
  const match = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(gamePopulate);
  return successResponse(res, 200, "Protected match updated successfully", match);
}));
router.delete("/matches/:id", asyncHandler(async (req, res) => {
  await Game.findByIdAndDelete(req.params.id);
  return successResponse(res, 200, "Protected match deleted successfully", null);
}));

module.exports = router;
