# Users: KSB Shaker Challenge

## Primary User: Trade Fair Visitor

**Who**: Industrial facility engineers, maintenance managers, procurement decision-makers (B2B audience at KSB trade fair booths)
**Motivation**: Curiosity, competition, fun — does not initially know about KSB Guard
**Technical level**: Moderate (understands vibration terminology; unaware of REST APIs)
**Session length**: 30–120 seconds (name entry to score display)
**Language**: English only (no i18n detected)

### Key Needs
- Instant, zero-friction entry (no login, no account)
- Clear instructions at each stage
- Dramatic, satisfying score reveal
- Competitive context (leaderboard)

---

## Secondary Users

### Booth Operator / Event Manager
**Who**: KSB sales staff managing the booth
**Tasks**: Monitor engagement, explain sensor mechanics, reset leaderboard between event days
**Technical level**: Low — uses the web UI; accesses admin via `DELETE /api/leaderboard` REST call (no UI)
**Pain points**: No admin dashboard; leaderboard reset requires curl or Postman

### IT / Systems Administrator
**Who**: Infrastructure team deploying the app on-site
**Tasks**: Configure environment variables, set `KSB_API_KEY`, monitor backend uptime
**Technical level**: High — comfortable with Node.js, `.env` files, terminal
**Entry point**: `backend/.env.example` + README

---

## Key User Journeys

### Journey 1: Happy Path (New Measurement Arrives)
1. Visitor arrives at booth, sees idle screen with leaderboard and "SHAKER CHALLENGE" header
2. Enters name → presses **START CHALLENGE**
3. Backend opens session, records baseline measurement timestamp
4. Countdown ring shows time until next sensor measurement
5. Ring turns orange, then red → **"SHAKE NOW!"** prompt animates
6. Visitor shakes the sensor hard during the measurement window
7. Backend detects new measurement timestamp (polled every 5s)
8. Score calculated: e.g., `7,234 pts` (peak vibration: 72.34 mm/s)
9. Result screen shows score, rank, leaderboard highlight, and KSB Guard pitch
10. Visitor presses **Next Player** → returns to idle screen

### Journey 2: Timeout (No Measurement in 3 Minutes)
1. Visitor starts challenge
2. Sensor does not wake up within 3 minutes (misconfigured or network issue)
3. Backend sets session status = `timeout`
4. Frontend shows "Session ended — try again!" screen
5. Visitor presses **Next Player** to retry

### Journey 3: Cancel Mid-Game
1. Visitor starts challenge, sees countdown
2. Presses **Cancel**
3. Backend aborts session (`POST /api/game/abort`), no score recorded
4. Returns to idle screen

### Journey 4: Spectating / Watching Leaderboard
- Idle screen always shows top 10 scores
- Result screen updates leaderboard in real-time after each play
- No interaction needed — screen is self-refreshing

---

## Device & Environment Context

| Factor | Detail |
|--------|--------|
| **Screen** | Fixed booth display (large monitor or TV); `max-w-lg` container keeps content centered |
| **Input** | Touchscreen or mouse; no keyboard navigation |
| **Network** | Local LAN only; no internet required in production |
| **Sensor** | Physical KSB Guard device; 3-axis vibration (rmsX, rmsY, rmsZ in mm/s) |
| **Deployment** | Single laptop/server running backend on port 3001 |

---

## Language & Accessibility

### Current State
- **Language**: English only
- **Color contrast**: White on `#003F7F` (navy) — passes WCAG AA for large text
- **Touch targets**: Buttons use `py-3`/`py-4` — ≥ 44px height
- **Typography**: Inter, large sizes (`text-5xl`, `text-7xl`) for booth readability

### Known Gaps [add manually if prioritised]
- No ARIA labels or roles
- No `aria-live` regions for score updates
- No focus indicators for keyboard navigation
- No `prefers-reduced-motion` support (animations play unconditionally)
- No screen reader optimisation
- No language selector
