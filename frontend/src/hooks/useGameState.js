import { useState, useEffect, useCallback, useRef } from 'react';

const API = '/api';

export function useGameState() {
  const [state, setState] = useState({ status: 'idle' });
  const [leaderboard, setLeaderboard] = useState([]);
  const pollRef = useRef(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data.entries || []);
    } catch { /* ignore */ }
  }, []);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/game/status`);
      const data = await res.json();
      setState(data);

      // If just finished, fetch leaderboard
      if (data.status === 'finished') {
        fetchLeaderboard();
      }
    } catch { /* ignore */ }
  }, [fetchLeaderboard]);

  // Poll during active game at 5 Hz, otherwise slower
  useEffect(() => {
    const interval = state.status === 'active' ? 200 : 1000;
    clearInterval(pollRef.current);
    pollRef.current = setInterval(pollStatus, interval);
    return () => clearInterval(pollRef.current);
  }, [state.status, pollStatus]);

  // Initial fetch
  useEffect(() => {
    pollStatus();
    fetchLeaderboard();
  }, [pollStatus, fetchLeaderboard]);

  const startGame = useCallback(async (name) => {
    const res = await fetch(`${API}/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to start');
    setState(data);
  }, []);

  const finishGame = useCallback(async () => {
    const res = await fetch(`${API}/game/finish`, { method: 'POST' });
    const data = await res.json();
    setState(data);
    fetchLeaderboard();
    return data;
  }, [fetchLeaderboard]);

  const resetGame = useCallback(async () => {
    await fetch(`${API}/game/reset`, { method: 'POST' });
    setState({ status: 'idle' });
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { state, leaderboard, startGame, finishGame, resetGame, fetchLeaderboard };
}
