import React from 'react';

export default function CountdownRing({ remaining, duration }) {
  const SIZE = 120;
  const STROKE = 8;
  const R = (SIZE - STROKE * 2) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const progress = remaining / duration;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const seconds = Math.ceil(remaining / 1000);

  const color = seconds > 5 ? '#22c55e' : seconds > 3 ? '#eab308' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="countdown-ring"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text
          x={SIZE / 2}
          y={SIZE / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="32"
          fontWeight="900"
          fontFamily="Inter, sans-serif"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${SIZE / 2}px ${SIZE / 2}px` }}
        >
          {seconds}
        </text>
      </svg>
      <div className="text-xs text-white/50 mt-1">seconds left</div>
    </div>
  );
}
