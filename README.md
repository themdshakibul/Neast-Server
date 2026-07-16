# Neast API

Express 5 + TypeScript backend for the Neast learning platform.

## Tech Stack

- **Runtime:** Node.js, TypeScript
- **Framework:** Express 5
- **Database:** MongoDB + Mongoose 9
- **Auth:** JWT (bcryptjs + jsonwebtoken)
- **Validation:** Zod 4

## Setup

```bash
npm install
cp .env.example .env   # edit with your values
npm run dev            # nodemon + tsx (port 5000)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload (tsx) |
| `npm run build` | Compile TS → `dist/` |
| `npm start` | Run compiled JS from `dist/` |

## API Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `POST /api/auth/register` | — | Register user |
| `POST /api/auth/login` | — | Login, returns JWT |
| `GET /api/items` | — | List items (paginated, filterable) |
| `GET /api/items/:id` | — | Single item + related |
| `POST /api/items` | JWT | Create item |
| `DELETE /api/items/:id` | JWT | Delete item (owner or admin) |
| `GET /api/health` | — | Health check |

## Environment

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/neast
JWT_SECRET=your-secret-min-32-chars
JWT_EXPIRES_IN=7d
```
