require("dotenv").config();

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Game = require("./models/Game");
const User = require("./models/User");

const DATASET_FILE = path.join(__dirname, "Chess Game Dataset.json");
const SOURCE = "lichess-dataset";
const DEFAULT_PASSWORD = "dataset-user";
const BATCH_SIZE = 1000;

const hash = (value) => crypto.createHash("sha1").update(String(value)).digest("hex").slice(0, 8);

const toUsername = (playerId) => {
  const raw = String(playerId || "unknown").trim() || "unknown";
  if (raw.length <= 30) return raw;
  return `${raw.slice(0, 21)}_${hash(raw)}`;
};

const toEmail = (playerId) => `user_${hash(playerId)}@chess-dataset.local`;

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const toDate = (value) => {
  const timestamp = toNumber(value, 0);
  return timestamp > 0 ? new Date(timestamp) : null;
};

const toResult = (winner) => {
  if (winner === "white") return "white_wins";
  if (winner === "black") return "black_wins";
  if (winner === "draw") return "draw";
  return "abandoned";
};

const toEndReason = (victoryStatus) => {
  const reasons = {
    mate: "checkmate",
    resign: "resignation",
    outoftime: "timeout",
    draw: "mutual_agreement",
  };
  return reasons[victoryStatus] || null;
};

const toTimeControl = (incrementCode) => {
  const baseMinutes = toNumber(String(incrementCode || "").split("+")[0], 10);
  if (baseMinutes < 3) return "bullet";
  if (baseMinutes < 10) return "blitz";
  if (baseMinutes < 60) return "rapid";
  return "classical";
};

const toTimeLimit = (incrementCode) => {
  const baseMinutes = toNumber(String(incrementCode || "").split("+")[0], 10);
  return baseMinutes > 0 ? baseMinutes * 60 : 600;
};

const flush = async (operations, label) => {
  if (operations.length === 0) return;
  const result = label === "users"
    ? await User.bulkWrite(operations, { ordered: false })
    : await Game.bulkWrite(operations, { ordered: false });

  console.log(`Imported ${label} batch:`, {
    inserted: result.insertedCount || result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
    matched: result.matchedCount || 0,
  });
  operations.length = 0;
};

const importDataset = async () => {
  await connectDB();

  const rows = JSON.parse(fs.readFileSync(DATASET_FILE, "utf8"));
  if (!Array.isArray(rows)) {
    throw new Error("Dataset must be a JSON array.");
  }

  console.log(`Found ${rows.length} dataset games`);

  const password = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const playerStats = new Map();

  rows.forEach((row) => {
    [
      { id: row.white_id, rating: row.white_rating, side: "white" },
      { id: row.black_id, rating: row.black_rating, side: "black" },
    ].forEach((player) => {
      const username = toUsername(player.id);
      const stats = playerStats.get(username) || {
        username,
        email: toEmail(player.id),
        password,
        rating: toNumber(player.rating, 1200),
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      };

      stats.rating = toNumber(player.rating, stats.rating);
      stats.gamesPlayed += 1;

      if (row.winner === "draw") stats.draws += 1;
      else if (row.winner === player.side) stats.wins += 1;
      else stats.losses += 1;

      playerStats.set(username, stats);
    });
  });

  const userOperations = [];
  for (const stats of playerStats.values()) {
    userOperations.push({
      updateOne: {
        filter: { username: stats.username },
        update: {
          $set: {
            rating: stats.rating,
            gamesPlayed: stats.gamesPlayed,
            wins: stats.wins,
            losses: stats.losses,
            draws: stats.draws,
            isActive: true,
          },
          $setOnInsert: {
            email: stats.email,
            password: stats.password,
            role: "player",
            country: "",
          },
        },
        upsert: true,
      },
    });

    if (userOperations.length >= BATCH_SIZE) await flush(userOperations, "users");
  }
  await flush(userOperations, "users");

  const users = await User.find({
    username: { $in: Array.from(playerStats.keys()) },
  }).select("_id username");
  const userByUsername = new Map(users.map((user) => [user.username, user._id]));

  const gameOperations = [];
  for (const row of rows) {
    const whitePlayer = userByUsername.get(toUsername(row.white_id));
    const blackPlayer = userByUsername.get(toUsername(row.black_id));
    const winner = row.winner === "white" ? whitePlayer : row.winner === "black" ? blackPlayer : null;

    gameOperations.push({
      updateOne: {
        filter: { source: SOURCE, sourceId: row.id },
        update: {
          $set: {
            whitePlayer,
            blackPlayer,
            status: "completed",
            result: toResult(row.winner),
            winner,
            endReason: toEndReason(row.victory_status),
            moveText: row.moves || "",
            totalMoves: toNumber(row.turns, 0),
            timeControl: toTimeControl(row.increment_code),
            timeLimit: toTimeLimit(row.increment_code),
            startedAt: toDate(row.created_at),
            endedAt: toDate(row.last_move_at),
            source: SOURCE,
            sourceId: row.id,
            rated: String(row.rated).toUpperCase() === "TRUE",
            incrementCode: row.increment_code || "",
            opening: {
              eco: row.opening_eco || "",
              name: row.opening_name || "",
              ply: toNumber(row.opening_ply, 0),
            },
          },
          $setOnInsert: {
            moves: [],
          },
        },
        upsert: true,
      },
    });

    if (gameOperations.length >= BATCH_SIZE) await flush(gameOperations, "games");
  }
  await flush(gameOperations, "games");

  const [userCount, gameCount] = await Promise.all([
    User.countDocuments({ username: { $in: Array.from(playerStats.keys()) } }),
    Game.countDocuments({ source: SOURCE }),
  ]);

  console.log(`Dataset import complete. Players: ${userCount}, games from ${SOURCE}: ${gameCount}`);
};

importDataset()
  .catch((error) => {
    console.error("Dataset import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
