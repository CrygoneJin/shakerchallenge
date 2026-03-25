const express = require('express');
const cors = require('cors');
const path = require('path');
const sensor = require('./sensor');
const game = require('./game');
const leaderboard = require('./leaderboard');

const app = express();
app.use(cors());
app.use(express.json());

// ── Sensor polling ────────────────────────────────────────────────────────────
// Poll the sensor at ~5 Hz and feed readings into the active game session.
setInterval(async () => {
  try {
    const { vibration } = await sensor.getLatestReading();
    game.recordReading(vibration);
  } catch {
    // sensor unavailable — ignore
  }
}, 200);

// ── API routes ────────────────────────────────────────────────────────────────

// GET /api/sensor — latest raw sensor reading
app.get('/api/sensor', async (req, res) => {
  try {
    const reading = await sensor.getLatestReading();
    res.json(reading);
  } catch (err) {
    res.status(502).json({ error: 'Sensor unavailable', detail: err.message });
  }
});

// POST /api/game/start  { name }
app.post('/api/game/start', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const state = game.start(name);
    res.json(state);
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
});

// GET /api/game/status
app.get('/api/game/status', (req, res) => {
  res.json(game.getState());
});

// POST /api/game/finish  — end current session early or confirm finished
app.post('/api/game/finish', (req, res) => {
  const state = game.finish();
  if (!state) return res.status(404).json({ error: 'No active session' });

  // Auto-save to leaderboard if a name was entered
  const entry = leaderboard.addEntry(state.name, state.score);
  game.reset();
  res.json({ ...state, leaderboardEntry: entry });
});

// POST /api/game/reset
app.post('/api/game/reset', (req, res) => {
  game.reset();
  res.json({ status: 'idle' });
});

// GET /api/leaderboard
app.get('/api/leaderboard', (req, res) => {
  const entries = leaderboard.getAll();
  res.json({ entries });
});

// DELETE /api/leaderboard/:id  (admin)
app.delete('/api/leaderboard/:id', (req, res) => {
  const removed = leaderboard.removeEntry(req.params.id);
  res.json({ removed });
});

// DELETE /api/leaderboard  (admin clear all)
app.delete('/api/leaderboard', (req, res) => {
  leaderboard.clear();
  res.json({ cleared: true });
});

// ── Static frontend ───────────────────────────────────────────────────────────
const staticDir = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(staticDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Shaker Challenge backend listening on http://localhost:${PORT}`);
  console.log(`Sensor mode: ${sensor.isMock() ? 'SIMULATION' : process.env.SENSOR_URL}`);
});
