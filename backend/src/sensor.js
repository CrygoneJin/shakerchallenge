/**
 * KSB Guard sensor adapter.
 *
 * Required environment variables:
 *   KSB_API_KEY   — your KSB Guard API key
 *   KSB_PUMP_ID   — (optional) target pump ID; auto-detected if omitted
 *
 * Set SENSOR_MOCK=true to use the built-in simulator instead of the real API.
 *
 * Real API base: https://c2c.ksbguard.net/v1
 *   GET /pumps
 *   GET /pumps/{pumpId}/measurements/last
 *
 * Measurement response fields used:
 *   rmsX, rmsY, rmsZ  (mm/s)  → combined as √(x²+y²+z²)
 *   timestamp          (UTC)
 *   pumpOn
 *   loadStatus
 *   sensorSerialNumber
 */

const fetch = require('node-fetch');

const BASE_URL = 'https://c2c.ksbguard.net/v1';
const API_KEY = process.env.KSB_API_KEY || '';
const FORCED_PUMP_ID = process.env.KSB_PUMP_ID || '';
const MOCK = process.env.SENSOR_MOCK === 'true' || !API_KEY;

// ── Pump info cache ───────────────────────────────────────────────────────────
let _pump = null; // { pumpId, pumpName, wakeUpTime (ms), sensorSerialNumber }

async function discoverPump() {
  if (MOCK) {
    _pump = {
      pumpId: 'MOCK-001',
      pumpName: 'Demo Pump (simulation)',
      sensorSerialNumber: 'SIM-0001',
      wakeUpTimeMin: 1,
      wakeUpTimeMs: 60_000,
    };
    return _pump;
  }

  const res = await apiFetch('/pumps');
  const pumps = res.data || [];
  if (!pumps.length) throw new Error('No pumps found for this API key');

  let raw;
  if (FORCED_PUMP_ID) {
    raw = pumps.find((p) => p.pumpId === FORCED_PUMP_ID);
    if (!raw) throw new Error(`Pump ${FORCED_PUMP_ID} not found`);
  } else {
    // Pick first pump that has an assigned sensor
    raw = pumps.find((p) => p.sensors?.some((s) => s.sensorSerialNumber !== 'UNASSIGNED'))
      || pumps[0];
  }

  const sensor = raw.sensors?.find((s) => s.sensorSerialNumber !== 'UNASSIGNED');
  const wakeUpTimeMin = raw.wakeUpTime ?? 60;
  _pump = {
    pumpId: raw.pumpId,
    pumpName: raw.pumpName,
    locationName: raw.locationName,
    sensorSerialNumber: sensor?.sensorSerialNumber ?? 'UNASSIGNED',
    deviceType: sensor?.deviceType,
    wakeUpTimeMin,
    wakeUpTimeMs: wakeUpTimeMin * 60_000,
  };
  console.log(`[sensor] using pump "${_pump.pumpName}" (${_pump.pumpId}), wakeUpTime=${wakeUpTimeMin} min`);
  return _pump;
}

async function getPump() {
  if (!_pump) await discoverPump();
  return _pump;
}

// ── Measurement ───────────────────────────────────────────────────────────────
let _lastReading = null;

async function getLatestReading() {
  if (MOCK) return mockReading();

  const pump = await getPump();
  const res = await apiFetch(`/pumps/${pump.pumpId}/measurements/last`);
  const m = (res.data || [])[0];
  if (!m) throw new Error('No measurement data yet');

  const vibration = Math.sqrt(
    (m.rmsX || 0) ** 2 +
    (m.rmsY || 0) ** 2 +
    (m.rmsZ || 0) ** 2
  );

  const reading = {
    vibration: Math.round(vibration * 100) / 100,
    rmsX: m.rmsX,
    rmsY: m.rmsY,
    rmsZ: m.rmsZ,
    unit: 'mm/s',
    temperature: m.sensorTemperature,
    pumpOn: m.pumpOn,
    loadStatus: m.loadStatus,
    timestamp: m.timestamp,
    sensorSerialNumber: m.sensorSerialNumber,
    mock: false,
  };

  _lastReading = reading;
  return reading;
}

// ── Simulation ────────────────────────────────────────────────────────────────
let _simActive = false;
let _simPeak = 0;
let _simTimestamp = new Date(Date.now() - 70_000).toISOString(); // "old" reading
let _simNextAt = Date.now() + 60_000; // first simulated measurement in 60 s

function setSimulationActive(active) {
  _simActive = active;
  if (!active) _simPeak = 0;
}

function triggerSimMeasurement() {
  // Called by game.js to inject a simulated measurement at session end
  const vibration = _simActive ? Math.max(0.5, _simPeak) : 0.1 + Math.random() * 0.3;
  const angle1 = Math.random() * Math.PI;
  const angle2 = Math.random() * Math.PI * 2;
  _simTimestamp = new Date().toISOString();
  _simNextAt = Date.now() + 60_000;
  _lastReading = {
    vibration: Math.round(vibration * 100) / 100,
    rmsX: Math.round(vibration * Math.sin(angle1) * Math.cos(angle2) * 100) / 100,
    rmsY: Math.round(vibration * Math.sin(angle1) * Math.sin(angle2) * 100) / 100,
    rmsZ: Math.round(vibration * Math.cos(angle1) * 100) / 100,
    unit: 'mm/s',
    temperature: 22 + Math.random() * 8,
    pumpOn: true,
    loadStatus: 'NORMAL_LOAD',
    timestamp: _simTimestamp,
    mock: true,
  };
  return _lastReading;
}

function mockReading() {
  // Update peak during active shake
  if (_simActive) {
    const v = 0.1 + Math.random() * 95;
    if (v > _simPeak) _simPeak = v;
  }

  // Return latest cached reading (only changes when triggerSimMeasurement is called)
  return _lastReading || {
    vibration: 0.1,
    unit: 'mm/s',
    timestamp: _simTimestamp,
    pumpOn: false,
    loadStatus: 'OFF',
    mock: true,
  };
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-api-key': API_KEY, accept: 'application/json' },
    timeout: 5000,
  });
  if (res.status === 429) throw new Error('KSB Guard rate limit exceeded (429)');
  if (!res.ok) throw new Error(`KSB Guard API error: ${res.status} ${res.statusText}`);
  return res.json();
}

module.exports = {
  getLatestReading,
  getPump,
  discoverPump,
  setSimulationActive,
  triggerSimMeasurement,
  isMock: () => MOCK,
};
