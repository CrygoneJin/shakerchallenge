require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sensor = require('./sensor');
const game = require('./game');
const leaderboard = require('./leaderboard');

const app = express();
app.use(cors());
app.use(express.json());

// ── Pump discovery on startup ─────────────────────────────────────────────────
sensor.discoverPump().catch((err) => {
  console.warn('[sensor] pump discovery failed:', err.message);
  console.warn('[sensor] will retry on first request');
});

// ── API routes ────────────────────────────────────────────────────────────────

// GET /api/pump — current pump info + latest reading
app.get('/api/pump', async (req, res) => {
  try {
    const pump = await sensor.getPump();
    const reading = await sensor.getLatestReading();
    res.json({ pump, reading });
  } catch (err) {
    res.status(502).json({ error: 'Sensor unavailable', detail: err.message });
  }
});

// POST /api/game/start  { name }
app.post('/api/game/start', async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const state = await game.start(name);
    res.json(state);
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
});

// GET /api/game/status
app.get('/api/game/status', (req, res) => {
  res.json(game.getState());
});

// POST /api/game/finish — record score + save to leaderboard
app.post('/api/game/finish', (req, res) => {
  const state = game.getState();
  if (!state || state.status === 'idle') {
    return res.status(404).json({ error: 'No active session' });
  }

  let entry = null;
  if (state.score != null) {
    entry = leaderboard.addEntry(state.name, state.score);
  }
  game.reset();
  res.json({ ...state, leaderboardEntry: entry });
});

// POST /api/game/abort — discard session without saving
app.post('/api/game/abort', (req, res) => {
  const state = game.abort();
  res.json(state || { status: 'idle' });
});

// POST /api/game/reset
app.post('/api/game/reset', (req, res) => {
  game.reset();
  res.json({ status: 'idle' });
});

// GET /api/leaderboard
app.get('/api/leaderboard', (req, res) => {
  res.json({ entries: leaderboard.getAll() });
});

// DELETE /api/leaderboard/:id
app.delete('/api/leaderboard/:id', (req, res) => {
  res.json({ removed: leaderboard.removeEntry(req.params.id) });
});

// DELETE /api/leaderboard — clear all
app.delete('/api/leaderboard', (req, res) => {
  leaderboard.clear();
  res.json({ cleared: true });
});

// ── Static frontend ───────────────────────────────────────────────────────────
const staticDir = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(staticDir));
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Shaker Challenge backend on http://localhost:${PORT}`);
  console.log(`Sensor mode: ${sensor.isMock() ? 'SIMULATION' : `LIVE (${process.env.KSB_API_KEY ? 'key set' : 'NO KEY!'})`}`);
});
