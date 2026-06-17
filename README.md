# Chess Game Dataset

A full-stack chess analytics platform with a **Node.js/Express/MongoDB** REST API backend and a **React/Vite/Redux** frontend dashboard.

## Tech Stack

### Backend
- Node.js, Express.js, MongoDB Atlas, Mongoose
- JWT authentication, bcrypt, express-rate-limit
- 4 Mongoose models (User, Game, Tournament, Leaderboard)
- 129 REST API endpoints across 12 route modules

### Frontend
- React 18, Vite 5, Redux Toolkit, React Router v6
- Material UI 5, Tailwind CSS 3, Recharts, Framer Motion
- Axios with JWT interceptor, Formik + Yup validation
- Lazy-loaded pages with Suspense, ErrorBoundary

## Project Structure

```
chess_game_dataset_jonty_patel/
├── README.md
├── chess-backend/           # REST API server
│   ├── config/              # MongoDB connection
│   ├── controllers/         # Request handlers
│   ├── middlewares/          # Auth, validation, error handling
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Route definitions (15 files)
│   ├── services/            # Business logic
│   ├── utils/               # Pagination, response helpers
│   ├── server.js            # Entry point
│   ├── Procfile             # Render deployment config
│   └── Chess-API-Postman-Collection.json
└── chess-frontend/          # React dashboard
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── pages/           # Page components (lazy loaded)
    │   ├── services/        # Axios API services
    │   ├── store/           # Redux slices
    │   └── styles/          # Tailwind CSS
    ├── index.html
    └── vite.config.js
```

## Getting Started

### 1. Backend Setup

```bash
cd chess-backend
npm install
cp .env.example .env
```

Edit `.env` with your MongoDB Atlas URI and JWT secret:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/chess_db
JWT_SECRET=your_strong_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

```bash
# Start backend
npm run dev

# Seed sample data
npm run seed
```

### 2. Frontend Setup

```bash
cd chess-frontend
npm install

# Start dev server (proxies /api to localhost:5000)
npm run dev
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:5000`.

### 3. Import Chess Dataset

Place `Chess Game Dataset.json` in `chess-backend/`, then:

```bash
cd chess-backend
npm run import:data
```

## Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | magnus@chess.com | password123 |
| Player | fisher@chess.com | password123 |
| Player | karpov@chess.com | password123 |

## API Overview

Base URL: `http://localhost:5000/api/v1`

| Category | Endpoints | Auth |
|----------|-----------|------|
| Auth | Register, login, profile, logout | Mixed |
| Users | List, search, stats, update | Mixed |
| Games | CRUD, moves, end game, bulk ops | Mixed |
| Tournaments | CRUD, registration, stats | Mixed |
| Leaderboard | Rankings, top by TC, distribution | Public |
| Players | Search, compare, history, rates | Public |
| Openings | Popular, trending, by ECO/style | Public |
| Search | 15 search types (fuzzy, advanced, etc.) | Public |
| Analytics | Victory dist, upsets, frequencies | Public |
| Stats | Totals, rates, daily/monthly/yearly | Public |
| Admin | Users, logs, ban/unban, dashboard | Admin |
| System | Info, version, uptime, performance | Mixed |

## API Documentation (Postman)

Import `chess-backend/Chess-API-Postman-Collection.json` into Postman.

- Set `base_url` to your deployed or local backend URL
- Call `POST /auth/login` and set the `token` variable
- All 129 endpoints are pre-configured with headers, bodies, query params, and auth

## Deployment (Render)

### Backend (Web Service)
- **Root Directory:** `chess-backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Env Variables:** `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`

### Frontend (Static Site)
- **Root Directory:** `chess-frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Env Variables:** `VITE_API_URL=https://your-backend.onrender.com/api/v1`

## Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": [],
  "pagination": {
    "total": 50, "page": 1, "limit": 10,
    "totalPages": 5, "hasNextPage": true, "hasPrevPage": false
  }
}
```

## Scripts

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with nodemon |
| `npm start` | Production start |
| `npm run seed` | Seed sample data |
| `npm run import:data` | Import chess dataset |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (port 3000) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
