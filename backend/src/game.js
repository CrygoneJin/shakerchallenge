/**
 * Game session manager — measurement-triggered scoring.
 *
 * Flow:
 *  1. client POSTs /game/start  → session opens, baseline timestamp recorded
 *  2. server polls sensor every POLL_INTERVAL_MS
 *  3. when a new measurement arrives (timestamp changes) → score recorded
 *  4. session auto-closes after WAIT_TIMEOUT_MS if no new measurement
 *  5. client can also POST /game/finish early (operator abort)
 *
 * The sensor's wakeUpTime drives the real cadence.
 * In simulation mode, triggerSimMeasurement() is called at the right moment.
 */

const sensor = require('./sensor');

const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS) || 5_000;  // 5 s
const WAIT_TIMEOUT_MS  = parseInt(process.env.WAIT_TIMEOUT_MS)  || 180_000; // 3 min

let session = null;
let _pollTimer = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcScore(vibration) {
  // 0–100 mm/s → 0–10000 pts
  return Math.round(Math.min(vibration, 100) * 100);
}

function stopPolling() {
  if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
}

async function pollMeasurement() {
  if (!session) { stopPolling(); return; }

  const elapsed = Date.now() - session.startedAt;
  if (elapsed > WAIT_TIMEOUT_MS) {
    // Timeout — close without a score
    session.status = 'timeout';
    stopPolling();
    sensor.setSimulationActive(false);
    return;
  }

  let reading;
  try {
    reading = await sensor.getLatestReading();
  } catch {
    return; // sensor temporarily unavailable, retry next poll
  }

  // New measurement arrived?
  if (reading.timestamp !== session.baselineTimestamp) {
    session.latestReading = reading;
    session.vibration = reading.vibration;
    session.score = calcScore(reading.vibration);
    session.status = 'scored';
    stopPolling();
    sensor.setSimulationActive(false);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

async function start(name) {
  if (session && (session.status === 'waiting' || session.status === 'ready')) {
    throw new Error('A challenge is already running');
  }

  // Get pump info (incl. wakeUpTime)
  const pump = await sensor.getPump();

  // Record baseline — we'll detect a NEW measurement by timestamp change
  let baseline;
  try {
    baseline = await sensor.getLatestReading();
  } catch {
    baseline = { timestamp: null };
  }

  // Estimate when the next measurement will arrive
  const lastTs = baseline.timestamp ? new Date(baseline.timestamp).getTime() : Date.now();
  const nextMeasurementAt = lastTs + pump.wakeUpTimeMs;

  sensor.setSimulationActive(true);

  session = {
    name: name.trim().slice(0, 40),
    startedAt: Date.now(),
    baselineTimestamp: baseline.timestamp,
    status: 'waiting',     // waiting | scored | timeout | aborted
    pumpName: pump.pumpName,
    wakeUpTimeMs: pump.wakeUpTimeMs,
    nextMeasurementAt,
    vibration: null,
    score: null,
    latestReading: null,
  };

  // In simulation mode: schedule a synthetic measurement mid-game
  if (sensor.isMock()) {
    const delay = Math.min(pump.wakeUpTimeMs, 12_000); // 12 s in sim
    setTimeout(() => {
      if (session && session.status === 'waiting') {
        const reading = sensor.triggerSimMeasurement();
        session.latestReading = reading;
        session.vibration = reading.vibration;
        session.score = calcScore(reading.vibration);
        session.status = 'scored';
        stopPolling();
        sensor.setSimulationActive(false);
      }
    }, delay);
    // Update nextMeasurementAt for sim
    session.nextMeasurementAt = Date.now() + delay;
  }

  stopPolling();
  _pollTimer = setInterval(pollMeasurement, POLL_INTERVAL_MS);

  return getState();
}

function getState() {
  if (!session) return { status: 'idle' };

  const now = Date.now();
  return {
    status: session.status,
    name: session.name,
    startedAt: session.startedAt,
    pumpName: session.pumpName,
    wakeUpTimeMs: session.wakeUpTimeMs,
    nextMeasurementAt: session.nextMeasurementAt,
    msUntilMeasurement: Math.max(0, session.nextMeasurementAt - now),
    waitedMs: now - session.startedAt,
    vibration: session.vibration,
    score: session.score,
    latestReading: session.latestReading,
  };
}

function abort() {
  if (!session) return null;
  stopPolling();
  sensor.setSimulationActive(false);
  session.status = 'aborted';
  const state = getState();
  session = null;
  return state;
}

function reset() {
  stopPolling();
  sensor.setSimulationActive(false);
  session = null;
}

module.exports = { start, getState, abort, reset, calcScore };
