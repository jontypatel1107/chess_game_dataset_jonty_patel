const { errorResponse } = require("../utils/response");

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || username.trim().length < 3)
    errors.push("Username must be at least 3 characters");
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    errors.push("Valid email is required");
  if (!password || password.length < 6)
    errors.push("Password must be at least 6 characters");

  if (errors.length > 0) {
    return errorResponse(res, 400, errors.join(". "));
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return errorResponse(res, 400, "Email and password are required");
  }
  next();
};

const validateGame = (req, res, next) => {
  const { blackPlayer, timeControl } = req.body;
  if (!blackPlayer) {
    return errorResponse(res, 400, "Black player ID is required");
  }
  const validTimeControls = ["bullet", "blitz", "rapid", "classical", "unlimited"];
  if (timeControl && !validTimeControls.includes(timeControl)) {
    return errorResponse(res, 400, `Invalid time control. Must be one of: ${validTimeControls.join(", ")}`);
  }
  next();
};

const validateTournament = (req, res, next) => {
  const { name, maxPlayers, startDate } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) errors.push("Tournament name must be at least 3 characters");
  if (!maxPlayers || maxPlayers < 2) errors.push("maxPlayers must be at least 2");
  if (!startDate) errors.push("Start date is required");

  if (errors.length > 0) {
    return errorResponse(res, 400, errors.join(". "));
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateGame, validateTournament };
