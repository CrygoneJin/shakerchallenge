# Project: KSB Shaker Challenge

## One-line Description
A trade fair ice-breaker game that lets visitors shake a KSB Guard vibration sensor, see their live score on a competitive leaderboard, and engage in conversation about industrial condition monitoring.

## Problem Being Solved
KSB sells condition monitoring solutions (KSB Guard) to industrial facilities, but at trade fairs it's difficult to:
1. Create a memorable, hands-on demo that stands out from static booths
2. Generate natural conversation-starters for sales staff
3. Show the practical reality of vibration monitoring in real-time

The Shaker Challenge solves this by turning sensor measurement into a gamified experience — visitors physically shake the sensor and immediately see their vibration score, creating curiosity and drawing them into conversations about how KSB Guard continuously monitors pump health in production.

## Core Features Currently Implemented
- **Name entry & challenge initiation**: Visitor enters name, presses "START CHALLENGE"
- **Measurement countdown**: Real-time countdown to the next sensor measurement, with visual ring progress and urgency cues (green → orange → red → "SHAKE NOW!")
- **Measurement-triggered scoring**: Backend polls the KSB Guard API (`c2c.ksbguard.net/v1`) every 5 seconds; when a new measurement arrives (new timestamp detected), the vibration magnitude is captured
- **Score calculation**: Score = vibration magnitude (√(rmsX² + rmsY² + rmsZ²)) × 100, capped at 10,000 points
- **Live leaderboard**: Top 10 scores with medal badges, persisted across restarts; rank shown on result screen
- **Result screen with product pitch**: After scoring, shows vibration details and a brief KSB Guard educational message
- **In-memory leaderboard with JSON persistence**: Scores survive backend restarts via `leaderboard.json`
- **Simulation mode (`SENSOR_MOCK=true`)**: Built-in sensor simulator for testing without hardware; generates realistic vibration data and fires a synthetic measurement ~12 seconds after session start
- **Session timeout**: Auto-closes after 3 minutes if no measurement arrives; player can also cancel manually

## Planned Features
None explicitly documented. The README suggests configuring `wakeUpTime` to 1–2 minutes before the event, but no future features are noted. Inferred candidates from open questions:

- Admin UI for leaderboard reset (currently REST-only)
- Kiosk/fullscreen mode
- Language localisation (currently English only)

## Business Constraints
1. **Hardware coupling**: Requires a physical KSB Guard sensor with an assigned pump ID and valid API credentials
2. **Measurement cadence**: Optimal experience requires sensor `wakeUpTime` configured to 1–2 minutes (KSB default is 60 minutes)
3. **Offline-first deployment**: No cloud database; leaderboard is local JSON on the booth machine
4. **Single-booth assumption**: Architecture designed for one sensor, one server, one screen

## Success Metrics
No analytics or tracking code found. Inferred metrics:

- **Leaderboard activity**: Number of sessions completed per day
- **Session completion rate**: % of sessions that produce a score vs. timeouts/cancellations
- **Timeout rate**: Should be < 5% in a well-configured booth setup
- **Conversation initiation**: Staff-observed; game draws visitors in and provides a talking point
