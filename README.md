# KSB Shaker Challenge

A trade fair ice-breaker game that lets visitors shake a **KSB Guard** vibration sensor, see their score on a live dashboard, and naturally enter a conversation about condition monitoring.

## How it works

1. Visitor enters their name and presses **Start Challenge**
2. A countdown shows exactly when the KSB Guard sensor will take its next measurement
3. When the timer hits zero — they shake the sensor as hard as they can
4. Score appears as soon as the measurement is received
5. Leaderboard updates live; a short pitch about KSB Guard is shown

**Score** = vibration magnitude (√(rmsX²+rmsY²+rmsZ²)) × 100, max 10 000 pts

## Architecture

```
shakerchallenge/
├── backend/          Node.js + Express API
│   └── src/
│       ├── server.js      REST endpoints + static serving
│       ├── sensor.js      KSB Guard REST adapter (c2c.ksbguard.net/v1)
│       ├── game.js        Measurement-triggered session manager
│       └── leaderboard.js In-memory + JSON persistence
└── frontend/         React + Vite + Tailwind CSS
    └── src/
        ├── App.jsx                  Screen router (Idle / Waiting / Result)
        ├── hooks/useGameState.js
        └── components/
            ├── MeasurementCountdown.jsx  Countdown to next sensor measurement
            └── Leaderboard.jsx
```

## Setup

```bash
# Install dependencies
npm run install:all

# Configure
cd backend && cp .env.example .env
# Edit .env — set KSB_API_KEY or leave SENSOR_MOCK=true for simulation

# Start backend
npm run dev --prefix backend

# Start frontend dev server (separate terminal)
npm run dev --prefix frontend
# → http://localhost:5173
```

## Production

```bash
npm run build                    # builds frontend into frontend/dist/
cd backend && npm start          # serves API + frontend on http://localhost:3001
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `KSB_API_KEY` | _(empty)_ | KSB Guard API key |
| `KSB_PUMP_ID` | _(auto)_ | Force a specific pump ID |
| `SENSOR_MOCK` | `true` | Use simulator when `true` |
| `POLL_INTERVAL_MS` | `5000` | How often to check for new measurement |
| `WAIT_TIMEOUT_MS` | `180000` | Session timeout (3 min default) |
| `PORT` | `3001` | Backend port |

## KSB Guard API

Base: `https://c2c.ksbguard.net/v1` — Auth: `x-api-key` header

| Endpoint | Used for |
|---|---|
| `GET /pumps` | Discover pump ID + `wakeUpTime` on startup |
| `GET /pumps/{pumpId}/measurements/last` | Poll for new measurement (polled every `POLL_INTERVAL_MS`) |

A new measurement is detected by comparing the `timestamp` field to the baseline recorded at game start.

## Trade fair tip

For best game experience, ask KSB to configure the sensor's `wakeUpTime` to **1–2 minutes** before the event. The game's countdown timer adapts automatically to whatever interval the sensor reports.

## Admin

- `DELETE /api/leaderboard` — clear all scores
- `DELETE /api/leaderboard/:id` — remove one entry
