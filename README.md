# KSB Shaker Challenge

A trade fair ice-breaker game that lets visitors shake a **KSB Guard** vibration sensor as hard as they can, see their score live on a dashboard, and naturally enter a conversation about condition monitoring.

## How it works

1. Visitor enters their name on the screen
2. They pick up the KSB Guard sensor and press **Start Challenge**
3. A 10-second countdown begins — they shake as hard as they can
4. Real-time vibration gauge shows mm/s measured by the sensor
5. When time is up, their score and leaderboard rank are displayed
6. A short pitch about KSB Guard condition monitoring is shown

Score = peak vibration (mm/s) × 100 &nbsp; (max 10 000 pts)

## Architecture

```
shakerchallenge/
├── backend/          Node.js + Express API
│   └── src/
│       ├── server.js     REST endpoints + static serving
│       ├── sensor.js     KSB Guard REST adapter + simulation
│       ├── game.js       Session management
│       └── leaderboard.js  In-memory + JSON persistence
└── frontend/         React + Vite + Tailwind CSS
    └── src/
        ├── App.jsx         Screen router (Idle / Active / Result)
        ├── hooks/useGameState.js
        └── components/
            ├── VibrationGauge.jsx
            ├── CountdownRing.jsx
            └── Leaderboard.jsx
```

## Setup

```bash
# Install dependencies
npm run install:all

# Start backend (simulation mode)
cd backend && cp .env.example .env && npm run dev

# Start frontend dev server (in another terminal)
cd frontend && npm run dev
# → http://localhost:5173
```

## Connecting the real KSB Guard sensor

1. Edit `backend/.env`:
   ```
   SENSOR_URL=http://<ksb-guard-ip>/api/measurements/latest
   SENSOR_MOCK=false
   ```
2. If the response JSON uses different field names, update the mapping in `backend/src/sensor.js`.

## Production build

```bash
# Build frontend
npm run build

# Run backend (serves built frontend + API on one port)
cd backend && npm start
# → http://localhost:3001
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `SENSOR_URL` | _(empty)_ | KSB Guard REST endpoint |
| `SENSOR_MOCK` | `true` | Use simulator if `true` |
| `GAME_DURATION_MS` | `10000` | Challenge duration in ms |
| `PORT` | `3001` | Backend server port |

## Admin

- `DELETE /api/leaderboard` — clear all scores
- `DELETE /api/leaderboard/:id` — remove one entry
