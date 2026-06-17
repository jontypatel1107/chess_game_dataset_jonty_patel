# ♟️ Chess Game Backend API

A production-ready, full-featured Chess Game REST API built with **Node.js**, **Express.js**, and **MongoDB Atlas** following MVC architecture.

---

## 🗂️ Project Structure

```
chess-backend/
├── config/
│   └── db.js                  # MongoDB Atlas connection
├── controllers/
│   ├── authController.js      # Request/response only
│   ├── userController.js
│   ├── gameController.js
│   ├── tournamentController.js
│   └── leaderboardController.js
├── middlewares/
│   ├── auth.js                # JWT protect + adminOnly
│   ├── logger.js              # Request logging
│   ├── validate.js            # Input validation
│   └── errorHandler.js        # Global error handler
├── models/
│   ├── User.js                # Mongoose schema + bcrypt
│   ├── Game.js                # Embedded moves array
│   ├── Tournament.js
│   └── Leaderboard.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── gameRoutes.js
│   ├── tournamentRoutes.js
│   └── leaderboardRoutes.js
├── services/
│   ├── authService.js         # Business logic
│   ├── userService.js
│   ├── gameService.js         # ELO calculation
│   ├── tournamentService.js
│   └── leaderboardService.js
├── utils/
│   ├── response.js            # Standardized API responses
│   ├── asyncHandler.js        # Centralized async error wrapper
│   └── pagination.js          # Reusable pagination utility
├── seed.js                    # DB seeder with chess dataset
├── server.js                  # Express app entry point
├── .env.example
└── package.json
```

---

## ⚙️ Setup Instructions

### 1. Clone and Install
```bash
git clone <your-repo>
cd chess-backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/chess_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user (username + password)
4. Whitelist your IP (or use `0.0.0.0/0` for dev)
5. Get connection string → paste into `MONGO_URI`

### 4. Run the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Seed database with test data
npm run seed
```

---

## 🗃️ Database Schema (MongoDB Collections)

### Collections & Relationships

| Collection    | Relationship                              |
|---------------|-------------------------------------------|
| `users`       | Core entity — referenced by all others    |
| `games`       | References `users` (white/black/winner); embeds `moves[]` |
| `tournaments` | References `users`, `games`; embeds `registeredPlayers[]` |
| `leaderboards`| References `users` (one-to-one)           |

### Schema Design Decisions
- **Moves** → **Embedded** in Game (read together, write together, max ~300/game)
- **RegisteredPlayers** → **Embedded** in Tournament (array with score tracking)
- **Players in Game/Tournament** → **Referenced** (need full user profile separately)

---

## 📡 API Endpoints

### 🔐 Authentication  `/api/v1/auth`
| Method | Endpoint          | Auth | Description           |
|--------|-------------------|------|-----------------------|
| POST   | `/register`       | ❌   | Register new player   |
| POST   | `/login`          | ❌   | Login & get JWT token |
| GET    | `/me`             | ✅   | Get current user      |
| POST   | `/logout`         | ✅   | Logout (client-side)  |

### 👤 Users  `/api/v1/users`
| Method | Endpoint          | Auth  | Description                          |
|--------|-------------------|-------|--------------------------------------|
| GET    | `/`               | ❌    | All users (search, sort, pagination) |
| GET    | `/:id`            | ❌    | Single user profile                  |
| GET    | `/:id/stats`      | ❌    | User game stats (aggregation)        |
| PUT    | `/profile`        | ✅    | Update own profile                   |
| DELETE | `/:id`            | ✅👑  | Soft delete user (admin only)        |

### ♟️ Games  `/api/v1/games`
| Method | Endpoint          | Auth | Description                             |
|--------|-------------------|------|-----------------------------------------|
| GET    | `/`               | ❌   | All games (filter by status/timeControl)|
| GET    | `/stats`          | ❌   | Game statistics (aggregation pipeline)  |
| POST   | `/`               | ✅   | Create new game                         |
| GET    | `/:id`            | ❌   | Single game with all moves              |
| POST   | `/:id/move`       | ✅   | Add a move to game                      |
| PATCH  | `/:id/end`        | ✅   | End a game (resign/draw/timeout)        |

### 🏆 Tournaments  `/api/v1/tournaments`
| Method | Endpoint           | Auth | Description                       |
|--------|--------------------|------|-----------------------------------|
| GET    | `/`                | ❌   | All tournaments (filter/search)   |
| GET    | `/stats`           | ❌   | Tournament statistics (aggregation)|
| POST   | `/`                | ✅   | Create tournament                 |
| GET    | `/:id`             | ❌   | Single tournament + players       |
| PUT    | `/:id`             | ✅   | Update tournament (organizer only)|
| DELETE | `/:id`             | ✅   | Delete tournament (organizer only)|
| POST   | `/:id/register`    | ✅   | Register for tournament           |

### 📊 Leaderboard  `/api/v1/leaderboard`
| Method | Endpoint                   | Auth | Description                      |
|--------|----------------------------|------|----------------------------------|
| GET    | `/`                        | ❌   | Paginated leaderboard            |
| GET    | `/top-by-time-control`     | ❌   | Top player per time control      |
| GET    | `/rating-distribution`     | ❌   | ELO rating distribution buckets  |

### 🎮 Players  `/api/v1/players`
| Method | Endpoint                        | Auth | Description                      |
|--------|---------------------------------|------|----------------------------------|
| GET    | `/`                             | ❌   | All active players (paginated)   |
| GET    | `/top-rated`                    | ❌   | Top N by rating                  |
| GET    | `/top-active`                   | ❌   | Top N by games played            |
| GET    | `/top-winning`                  | ❌   | Top N by wins                    |
| GET    | `/rating-range`                 | ❌   | Players within rating range      |
| GET    | `/compare/:player1/:player2`    | ❌   | Compare two players by username  |
| GET    | `/:username`                    | ❌   | Single player by username        |
| GET    | `/:username/history`            | ❌   | Match history (paginated)        |
| GET    | `/:username/stats`              | ❌   | Win/loss/draw statistics         |
| GET    | `/:username/openings`           | ❌   | Opening usage                    |
| GET    | `/:username/rating-history`     | ❌   | Rating history                   |
| GET    | `/:username/win-rate`           | ❌   | Win rate percentage              |
| GET    | `/:username/loss-rate`          | ❌   | Loss rate percentage             |
| GET    | `/:username/draw-rate`          | ❌   | Draw rate percentage             |
| GET    | `/:username/recent`             | ❌   | Recent N matches                 |

### 🏁 Openings  `/api/v1/openings`
| Method | Endpoint                   | Auth | Description                      |
|--------|----------------------------|------|----------------------------------|
| GET    | `/`                        | ❌   | Paginated openings list          |
| GET    | `/popular`                 | ❌   | Top 50 popular openings          |
| GET    | `/trending`                | ❌   | Top 5 trending                   |
| GET    | `/search`                  | ❌   | Search by name or ECO code       |
| GET    | `/win-rates`               | ❌   | Top 50 with win rates            |
| GET    | `/aggressive`              | ❌   | Aggressive-style openings        |
| GET    | `/defensive`               | ❌   | Defensive-style openings         |
| GET    | `/gambits`                 | ❌   | Gambit openings                  |
| GET    | `/eco/:ecoCode`            | ❌   | Openings by ECO code             |

### 🔍 Search  `/api/v1/search`
| Method | Endpoint                   | Auth | Description                      |
|--------|----------------------------|------|----------------------------------|
| GET    | `/matches`                 | ❌   | Search matches by PGN/moves      |
| GET    | `/players`                 | ❌   | Search players by username       |
| GET    | `/openings`                | ❌   | Search openings by name/ECO      |
| GET    | `/eco`                     | ❌   | Search by ECO code               |
| GET    | `/moves`                   | ❌   | Search by move sequence          |
| GET    | `/fuzzy`                   | ❌   | Fuzzy search on opening names    |
| GET    | `/autocomplete`            | ❌   | Autocomplete for openings/players|
| GET    | `/advanced`                | ❌   | Multi-filter search              |
| GET    | `/date-range`              | ❌   | Games within date range          |

### 📈 Analytics  `/api/v1/analytics`
| Method | Endpoint                   | Auth | Description                      |
|--------|----------------------------|------|----------------------------------|
| GET    | `/top-games`               | ❌   | Top games by move count          |
| GET    | `/victory-distribution`    | ❌   | Result distribution              |
| GET    | `/color-advantage`         | ❌   | White/black win rates            |
| GET    | `/turn-count-average`      | ❌   | Average moves per game           |
| GET    | `/rated-vs-casual`         | ❌   | Rated vs casual count            |
| GET    | `/time-control-usage`      | ❌   | Time control distribution        |
| GET    | `/shortest-games`          | ❌   | 10 shortest games                |
| GET    | `/longest-games`           | ❌   | 10 longest games                 |
| GET    | `/rating-gap-upsets`       | ❌   | Biggest rating gap upsets        |
| GET    | `/hourly-activity`         | ❌   | Games per hour of day            |

### 📊 Stats  `/api/v1/stats`
| Method | Endpoint                   | Auth | Description                      |
|--------|----------------------------|------|----------------------------------|
| GET    | `/total-matches`           | ❌   | Total game count                 |
| GET    | `/total-players`           | ❌   | Total active players             |
| GET    | `/average-rating`          | ❌   | Average player rating            |
| GET    | `/top-openings`            | ❌   | Top 10 most played openings      |
| GET    | `/checkmate-rate`          | ❌   | Checkmate rate                   |
| GET    | `/resignation-rate`        | ❌   | Resignation rate                 |
| GET    | `/white-win-rate`          | ❌   | White win rate                   |
| GET    | `/black-win-rate`          | ❌   | Black win rate                   |
| GET    | `/draw-rate`               | ❌   | Draw rate                        |
| GET    | `/daily-games`             | ❌   | Games per day                    |
| GET    | `/monthly-games`           | ❌   | Games per month                  |

### 🔐 Admin  `/api/v1/admin`
| Method | Endpoint                   | Auth  | Description                      |
|--------|----------------------------|-------|----------------------------------|
| GET    | `/users`                   | ✅👑  | List all users                   |
| GET    | `/logs`                    | ✅👑  | System logs                      |
| GET    | `/system/health`           | ✅👑  | Admin health check               |
| DELETE | `/cache/clear`             | ✅👑  | Clear cache                      |
| PATCH  | `/users/:id/ban`           | ✅👑  | Ban a user                       |
| PATCH  | `/users/:id/unban`         | ✅👑  | Unban a user                     |

### ⚙️ System  `/api/v1/system`
| Method | Endpoint                   | Auth  | Description                      |
|--------|----------------------------|-------|----------------------------------|
| GET    | `/info`                    | ❌    | System info                      |
| GET    | `/version`                 | ❌    | API version                      |
| GET    | `/status`                  | ❌    | System status                    |
| GET    | `/uptime`                  | ✅👑  | Server uptime                    |
| GET    | `/database/status`         | ✅👑  | MongoDB connection status        |
| GET    | `/performance`             | ✅👑  | Memory usage metrics             |
| GET    | `/storage`                 | ✅👑  | Match and player counts          |

---

## 🔍 Query Parameters

### Filtering & Search
```
GET /api/v1/users?search=magnus&sortBy=rating&order=desc&page=1&limit=10
GET /api/v1/games?status=ongoing&timeControl=rapid&playerId=<id>
GET /api/v1/tournaments?status=upcoming&format=swiss&search=grand
GET /api/v1/leaderboard?category=blitz&country=India&page=1&limit=20
```

---

## 📦 Standard API Response Format

### Success
```json
{
  "success": true,
  "message": "Games fetched successfully",
  "data": [ ... ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Token has expired. Please log in again."
}
```

---

## 🔒 Authentication

All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

JWT expires in **7 days** (configurable via `JWT_EXPIRES_IN`).

---

## 🛠️ Good-to-Have Features Implemented

| Feature | Status |
|---------|--------|
| API Response Standardization | ✅ |
| JWT Token Expiry Handling | ✅ |
| bcrypt Password Hashing (salt=12) | ✅ |
| Rate Limiting (100 req/15min, 10 auth/15min) | ✅ |
| Request Logging Middleware | ✅ |
| Centralized Async Error Handler | ✅ |
| Input Validation Layer | ✅ |
| Reusable Pagination Utility | ✅ |
| Health Check API (`GET /health`) | ✅ |
| API Versioning (`/api/v1`) | ✅ |
| Soft Delete (isActive flag) | ✅ |
| Timestamp Tracking (createdAt/updatedAt) | ✅ |
| Database Seeding Script | ✅ |
| ELO Rating Calculation | ✅ (bonus) |
| Aggregation Pipelines | ✅ |

---

## 🌱 Test Credentials (after `npm run seed`)

| Role   | Email                | Password    |
|--------|----------------------|-------------|
| Admin  | magnus@chess.com     | password123 |
| Player | fisher@chess.com     | password123 |
| Player | karpov@chess.com     | password123 |

---

## 🔬 Aggregation Pipelines Used

1. **`GET /api/v1/games/stats`** — Group by status + result + time control
2. **`GET /api/v1/users/:id/stats`** — Per-user win/loss/draw from games
3. **`GET /api/v1/leaderboard/top-by-time-control`** — Top player per category
4. **`GET /api/v1/leaderboard/rating-distribution`** — ELO bucket distribution
5. **`GET /api/v1/tournaments/stats`** — Tournament status aggregation

---

## 📬 Postman Collection

Import `Chess-API-Postman-Collection.json` into Postman for a complete API workspace.

All 129 endpoints are pre-configured with:
- Full URLs, query parameters, and route variables
- Request body examples for POST/PUT/PATCH endpoints
- Auth headers using `{{token}}` variable
- Descriptions for each endpoint

**Setup:**
1. Set `base_url` variable (default: `http://localhost:5000`)
2. Call `POST /api/v1/auth/login` → copy the JWT token
3. Set `token` variable → all protected routes auto-inject `Authorization: Bearer {{token}}`

---

## 🚀 Deployment (Render)

### Web Service
- **Root Directory:** `chess-backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Required Env Vars:** `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`

A `Procfile` is included for Render compatibility.

---

## Dataset Import

This backend includes an importer for the local chess JSON dataset.

Place the dataset file in the backend root folder with this exact name:

```text
Chess Game Dataset.json
```

Then run:

```bash
npm run import:data
```

The importer:
- Reads `Chess Game Dataset.json`
- Creates or updates players from `white_id` and `black_id`
- Stores games in MongoDB Atlas using the existing `Game` model
- Saves dataset metadata such as `sourceId`, `moveText`, opening data, rated status, and increment code
- Upserts games by `{ source, sourceId }` so repeated imports do not create duplicates

Import result from the provided dataset:

| Item | Count |
|------|-------|
| Dataset rows | 20,058 |
| Unique games imported | 19,113 |
| Duplicate dataset IDs | 945 |
| Players imported | 15,635 |

`Chess Game Dataset.json` is ignored by Git because it is a large local dataset file.
