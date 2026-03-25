/**
 * KSB Guard sensor adapter.
 *
 * Set SENSOR_URL to the base URL of the KSB Guard REST API, e.g.:
 *   http://ksb-guard.local/api/measurements/latest
 *
 * Set SENSOR_MOCK=true to use the built-in simulator instead.
 *
 * Expected API response shape (adapt to actual KSB Guard schema):
 *   { "vibration": 4.52, "unit": "mm/s", "timestamp": "..." }
 *
 * Returns: { vibration: number }  — vibration velocity in mm/s
 */

const fetch = require('node-fetch');

const SENSOR_URL = process.env.SENSOR_URL || '';
const MOCK = process.env.SENSOR_MOCK === 'true' || !SENSOR_URL;

// Simulation state
let _simBase = 0.1;
let _simActive = false;

function setSimulationActive(active) {
  _simActive = active;
  if (!active) _simBase = 0.1;
}

function simulatedReading() {
  if (_simActive) {
    // Simulate random shaking between 1–80 mm/s with bursts
    _simBase = Math.min(80, _simBase * 1.1 + Math.random() * 15);
    const jitter = (Math.random() - 0.3) * 10;
    return Math.max(0.1, _simBase + jitter);
  }
  // Idle noise
  return 0.05 + Math.random() * 0.2;
}

async function getLatestReading() {
  if (MOCK) {
    return { vibration: simulatedReading(), unit: 'mm/s', mock: true };
  }

  const res = await fetch(SENSOR_URL, { timeout: 1000 });
  if (!res.ok) throw new Error(`Sensor HTTP ${res.status}`);
  const data = await res.json();

  // Adapt field names to internal format.
  // Adjust these mappings to match actual KSB Guard response schema.
  const vibration =
    data.vibration ??
    data.velocity ??
    data.rms ??
    data.value ??
    data.data?.vibration ??
    0;

  return { vibration: Number(vibration), unit: data.unit ?? 'mm/s', mock: false };
}

module.exports = { getLatestReading, setSimulationActive, isMock: () => MOCK };
