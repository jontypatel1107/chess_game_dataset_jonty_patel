# Chess Game Dataset API

A Node.js, Express, and MongoDB backend for managing chess users, games, tournaments, leaderboards, openings, analytics, and searchable chess dataset records.

The project is organized as a REST API with MVC-style folders, JWT authentication, reusable middleware, pagination helpers, aggregation endpoints, and a database seeding script for sample chess data.

## Features

- User registration, login, JWT-protected routes, and profile management
- Chess game creation, move tracking, game completion, and ELO updates
- Tournament creation, player registration, and tournament statistics
- Leaderboard APIs with category filters and rating distribution
- Player, opening, search, analytics, admin, system, and stats endpoints
- MongoDB Atlas integration through Mongoose models
- Request logging, rate limiting, input validation, and centralized error handling
- Standard JSON response format for success and error responses
- Seed script with sample users, games, tournaments, and leaderboard data
- Dataset import script for loading the chess JSON dataset into MongoDB Atlas

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Tokens
- bcryptjs
- express-rate-limit
- morgan
- nodemon

## Project Structure

```text
chess_game_dataset_jonty_patel/
+-- README.md
`-- chess-backend/
    +-- config/
    |   `-- db.js
    +-- controllers/
    +-- data/
    |   `-- openings.js
    +-- middlewares/
    +-- models/
    |   +-- Game.js
    |   +-- Leaderboard.js
    |   +-- Tournament.js
    |   `-- User.js
    +-- routes/
    +-- services/
    +-- utils/
    +-- .env.example
    +-- importDataset.js
    +-- package.json
    +-- seed.js
    `-- server.js
```

## Getting Started

### 1. Install Dependencies

```bash
cd chess-backend
npm install
```

### 2. Configure Environment Variables

Create a local `.env` file from the example file:

```bash
cp .env.example .env
```

Update the values in `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_strong_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Keep real MongoDB credentials and JWT secrets out of Git.

### 3. Run the API

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server runs on:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/health
GET http://localhost:5000/api/v1/health
```

### 4. Seed the Database

```bash
npm run seed
```

Sample login credentials after seeding:

| Role | Email | Password |
| --- | --- | --- |
| Admin | magnus@chess.com | password123 |
| Player | fisher@chess.com | password123 |
| Player | karpov@chess.com | password123 |

### 5. Import the Chess Dataset

Place the dataset file in the backend folder with this exact name:

```text
chess-backend/Chess Game Dataset.json
```

Then run:

```bash
npm run import:data
```

The importer reads the JSON dataset, creates or updates players, and stores games in MongoDB Atlas. It uses the original dataset game `id` as `sourceId`, so running the command again updates existing imported games instead of creating duplicates.

The dataset file is ignored by Git because it is a large local data file.

## API Base URL

```text
http://localhost:5000/api/v1
```

## Main API Routes

| Route | Purpose |
| --- | --- |
| `/auth` | Register, login, current user, logout |
| `/users` | User listing, profile, stats, and admin deletion |
| `/games` | Game creation, moves, status updates, and game stats |
| `/tournaments` | Tournament listing, creation, updates, and registration |
| `/leaderboard` | Rankings, top players, and rating distribution |
| `/matches` | Match-related dataset endpoints |
| `/players` | Player dataset and profile endpoints |
| `/openings` | Chess opening data |
| `/search` | Search across chess data |
| `/analytics` | Analytics and aggregation endpoints |
| `/stats` | Project-level statistics endpoints |
| `/admin` | Admin-only operations |
| `/system` | System/status utilities |
| `/middleware` | Middleware demonstration routes |
| `/protected` | JWT-protected route examples |

## Authentication

Protected endpoints require a bearer token:

```http
Authorization: Bearer <jwt_token>
```

You can get a token by logging in:

```http
POST /api/v1/auth/login
```

## Example Queries

```text
GET /api/v1/users?search=magnus&sortBy=rating&order=desc&page=1&limit=10
GET /api/v1/games?status=ongoing&timeControl=rapid&playerId=<user_id>
GET /api/v1/tournaments?status=upcoming&format=swiss&search=grand
GET /api/v1/leaderboard?category=blitz&country=India&page=1&limit=20
```

## Response Format

Success response:

```json
{
  "success": true,
  "message": "Games fetched successfully",
  "data": [],
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

Error response:

```json
{
  "success": false,
  "message": "Token has expired. Please log in again."
}
```

## Useful Scripts

Run these commands inside `chess-backend/`.

| Command | Description |
| --- | --- |
| `npm install` | Install project dependencies |
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start server with Node.js |
| `npm run seed` | Seed MongoDB with sample chess data |
| `npm run import:data` | Import `Chess Game Dataset.json` into MongoDB Atlas |

## Notes

- The backend README inside `chess-backend/` contains more detailed endpoint notes.
- `node_modules/` should not be committed.
- `Chess Game Dataset.json` is intentionally ignored by Git.
- Make sure your MongoDB Atlas cluster allows connections from your IP address before starting the server.
