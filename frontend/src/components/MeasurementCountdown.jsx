import React, { useState, useEffect } from 'react';

/**
 * Shows a live countdown to the next expected sensor measurement.
 * Props:
 *   nextMeasurementAt  — epoch ms when next measurement is expected
 *   wakeUpTimeMs       — sensor wake-up interval in ms (for the ring fill)
 */
export default function MeasurementCountdown({ nextMeasurementAt, wakeUpTimeMs }) {
  const [msLeft, setMsLeft] = useState(Math.max(0, nextMeasurementAt - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setMsLeft(Math.max(0, nextMeasurementAt - Date.now()));
    }, 250);
    return () => clearInterval(id);
  }, [nextMeasurementAt]);

  const seconds = Math.ceil(msLeft / 1000);
  const progress = wakeUpTimeMs > 0 ? Math.max(0, Math.min(1, msLeft / wakeUpTimeMs)) : 0;
  const isImminent = seconds <= 5;

  const SIZE = 140;
  const STROKE = 10;
  const R = (SIZE - STROKE * 2) / 2;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * progress;
  const color = isImminent ? '#ef4444' : seconds <= 15 ? '#f97316' : '#22c55e';

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs text-white/50 uppercase tracking-widest mb-1">
        Next measurement in
      </div>
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} />
        {/* Progress */}
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none"
          stroke={color} strokeWidth={STROKE} strokeLinecap="round"
          strokeDasharray={CIRC} strokeDashoffset={dashOffset}
          className="countdown-ring"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x={SIZE/2} y={SIZE/2}
          textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize={mins > 0 ? '26' : '34'}
          fontWeight="900" fontFamily="Inter, sans-serif"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${SIZE/2}px ${SIZE/2}px` }}
        >
          {label}
        </text>
      </svg>
      {isImminent && (
        <div className="text-ksb-cyan font-black text-sm animate-pulse uppercase tracking-wider">
          Shake now.
        </div>
      )}
    </div>
  );
}
