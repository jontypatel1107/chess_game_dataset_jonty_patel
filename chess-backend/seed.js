require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Game = require("./models/Game");
const Tournament = require("./models/Tournament");
const Leaderboard = require("./models/Leaderboard");

const seedData = async () => {
  await connectDB();
  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Game.deleteMany({}),
    Tournament.deleteMany({}),
    Leaderboard.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // Create users
  const users = await User.create([
    { username: "MagnusMaster", email: "magnus@chess.com", password: "password123", rating: 2850, country: "Norway", wins: 120, losses: 10, draws: 30, gamesPlayed: 160, role: "admin" },
    { username: "FisherKing",   email: "fisher@chess.com", password: "password123", rating: 2780, country: "USA",    wins: 100, losses: 15, draws: 20, gamesPlayed: 135 },
    { username: "KarpovKnight", email: "karpov@chess.com", password: "password123", rating: 2720, country: "Russia", wins: 90,  losses: 20, draws: 40, gamesPlayed: 150 },
    { username: "TalAttacker",  email: "tal@chess.com",    password: "password123", rating: 2650, country: "Latvia", wins: 80,  losses: 25, draws: 15, gamesPlayed: 120 },
    { username: "NimzoNinja",   email: "nimzo@chess.com",  password: "password123", rating: 1600, country: "India",  wins: 40,  losses: 50, draws: 10, gamesPlayed: 100 },
    { username: "PawnPusher",   email: "pawn@chess.com",   password: "password123", rating: 1200, country: "India",  wins: 20,  losses: 70, draws: 10, gamesPlayed: 100 },
  ]);
  console.log(`✅ Created ${users.length} users`);

  // Create leaderboard entries
  await Leaderboard.create(users.map((u) => ({
    player: u._id,
    rating: u.rating,
    gamesPlayed: u.gamesPlayed,
    wins: u.wins,
    losses: u.losses,
    draws: u.draws,
    category: "overall",
  })));
  console.log("✅ Created leaderboard entries");

  // Create games
  const games = await Game.create([
    {
      whitePlayer: users[0]._id,
      blackPlayer: users[1]._id,
      status: "completed",
      result: "white_wins",
      winner: users[0]._id,
      endReason: "checkmate",
      timeControl: "rapid",
      totalMoves: 42,
      startedAt: new Date("2024-01-10"),
      endedAt: new Date("2024-01-10"),
      moves: [
        { moveNumber: 1, player: users[0]._id, from: "e2", to: "e4", piece: "pawn", notation: "e4" },
        { moveNumber: 2, player: users[1]._id, from: "e7", to: "e5", piece: "pawn", notation: "e5" },
        { moveNumber: 3, player: users[0]._id, from: "g1", to: "f3", piece: "knight", notation: "Nf3" },
      ],
    },
    {
      whitePlayer: users[2]._id,
      blackPlayer: users[3]._id,
      status: "completed",
      result: "draw",
      endReason: "stalemate",
      timeControl: "blitz",
      totalMoves: 60,
      startedAt: new Date("2024-01-12"),
      endedAt: new Date("2024-01-12"),
    },
    {
      whitePlayer: users[1]._id,
      blackPlayer: users[4]._id,
      status: "ongoing",
      timeControl: "classical",
      totalMoves: 15,
      startedAt: new Date(),
    },
    {
      whitePlayer: users[4]._id,
      blackPlayer: users[5]._id,
      status: "completed",
      result: "black_wins",
      winner: users[5]._id,
      endReason: "resignation",
      timeControl: "bullet",
      totalMoves: 22,
      startedAt: new Date("2024-01-15"),
      endedAt: new Date("2024-01-15"),
    },
  ]);
  console.log(`✅ Created ${games.length} games`);

  // Create tournament
  await Tournament.create({
    name: "Grand Chess Championship 2024",
    description: "Annual rapid chess tournament open to all ratings",
    organizer: users[0]._id,
    format: "swiss",
    timeControl: "rapid",
    status: "upcoming",
    maxPlayers: 32,
    startDate: new Date("2024-03-01"),
    prizePool: 5000,
    registeredPlayers: [
      { player: users[0]._id },
      { player: users[1]._id },
      { player: users[2]._id },
      { player: users[3]._id },
    ],
    games: [games[0]._id],
  });
  console.log("✅ Created tournament");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Test Credentials:");
  console.log("   Admin  → magnus@chess.com  / password123");
  console.log("   Player → fisher@chess.com  / password123");
  process.exit(0);
};

seedData().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
