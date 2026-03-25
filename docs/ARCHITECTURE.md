# Architecture: KSB Shaker Challenge

## Full Stack & Versions

### Backend
| Package | Version |
|---------|---------|
| Node.js | 14+ (not pinned) |
| express | 4.18.2 |
| cors | 2.8.5 |
| node-fetch | 2.7.0 |
| nodemon (dev) | 3.0.3 |

### Frontend
| Package | Version |
|---------|---------|
| react | 18.2.0 |
| react-dom | 18.2.0 |
| vite | 5.1.4 |
| @vitejs/plugin-react | 4.2.1 |
| tailwindcss | 3.4.1 |
| postcss | 8.4.35 |
| autoprefixer | 10.4.17 |

---

## Folder Structure

```
shakerchallenge/
├── package.json                      # Root: install:all, dev:*, build, start scripts
├── README.md
├── .gitignore                        # Ignores node_modules, .env, leaderboard.json, dist/
│
├── docs/                             # Project brief documents
│   ├── PROJECT.md
│   ├── USERS.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   └── DECISIONS.md
│
├── backend/
│   ├── package.json
│   ├── .env.example                  # All env vars documented here
│   ├── leaderboard.json              # [runtime, gitignored] Persisted scores
│   └── src/
│       ├── server.js                 # Express app: routes, static serving, boot
│       ├── sensor.js                 # KSB Guard REST adapter + simulator
│       ├── game.js                   # Session manager + measurement polling
│       └── leaderboard.js            # In-memory store + JSON persistence
│
└── frontend/
    ├── package.json
    ├── index.html                    # Entry HTML; loads Inter font from Google Fonts
    ├── vite.config.js                # Proxy: /api → http://localhost:3001
    ├── tailwind.config.js            # KSB brand colours + Inter font
    ├── postcss.config.js
    └── src/
        ├── main.jsx                  # React DOM mount
        ├── index.css                 # Tailwind directives + custom animations
        ├── App.jsx                   # Screen router (Idle / Waiting / Result)
        ├── hooks/
        │   └── useGameState.js       # Polling hook: game state, leaderboard, pump info
        └── components/
            ├── MeasurementCountdown.jsx  # SVG countdown ring to next measurement
            ├── Leaderboard.jsx           # Top 10 scores with medal badges
            ├── VibrationGauge.jsx        # SVG arc gauge — built, not used in main flow
            └── CountdownRing.jsx         # Alternative ring — built, not used in main flow
```

---

## Key Data Models

### Session (`game.js`)
```javascript
{
  name: string,              // Player name, max 40 chars
  startedAt: number,         // Epoch ms
  baselineTimestamp: string, // ISO UTC — first reading's timestamp; new timestamp = new measurement
  status: 'waiting' | 'scored' | 'timeout' | 'aborted',
  pumpName: string,
  wakeUpTimeMs: number,      // Sensor interval in ms
  nextMeasurementAt: number, // Calculated: lastTimestamp + wakeUpTimeMs
  vibration: number | null,  // √(rmsX²+rmsY²+rmsZ²) in mm/s
  score: number | null,      // vibration × 100, max 10,000
  latestReading: object | null,
}
```

### Measurement (`sensor.js`)
```javascript
{
  vibration: number,          // Combined magnitude, rounded to 2dp
  rmsX: number,               // mm/s
  rmsY: number,               // mm/s
  rmsZ: number,               // mm/s
  unit: 'mm/s',
  temperature: number,        // °C
  pumpOn: boolean,
  loadStatus: string,         // 'NORMAL_LOAD' | 'PARTIAL_LOAD' | 'OFF' | etc.
  timestamp: string,          // ISO 8601 UTC
  sensorSerialNumber: string,
  mock: boolean,
}
```

### Leaderboard Entry (`leaderboard.js`)
```javascript
{
  id: string,     // Date.now().toString(36) + random — collision-resistant
  name: string,   // Max 40 chars
  score: number,  // Integer
  date: string,   // ISO 8601 UTC
}
```

### Pump Info (`sensor.js`)
```javascript
{
  pumpId: string,
  pumpName: string,
  locationName: string,
  sensorSerialNumber: string,
  deviceType: string,         // 'KSB_GUARD_SENSOR' | 'KSB_GUARD_ATEX_SENSOR' | etc.
  wakeUpTimeMin: number,
  wakeUpTimeMs: number,
}
```

---

## External Services & Integrations

### KSB Guard REST API
- **Base URL**: `https://c2c.ksbguard.net/v1`
- **Auth**: `x-api-key: <KSB_API_KEY>` header (backend only — never exposed to frontend)
- **Timeout**: 5 seconds per request
- **Error codes handled**: 429 (rate limit), non-2xx generic

| Endpoint | When called | Purpose |
|----------|-------------|---------|
| `GET /pumps` | On backend startup | Discover `pumpId`, `pumpName`, `wakeUpTime` |
| `GET /pumps/{pumpId}/measurements/last` | Every `POLL_INTERVAL_MS` during active session | Detect new measurement by timestamp change |

**Rate limit**: 1,600 calls/sensor/month (standard). At 5s polling for a 10-session/hour booth = ~5 calls/session = ~50 calls/day — well within limits.

---

## Authentication Approach
- **KSB Guard API**: API key via `x-api-key` header; stored in `backend/.env` (gitignored)
- **Frontend ↔ Backend**: No auth; same-origin serving assumed in production (LAN only)
- **Players**: No authentication; fully anonymous (name entered per session, not stored as identity)
- **Admin endpoints**: No auth on `DELETE /api/leaderboard` — relies on LAN isolation

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/pump` | Pump info + latest sensor reading |
| POST | `/api/game/start` | Start session `{ name }` |
| GET | `/api/game/status` | Current session state |
| POST | `/api/game/finish` | Record score → leaderboard |
| POST | `/api/game/abort` | Cancel session, no score |
| POST | `/api/game/reset` | Force idle state |
| GET | `/api/leaderboard` | All scores |
| DELETE | `/api/leaderboard/:id` | Remove one entry |
| DELETE | `/api/leaderboard` | Clear all scores |

---

## Deployment Setup

### Development
```bash
npm run install:all        # installs backend/ and frontend/ node_modules
npm run dev:backend        # nodemon on :3001
npm run dev:frontend       # Vite on :5173; proxies /api → :3001
```

### Production
```bash
npm run build              # Vite build → frontend/dist/
cd backend && npm start    # Express on PORT (default 3001)
# Serves: /api/* routes + frontend/dist/ static files + SPA fallback
```

Backend resolves static dir as `../../frontend/dist/` relative to `src/server.js` — both must live in the same repo checkout.

---

## Environment Variables

| Variable | Default | Secret | Description |
|----------|---------|--------|-------------|
| `KSB_API_KEY` | _(empty)_ | **Yes** | KSB Guard API key. Request at ksbguard-support@ksb.com |
| `KSB_PUMP_ID` | _(empty)_ | No | Force a specific pump ID; auto-detects first assigned pump if omitted |
| `SENSOR_MOCK` | `true` | No | Use simulator if `true`; requires `KSB_API_KEY` when `false` |
| `POLL_INTERVAL_MS` | `5000` | No | How often to poll `/measurements/last` during a session (ms) |
| `WAIT_TIMEOUT_MS` | `180000` | No | Session timeout if no new measurement arrives (ms) |
| `PORT` | `3001` | No | Backend HTTP port |
