import React from 'react';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ entries = [], highlightId = null }) {
  if (entries.length === 0) {
    return (
      <div className="text-center text-white/40 py-8 text-sm">
        No scores yet — be the first!
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      {entries.slice(0, 10).map((entry, i) => {
        const isHighlight = entry.id === highlightId;
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
              isHighlight
                ? 'bg-ksb-orange/30 ring-2 ring-ksb-orange'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <span className="w-8 text-center text-lg font-bold">
              {i < 3 ? MEDALS[i] : <span className="text-white/40 text-sm">#{i + 1}</span>}
            </span>
            <span className="flex-1 font-semibold truncate">{entry.name}</span>
            <span className="font-black text-xl tabular-nums text-ksb-lightorange">
              {entry.score.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
