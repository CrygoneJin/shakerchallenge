/**
 * In-memory leaderboard with optional JSON file persistence.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'leaderboard.json');
const MAX_ENTRIES = 100;

let entries = [];

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      entries = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch {
    entries = [];
  }
}

function save() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
  } catch {
    // non-fatal
  }
}

function addEntry(name, score) {
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name: name.trim().slice(0, 40),
    score: Math.round(score),
    date: new Date().toISOString(),
  };
  entries.push(entry);
  entries.sort((a, b) => b.score - a.score);
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
  save();
  return entry;
}

function getAll() {
  return entries;
}

function removeEntry(id) {
  const before = entries.length;
  entries = entries.filter((e) => e.id !== id);
  if (entries.length !== before) save();
  return entries.length !== before;
}

function clear() {
  entries = [];
  save();
}

load();

module.exports = { addEntry, getAll, removeEntry, clear };
