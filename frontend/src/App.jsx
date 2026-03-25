import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import VibrationGauge from './components/VibrationGauge';
import CountdownRing from './components/CountdownRing';
import Leaderboard from './components/Leaderboard';

// ── Idle / Name entry screen ──────────────────────────────────────────────────
function IdleScreen({ onStart, leaderboard }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name'); return; }
    setLoading(true);
    try {
      await onStart(name.trim());
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center">
        <div className="text-ksb-orange font-black text-5xl tracking-tight text-shadow">
          SHAKER
        </div>
        <div className="text-white font-black text-5xl tracking-tight text-shadow">
          CHALLENGE
        </div>
        <div className="mt-2 text-white/60 text-sm">
          Powered by KSB Guard · Condition Monitoring
        </div>
      </div>

      {/* Animated sensor icon */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-ksb-lightblue/20 flex items-center justify-center border-2 border-ksb-lightblue/30 pulse-ring">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="20" y="8" width="24" height="48" rx="6" fill="#0066CC" stroke="white" strokeWidth="2"/>
            <rect x="26" y="14" width="12" height="8" rx="2" fill="#003F7F"/>
            <circle cx="32" cy="42" r="5" fill="#E8500A"/>
            <path d="M12 28 Q8 32 12 36" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M52 28 Q56 32 52 36" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M6 22 Q0 32 6 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
            <path d="M58 22 Q64 32 58 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
          </svg>
        </div>
      </div>

      {/* Name form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wide">
            Your Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="Enter your name..."
            maxLength={40}
            className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-ksb-orange focus:border-transparent"
          />
          {error && <p className="mt-1 text-red-400 text-sm">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ksb-orange hover:bg-ksb-lightorange disabled:opacity-50 text-white font-black text-xl rounded-xl py-4 transition-all active:scale-95 shadow-lg"
        >
          {loading ? 'STARTING...' : '🎯 START CHALLENGE'}
        </button>
      </form>

      {/* Leaderboard preview */}
      <div className="w-full">
        <h2 className="text-center font-bold text-white/70 uppercase tracking-widest text-sm mb-4">
          Top Scores
        </h2>
        <Leaderboard entries={leaderboard} />
      </div>
    </div>
  );
}

// ── Active game screen ────────────────────────────────────────────────────────
function ActiveScreen({ state, onFinish }) {
  const { name, remaining, duration, currentVibration, peakVibration, score } = state;

  // Auto-finish when timer hits 0
  const finishedRef = useRef(false);
  useEffect(() => {
    if (remaining === 0 && !finishedRef.current) {
      finishedRef.current = true;
      onFinish();
    }
  }, [remaining, onFinish]);

  const intensity = Math.min(currentVibration / 100, 1);
  const bgOpacity = 0.05 + intensity * 0.25;

  return (
    <div
      className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 py-8"
      style={{ background: `radial-gradient(circle at 50% 40%, rgba(232,80,10,${bgOpacity}) 0%, transparent 70%)` }}
    >
      <div className="text-center">
        <div className="text-white/60 text-sm uppercase tracking-widest">Shaking</div>
        <div className="text-3xl font-black text-white">{name}</div>
      </div>

      <CountdownRing remaining={remaining ?? duration} duration={duration} />

      <div className="text-center text-white/80 text-lg font-semibold animate-pulse">
        {currentVibration < 5 ? '⚠️ Start shaking!' : currentVibration < 30 ? '💪 Keep going!' : currentVibration < 60 ? '🔥 Great job!' : '🚀 INCREDIBLE!'}
      </div>

      <VibrationGauge
        vibration={currentVibration}
        peak={peakVibration}
        active
      />

      <div className="text-center">
        <div className="text-white/50 text-xs uppercase tracking-widest">Current Score</div>
        <div className="text-5xl font-black text-ksb-lightorange tabular-nums">{score?.toLocaleString() ?? 0}</div>
      </div>

      <button
        onClick={onFinish}
        className="text-white/30 hover:text-white/60 text-sm transition-colors"
      >
        Stop early
      </button>
    </div>
  );
}

// ── Result screen ─────────────────────────────────────────────────────────────
function ResultScreen({ state, leaderboard, onReset }) {
  const { name, score, peakVibration, leaderboardEntry } = state;
  const rank = leaderboard.findIndex(e => e.id === leaderboardEntry?.id) + 1;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 py-10">
      <div className="text-center">
        <div className="text-white/60 text-sm uppercase tracking-widest mb-1">Well done,</div>
        <div className="text-4xl font-black text-white">{name}!</div>
      </div>

      {/* Score */}
      <div className="text-center score-pop">
        <div className="text-white/50 text-xs uppercase tracking-widest">Your Score</div>
        <div className="text-7xl font-black text-ksb-lightorange tabular-nums leading-none mt-1">
          {score?.toLocaleString()}
        </div>
        <div className="text-white/50 text-sm mt-1">
          Peak vibration: <span className="text-white font-bold">{Math.round(peakVibration)} mm/s</span>
        </div>
      </div>

      {/* Rank badge */}
      {rank > 0 && (
        <div className="bg-white/10 rounded-2xl px-8 py-4 text-center">
          <div className="text-white/50 text-xs uppercase tracking-widest">Leaderboard Rank</div>
          <div className="text-4xl font-black text-white mt-1">
            {rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `#${rank}`}
          </div>
        </div>
      )}

      {/* KSB Guard pitch */}
      <div className="bg-ksb-lightblue/15 border border-ksb-lightblue/30 rounded-2xl px-6 py-4 text-center">
        <div className="text-ksb-lightorange font-bold text-sm uppercase tracking-wide mb-1">
          Did you know?
        </div>
        <p className="text-white/80 text-sm leading-relaxed">
          The <strong className="text-white">KSB Guard</strong> sensor you just shook continuously monitors vibration on
          industrial pumps — detecting imbalance, bearing wear, and cavitation before they cause costly downtime.
        </p>
        <div className="mt-3 text-ksb-lightorange text-xs font-semibold">
          Ask our team how KSB Guard protects your assets →
        </div>
      </div>

      {/* Leaderboard */}
      <div className="w-full">
        <h2 className="text-center font-bold text-white/70 uppercase tracking-widest text-sm mb-4">
          Leaderboard
        </h2>
        <Leaderboard entries={leaderboard} highlightId={leaderboardEntry?.id} />
      </div>

      <button
        onClick={onReset}
        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl py-3 transition-all active:scale-95"
      >
        Next Player
      </button>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const { state, leaderboard, startGame, finishGame, resetGame } = useGameState();

  // Store last finished state for result screen
  const [resultState, setResultState] = useState(null);

  async function handleFinish() {
    const data = await finishGame();
    setResultState(data);
  }

  function handleReset() {
    setResultState(null);
    resetGame();
  }

  return (
    <div className="min-h-screen bg-ksb-blue overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-ksb-blue/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-ksb-orange flex items-center justify-center">
            <span className="text-white font-black text-xs">KSB</span>
          </div>
          <span className="font-bold text-white text-sm">Guard · Shaker Challenge</span>
        </div>
        <div className="text-xs text-white/40">
          {leaderboard.length} player{leaderboard.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="pb-12">
        {resultState ? (
          <ResultScreen state={resultState} leaderboard={leaderboard} onReset={handleReset} />
        ) : state.status === 'active' ? (
          <ActiveScreen state={state} onFinish={handleFinish} />
        ) : (
          <IdleScreen onStart={startGame} leaderboard={leaderboard} />
        )}
      </div>
    </div>
  );
}
