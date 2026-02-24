/**
 * Lightweight sound effects using Web Audio API.
 * No external files needed — generates tones programmatically.
 */

let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', volume = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported or blocked — fail silently
  }
}

export function playCorrectSound() {
  // Ascending two-tone "success" chime
  playTone(523, 0.15, 'sine', 0.12); // C5
  setTimeout(() => playTone(659, 0.2, 'sine', 0.12), 100); // E5
  setTimeout(() => playTone(784, 0.3, 'sine', 0.1), 200); // G5
}

export function playIncorrectSound() {
  // Low buzz "error" tone
  playTone(200, 0.25, 'square', 0.08);
  setTimeout(() => playTone(150, 0.3, 'square', 0.06), 150);
}

export function playStreakSound(streak) {
  // Higher pitch for longer streaks
  const base = 600 + (streak * 50);
  playTone(base, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(base + 200, 0.15, 'sine', 0.1), 80);
  setTimeout(() => playTone(base + 400, 0.25, 'sine', 0.08), 160);
}

export function playRankUpSound() {
  // Quick ascending arpeggio
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, 'sine', 0.1), i * 80);
  });
}

/**
 * Hook to manage sound enabled/disabled state.
 */
import { useState, useCallback } from 'react';

export function useSoundToggle() {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem('soundEnabled') !== 'false'; }
    catch { return true; }
  });

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem('soundEnabled', String(next)); } catch {}
      return next;
    });
  }, []);

  return { soundEnabled: enabled, toggleSound: toggle };
}
