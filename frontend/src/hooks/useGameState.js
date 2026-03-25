import { useState, useEffect, useCallback, useRef } from 'react';

const API = '/api';

export function useGameState() {
  const [gameState, setGameState] = useState({ status: 'idle' });
  const [leaderboard, setLeaderboard] = useState([]);
  const [pump, setPump] = useState(null);
  const pollRef = useRef(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data.entries || []);
    } catch { /* ignore */ }
  }, []);

  const fetchPump = useCallback(async () => {
    try {
      const res = await fetch(`${API}/pump`);
      if (res.ok) {
        const data = await res.json();
        setPump(data.pump);
      }
    } catch { /* ignore */ }
  }, []);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/game/status`);
      const data = await res.json();
      setGameState(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    // Poll faster while a game is running
    const interval = gameState.status === 'waiting' ? 1000 : 3000;
    clearInterval(pollRef.current);
    pollRef.current = setInterval(pollStatus, interval);
    return () => clearInterval(pollRef.current);
  }, [gameState.status, pollStatus]);

  useEffect(() => {
    pollStatus();
    fetchLeaderboard();
    fetchPump();
  }, [pollStatus, fetchLeaderboard, fetchPump]);

  const startGame = useCallback(async (name) => {
    const res = await fetch(`${API}/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to start');
    setGameState(data);
  }, []);

  const finishGame = useCallback(async () => {
    const res = await fetch(`${API}/game/finish`, { method: 'POST' });
    const data = await res.json();
    fetchLeaderboard();
    return data;
  }, [fetchLeaderboard]);

  const resetGame = useCallback(async () => {
    await fetch(`${API}/game/reset`, { method: 'POST' });
    setGameState({ status: 'idle' });
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { gameState, leaderboard, pump, startGame, finishGame, resetGame, fetchLeaderboard };
}
