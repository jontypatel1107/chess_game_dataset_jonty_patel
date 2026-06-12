require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Game = require("./models/Game");
const Tournament = require("./models/Tournament");
const Leaderboard = require("./models/Leaderboard");

const moveSequences = [
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Nb8 d4 Nbd7",
  "d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O Nc6 a3 Bxc3 bxc3 dxc4 Bxc4 Qc7",
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5 Nb3 Be6 f3 Be7 Qd2 O-O O-O-O Nbd7 g4 b5 g5 b4 Ne2 Ne8 f4 a5 f5 a4",
  "c4 e5 Nc3 Nf6 Nf3 Nc6 g3 d5 cxd5 Nxd5 Bg2 Nb6 O-O Be7 a3 O-O b4 Be6 d3 f6 Ne4 a5 Nc5 Bxc5 bxc5 Nd5",
  "e4 e6 d4 d5 Nc3 Bb4 e5 c5 a3 Bxc3+ bxc3 Ne7 Qg4 O-O Bd3 Nbc6 Nf3 f5 exf6 Rxf6 Bg5 Rf7 Qh5 g6 Qd1",
];

const openings = [
  { name: "Sicilian Defense: Najdorf Variation", eco: "B90" },
  { name: "Ruy Lopez: Marshall Attack", eco: "C89" },
  { name: "Queen's Gambit Declined", eco: "D30" },
  { name: "King's Indian Defense", eco: "E60" },
  { name: "Caro-Kann Defense: Advance Variation", eco: "B12" }
];

const reasons = ["checkmate", "resignation", "timeout", "stalemate", "mutual_agreement"];

const seedData = async () => {
  await connectDB();
  console.log("🌱 Starting realistic database seed...\n");

  await Promise.all([User.deleteMany({}), Game.deleteMany({}), Tournament.deleteMany({}), Leaderboard.deleteMany({})]);

  const users = await User.create([
    { username: "MagnusMaster", email: "magnus@chess.com", password: "password123", rating: 2850, role: "admin" },
    { username: "FisherKing",   email: "fisher@chess.com", password: "password123", rating: 2780 },
    { username: "KarpovKnight", email: "karpov@chess.com", password: "password123", rating: 2720 },
    { username: "TalAttacker",  email: "tal@chess.com",    password: "password123", rating: 2650 },
    { username: "NimzoNinja",   email: "nimzo@chess.com",  password: "password123", rating: 1600 },
    { username: "PawnPusher",   email: "pawn@chess.com",   password: "password123", rating: 1200 },
  ]);

  const gamesToCreate = [];
  for (let i = 1; i <= 30; i++) {
    const whiteIdx = Math.floor(Math.random() * users.length);
    let blackIdx = Math.floor(Math.random() * users.length);
    while (blackIdx === whiteIdx) blackIdx = Math.floor(Math.random() * users.length);

    const sequence = moveSequences[Math.floor(Math.random() * moveSequences.length)];
    const opening = openings[Math.floor(Math.random() * openings.length)];
    const result = Math.random() > 0.4 ? (Math.random() > 0.5 ? "white_wins" : "black_wins") : "draw";
    
    gamesToCreate.push({
      sourceId: `seed-game-${i}`,
      whitePlayer: users[whiteIdx]._id,
      blackPlayer: users[blackIdx]._id,
      status: "completed",
      result: result,
      winner: result === "white_wins" ? users[whiteIdx]._id : (result === "black_wins" ? users[blackIdx]._id : null),
      endReason: reasons[Math.floor(Math.random() * reasons.length)],
      timeControl: ["blitz", "rapid", "classical"][Math.floor(Math.random() * 3)],
      rated: true,
      moveText: sequence,
      totalMoves: sequence.split(" ").length,
      opening: opening,
      playerRatings: { white: users[whiteIdx].rating, black: users[blackIdx].rating },
      createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30),
    });
  }

  await Game.create(gamesToCreate);
  await Leaderboard.create(users.map((u) => ({ player: u._id, rating: u.rating })));

  console.log("\n🎉 Seeded 30 matches with real move history!");
  process.exit(0);
};

seedData().catch(err => { console.error(err); process.exit(1); });
