import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import MeasurementCountdown from './components/MeasurementCountdown';
import Leaderboard from './components/Leaderboard';

// ── Idle / Name entry ─────────────────────────────────────────────────────────
function IdleScreen({ onStart, leaderboard, pump }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

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

  const wakeMinutes = pump?.wakeUpTimeMin ?? '?';

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center">
        <div className="text-ksb-cyan font-black text-5xl tracking-tight text-shadow">Guard.</div>
        <div className="text-white font-black text-5xl tracking-tight text-shadow">In Action.</div>
        <div className="mt-2 text-white/50 text-sm">KSB Guard · Solutions. For Life.</div>
      </div>

      {/* Sensor icon */}
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-ksb-blue/20 flex items-center justify-center border-2 border-ksb-blue/30 pulse-ring">
          <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
            <rect x="20" y="8" width="24" height="48" rx="6" fill="#0066b3" stroke="white" strokeWidth="2"/>
            <rect x="26" y="14" width="12" height="8" rx="2" fill="#003063"/>
            <circle cx="32" cy="42" r="5" fill="#29AAED"/>
            <path d="M12 28 Q8 32 12 36" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M52 28 Q56 32 52 36" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
      </div>

      {/* How it works */}
      <div className="w-full bg-white/5 rounded-2xl px-5 py-4 text-sm text-white/70 space-y-1">
        <div className="font-semibold text-white mb-2">How it works</div>
        <div>1. Enter your name and press Start</div>
        <div>2. Pick up the KSB Guard sensor and shake it as hard as you can</div>
        <div>3. A new measurement arrives every <span className="text-white font-semibold">{wakeMinutes} min</span> — keep shaking</div>
        <div>4. Your vibration score appears instantly</div>
      </div>

      {/* Name form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wide">
            Your Name
          </label>
          <input
            ref={inputRef}
            type="text" value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="Enter your name..."
            maxLength={40}
            className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-ksb-cyan"
          />
          {error && <p className="mt-1 text-red-400 text-sm">{error}</p>}
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full bg-ksb-blue hover:bg-ksb-blue-mid disabled:opacity-50 text-white font-black text-xl rounded-xl py-4 transition-all active:scale-95 shadow-lg"
        >
          {loading ? 'STARTING...' : '🎯 Start Challenge'}
        </button>
      </form>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="w-full">
          <h2 className="text-center font-bold text-white/50 uppercase tracking-widest text-sm mb-4">Top Scores</h2>
          <Leaderboard entries={leaderboard} />
        </div>
      )}
    </div>
  );
}

// ── Active game — waiting for measurement ─────────────────────────────────────
function WaitingScreen({ gameState, onFinish }) {
  const { name, nextMeasurementAt, wakeUpTimeMs, msUntilMeasurement } = gameState;
  const isImminent = msUntilMeasurement != null && msUntilMeasurement <= 5000;

  return (
    <div
      className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 py-10"
      style={{ background: isImminent
        ? 'radial-gradient(circle at 50% 40%, rgba(0,102,179,0.3) 0%, transparent 70%)'
        : 'radial-gradient(circle at 50% 40%, rgba(0,102,179,0.12) 0%, transparent 70%)' }}
    >
      <div className="text-center">
        <div className="text-white/60 text-sm uppercase tracking-widest">Challenge active</div>
        <div className="text-3xl font-black text-white">{name}</div>
      </div>

      <MeasurementCountdown
        nextMeasurementAt={nextMeasurementAt}
        wakeUpTimeMs={wakeUpTimeMs}
      />

      {/* Instructions */}
      <div className={`text-center rounded-2xl px-6 py-4 transition-all ${
        isImminent ? 'bg-ksb-cyan/20 ring-2 ring-ksb-cyan' : 'bg-white/5'
      }`}>
        {isImminent ? (
          <p className="text-white font-black text-xl">
            Shake as hard as you can.
          </p>
        ) : (
          <p className="text-white/70 text-sm leading-relaxed">
            The KSB Guard sensor is about to take a measurement.<br/>
            Pick it up and get ready — shake as hard as you can when the timer hits zero.
          </p>
        )}
      </div>

      {/* Sensor icon */}
      <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${
        isImminent ? 'border-ksb-cyan bg-ksb-cyan/20 shake-anim' : 'border-ksb-blue/30 bg-ksb-blue/10 pulse-ring'
      }`}>
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
          <rect x="20" y="8" width="24" height="48" rx="6" fill="#0066b3" stroke="white" strokeWidth="2"/>
          <rect x="26" y="14" width="12" height="8" rx="2" fill="#003063"/>
          <circle cx="32" cy="42" r="5" fill="#29AAED"/>
          <path d="M12 28 Q8 32 12 36" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d="M52 28 Q56 32 52 36" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
      </div>

      <button onClick={onFinish} className="text-white/30 hover:text-white/60 text-sm transition-colors">
        Cancel
      </button>
    </div>
  );
}

// ── Result screen ─────────────────────────────────────────────────────────────
function ResultScreen({ resultData, leaderboard, onReset }) {
  const { name, score, vibration, leaderboardEntry, status } = resultData;
  const timedOut = status === 'timeout';
  const rank = leaderboard.findIndex(e => e.id === leaderboardEntry?.id) + 1;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 py-10">
      <div className="text-center">
        <div className="text-white/60 text-sm uppercase tracking-widest mb-1">
          {timedOut ? 'Session ended' : 'Measurement received.'}
        </div>
        <div className="text-4xl font-black text-white">{name}</div>
      </div>

      {timedOut ? (
        <div className="bg-white/10 rounded-2xl px-6 py-6 text-center">
          <div className="text-5xl mb-3">⏱️</div>
          <p className="text-white/70">No measurement arrived before the timeout.<br/>Try again.</p>
        </div>
      ) : (
        <>
          {/* Score */}
          <div className="text-center score-pop">
            <div className="text-white/50 text-xs uppercase tracking-widest">Your Score</div>
            <div className="text-7xl font-black text-ksb-cyan tabular-nums leading-none mt-1">
              {score?.toLocaleString()}
            </div>
            <div className="text-white/50 text-sm mt-1">
              Peak: <span className="text-white font-bold">{vibration?.toFixed(2)} mm/s</span>
            </div>
          </div>

          {/* Rank */}
          {rank > 0 && (
            <div className="bg-white/10 rounded-2xl px-8 py-4 text-center">
              <div className="text-white/50 text-xs uppercase tracking-widest">Leaderboard Rank</div>
              <div className="text-4xl font-black text-white mt-1">
                {rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `#${rank}`}
              </div>
            </div>
          )}
        </>
      )}

      {/* KSB Guard pitch */}
      <div className="bg-ksb-blue/15 border border-ksb-blue/30 rounded-2xl px-6 py-4 text-center">
        <div className="text-ksb-cyan font-bold text-sm uppercase tracking-wide mb-1">
          KSB Guard — Condition Monitoring
        </div>
        <p className="text-white/80 text-sm leading-relaxed">
          The <strong className="text-white">KSB Guard</strong> sensor you just held continuously
          monitors vibration on industrial pumps — detecting imbalance, bearing wear, and
          cavitation before they cause costly downtime.
        </p>
        <div className="mt-3 text-ksb-cyan text-xs font-semibold">
          Ask our team about KSB Guard condition monitoring.
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="w-full">
          <h2 className="text-center font-bold text-white/70 uppercase tracking-widest text-sm mb-4">Leaderboard</h2>
          <Leaderboard entries={leaderboard} highlightId={leaderboardEntry?.id} />
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full bg-ksb-blue hover:bg-ksb-blue-mid text-white font-bold rounded-xl py-3 transition-all active:scale-95"
      >
        Next Player
      </button>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { gameState, leaderboard, pump, startGame, finishGame, resetGame } = useGameState();
  const [resultData, setResultData] = useState(null);
  const prevStatus = useRef(null);

  // Auto-finish when backend reports scored/timeout
  useEffect(() => {
    const s = gameState.status;
    if ((s === 'scored' || s === 'timeout') && prevStatus.current === 'waiting') {
      finishGame().then(data => setResultData(data));
    }
    prevStatus.current = s;
  }, [gameState.status, finishGame]);

  function handleReset() {
    setResultData(null);
    resetGame();
  }

  return (
    <div className="min-h-screen bg-ksb-navy overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-ksb-navy/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-ksb-blue flex items-center justify-center">
            <span className="text-white font-black text-xs">KSB</span>
          </div>
          <span className="font-bold text-white text-sm">Guard · In Action.</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/40">
          {pump && <span>{pump.pumpName}</span>}
          <span>{leaderboard.length} player{leaderboard.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="pb-12">
        {resultData ? (
          <ResultScreen resultData={resultData} leaderboard={leaderboard} onReset={handleReset} />
        ) : gameState.status === 'waiting' ? (
          <WaitingScreen gameState={gameState} onFinish={() => finishGame().then(setResultData)} />
        ) : (
          <IdleScreen onStart={startGame} leaderboard={leaderboard} pump={pump} />
        )}
      </div>
    </div>
  );
}
