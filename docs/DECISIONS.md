# Decisions: KSB Shaker Challenge

ADR format: Context → Decision → Rationale → Consequences

---

## ADR-1: Monorepo — single backend + single frontend

**Context**
Trade fair booth needs a single deployment; no service mesh, no DevOps team on-site.

**Decision**
Single `package.json` at root; `backend/` and `frontend/` as peer directories; backend serves the compiled frontend as static files.

**Rationale**
- `npm start` brings up the entire app on one port (3001) — one command, one process
- No CORS complexity in production (same-origin static serving)
- One `.env` file; one thing to configure before the event

**Consequences**
- Tight coupling: frontend build must precede backend start in production
- Single Node process — fine for a booth (100s of sessions max), not for cloud scale
- Development requires two terminals (`dev:backend` + `dev:frontend`)

---

## ADR-2: Polling, not WebSocket, for game state

**Context**
Backend tracks session state; frontend needs near-real-time updates (countdown, score, leaderboard).

**Decision**
`useGameState` hook polls `/api/game/status` every 1 s (active session) or 3 s (idle).

**Rationale**
- Simpler backend: no WebSocket handlers, no connection-state management
- Stateless HTTP — easier to reason about, fewer failure modes at a trade fair
- Max latency to detect a new measurement: `POLL_INTERVAL_MS` (5 s default) + 1 s frontend poll = 6 s worst case, acceptable

**Consequences**
- ~3 requests/second per active session (well within single-server capacity)
- Leaderboard updates have ≤ 3 s lag
- No multi-device real-time sync (not a requirement)

---

## ADR-3: In-memory leaderboard with JSON file persistence

**Context**
Scores must survive backend restarts (booth laptop may be rebooted overnight); no database infrastructure available on-site.

**Decision**
In-memory array written to `leaderboard.json` on every new entry. Max 100 entries kept. File is gitignored (generated at runtime).

**Rationale**
- Zero setup: no database, no migrations
- Sub-millisecond reads; synchronous writes (file is small)
- Human-readable — operator can inspect or edit the file directly

**Consequences**
- Not safe for horizontal scaling (single file, single process assumed)
- No write locking — concurrent writes from multiple backend instances would corrupt the file (single-booth assumption makes this acceptable)
- Leaderboard reset requires `DELETE /api/leaderboard` via curl/Postman; no admin UI

---

## ADR-4: `SENSOR_MOCK=true` as default

**Context**
KSB Guard hardware unavailable during development; real API credentials require a formal access request.

**Decision**
If `KSB_API_KEY` is absent or `SENSOR_MOCK=true`, the built-in simulator is used. Default is mock mode.

**Rationale**
- `npm start` just works without credentials — zero barrier for new contributors
- Simulator fires a synthetic measurement ~12 s after session start, making the full game loop testable offline
- Switching to live: set `KSB_API_KEY` and `SENSOR_MOCK=false`

**Consequences**
- **Risk**: booth operator forgets to disable mock mode before the event — scores will not reflect real sensor readings. Mitigation: add a visible banner in the UI when `mock: true` is detected.
- Simulator behaviour differs from real sensor (synthetic vibration distribution, no temperature data correlation)
- CI/CD cannot validate against real API without test credentials

---

## ADR-5: Measurement-triggered scoring (not countdown timer)

**Context**
The KSB Guard sensor takes one measurement per `wakeUpTime` interval (configurable in minutes, not seconds). The game must align with this cadence; there is no way to trigger an on-demand measurement via the API.

**Decision**
Backend records a baseline `timestamp` when the session starts. It polls `/measurements/last` every `POLL_INTERVAL_MS`. Score is recorded when a new timestamp is detected.

**Rationale**
- Aligns with real sensor behaviour — the player's shake is captured in an actual measurement
- Shows visitors how condition monitoring really works (periodic snapshots, not continuous stream)
- Countdown timer (`nextMeasurementAt = lastTimestamp + wakeUpTimeMs`) gives the player a concrete target

**Consequences**
- If sensor is late or unreachable, session times out after `WAIT_TIMEOUT_MS` (default 3 min)
- 0–5 s score latency (polling interval) after measurement arrives
- `nextMeasurementAt` estimate drifts if sensor is consistently early or late
- Game experience degrades if `wakeUpTime` > 2 min — recommend configuring to 1 min for events

---

## ADR-6: No user authentication or persistent profiles

**Context**
Trade fair game; ephemeral, anonymous interaction.

**Decision**
Player name is entered once per session. No login, no cookies, no persistent accounts.

**Rationale**
- Friction-free: zero barrier to play
- Privacy: only first name / alias stored; no PII
- No user management overhead

**Consequences**
- Leaderboard shows all entries globally (no per-player filtering)
- Name collisions ("Max" appears three times) are visually indistinguishable
- No replay history per player
- No anti-cheat: same person can play multiple times under different names

---

## ADR-7: REST-only API (no GraphQL, no SDK)

**Context**
Simple, single-client backend; no complex query patterns anticipated.

**Decision**
Express.js with flat RESTful endpoints.

**Rationale**
- Minimal cognitive overhead; every route is debuggable with `curl`
- No code generation or schema maintenance
- Sufficient for the use case

**Consequences**
- `/api/game/status` returns the full session object even when only `status` is needed (minor over-fetching)
- If a mobile companion app is added later, the same REST API works without modification

---

## ADR-8: SVG components for countdown ring and vibration gauge

**Context**
Need smooth animated timer and optional vibration gauge.

**Decision**
SVG with `stroke-dasharray` / `stroke-dashoffset` for progress; CSS keyframe animations for pulse, shake, score-pop.

**Rationale**
- No canvas context, no JS animation loop — simpler
- Vectors scale to any booth monitor resolution
- SVG text is selectable and screen-reader accessible

**Consequences**
- `CountdownRing` and `VibrationGauge` were built but are not currently used in the main flow — candidates for consolidation or removal
- CSS transition on `stroke-dashoffset` provides 60 fps smoothness at browser refresh rate (no custom game loop needed)

---

## Known Technical Debt

| # | Issue | Severity | Mitigation |
|---|-------|----------|------------|
| 1 | No admin UI for leaderboard reset | Low | Add password-protected `/admin` route |
| 2 | No visible indicator when running in simulation mode | Medium | Add "SIMULATION MODE" banner to UI |
| 3 | No React error boundary | Medium | Wrap `App` in `<ErrorBoundary>` |
| 4 | `CountdownRing` and `VibrationGauge` unused | Low | Remove or integrate into result screen |
| 5 | No input validation on API routes (beyond name presence check) | Low | Add express-validator or similar |
| 6 | No auth on `DELETE /api/leaderboard` | Low | Acceptable for LAN-only; add token if exposed |
| 7 | `nextMeasurementAt` estimate can go negative if sensor is late | Low | Clamp to 0 in UI; show "any moment now" |

---

## Open Questions

1. **Sensor wakeUpTime at the event**: What interval will KSB configure? 1 min is ideal; 2 min is acceptable; > 5 min degrades the game experience significantly.

2. **Leaderboard persistence across events**: Should scores reset between event days, or carry over across the full trade fair? Currently manual (`DELETE /api/leaderboard`).

3. **Multi-language support**: Event in Germany — should UI be in German? Currently English-only.

4. **Screen size**: Fixed booth monitor or tablet? `max-w-lg` works for both, but font sizes may need tuning for very large displays.

5. **Rate limit at scale**: 1,600 API calls/sensor/month. At 5 s polling and 10 active sessions/hour over an 8-hour day, that is `(3600 / 5) × 10 × 8 = 57,600 calls` — well over limit. **Action required**: reduce `POLL_INTERVAL_MS` to 10–30 s, or contact KSB for a higher limit before the event.
