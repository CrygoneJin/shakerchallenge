/**
 * Game session manager.
 * Only one active session at a time (single sensor / single player).
 */

const { setSimulationActive } = require('./sensor');

const DURATION_MS = process.env.GAME_DURATION_MS
  ? parseInt(process.env.GAME_DURATION_MS)
  : 10000; // 10 seconds default

let session = null;

function getState() {
  if (!session) return { status: 'idle' };

  const elapsed = Date.now() - session.startedAt;
  const remaining = Math.max(0, DURATION_MS - elapsed);

  return {
    status: remaining > 0 ? 'active' : 'finished',
    name: session.name,
    startedAt: session.startedAt,
    duration: DURATION_MS,
    remaining,
    elapsed: Math.min(elapsed, DURATION_MS),
    currentVibration: session.currentVibration,
    peakVibration: session.peakVibration,
    score: calcScore(session.peakVibration),
    readings: session.readings,
  };
}

function calcScore(peakVibration) {
  // Scale to a 0-10000 points range
  // KSB Guard typically measures 0-100 mm/s
  return Math.round(Math.min(peakVibration, 100) * 100);
}

function start(name) {
  if (session && Date.now() - session.startedAt < DURATION_MS) {
    throw new Error('A game is already in progress');
  }
  setSimulationActive(true);
  session = {
    name,
    startedAt: Date.now(),
    currentVibration: 0,
    peakVibration: 0,
    readings: [],
  };
  return getState();
}

function recordReading(vibration) {
  if (!session) return;
  const elapsed = Date.now() - session.startedAt;
  if (elapsed > DURATION_MS) {
    setSimulationActive(false);
    return;
  }
  session.currentVibration = vibration;
  if (vibration > session.peakVibration) {
    session.peakVibration = vibration;
  }
  session.readings.push({ t: elapsed, v: vibration });
  // Keep readings sparse to limit memory
  if (session.readings.length > 200) {
    session.readings = session.readings.filter((_, i) => i % 2 === 0);
  }
}

function finish() {
  if (!session) return null;
  setSimulationActive(false);
  const state = getState();
  return state;
}

function reset() {
  setSimulationActive(false);
  session = null;
}

module.exports = { start, finish, recordReading, getState, reset, calcScore, DURATION_MS };
