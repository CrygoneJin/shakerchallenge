import React, { useMemo } from 'react';

/**
 * SVG arc gauge showing vibration level (0–100 mm/s).
 */
export default function VibrationGauge({ vibration = 0, peak = 0, active = false }) {
  const MAX = 100;
  const SIZE = 280;
  const STROKE = 18;
  const R = (SIZE - STROKE * 2) / 2;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const START_ANGLE = -210; // degrees from 3-o'clock
  const SWEEP = 240;

  function polarToCartesian(angle) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: CX + R * Math.cos(rad),
      y: CY + R * Math.sin(rad),
    };
  }

  function arcPath(startAngle, endAngle) {
    const s = polarToCartesian(startAngle);
    const e = polarToCartesian(endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${R} ${R} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const pct = Math.min(vibration / MAX, 1);
  const peakPct = Math.min(peak / MAX, 1);

  const bgStart = START_ANGLE;
  const bgEnd = START_ANGLE + SWEEP;
  const fillEnd = START_ANGLE + SWEEP * pct;
  const peakAngle = START_ANGLE + SWEEP * peakPct;

  // Color zones: green → yellow → orange → red
  const gaugeColor = useMemo(() => {
    if (pct < 0.3) return '#22c55e';
    if (pct < 0.6) return '#eab308';
    if (pct < 0.8) return '#f97316';
    return '#ef4444';
  }, [pct]);

  const peakMarker = polarToCartesian(peakAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE} className={active && vibration > 5 ? 'shake-anim' : ''}>
        {/* Background arc */}
        <path
          d={arcPath(bgStart, bgEnd)}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        {/* Fill arc */}
        {pct > 0.01 && (
          <path
            d={arcPath(bgStart, fillEnd)}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${gaugeColor})` }}
          />
        )}
        {/* Peak marker */}
        {peakPct > 0.01 && (
          <circle
            cx={peakMarker.x}
            cy={peakMarker.y}
            r={STROKE / 2 + 2}
            fill="white"
            opacity={0.9}
          />
        )}
        {/* Center value */}
        <text
          x={CX}
          y={CY - 10}
          textAnchor="middle"
          fill="white"
          fontSize="44"
          fontWeight="900"
          fontFamily="Inter, sans-serif"
        >
          {Math.round(vibration)}
        </text>
        <text
          x={CX}
          y={CY + 24}
          textAnchor="middle"
          fill="rgba(255,255,255,0.6)"
          fontSize="16"
          fontFamily="Inter, sans-serif"
        >
          mm/s
        </text>
        {/* Labels */}
        <text x={CX - R - 4} y={CY + 40} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="12">0</text>
        <text x={CX + R + 4} y={CY + 40} textAnchor="start" fill="rgba(255,255,255,0.4)" fontSize="12">100</text>
      </svg>
      {/* Peak indicator */}
      <div className="mt-1 text-sm text-white/60">
        Peak: <span className="font-bold text-white">{Math.round(peak)} mm/s</span>
      </div>
    </div>
  );
}
