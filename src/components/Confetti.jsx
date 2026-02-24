import { useEffect, useState } from 'react';

/**
 * Lightweight terminal-themed confetti.
 * Spawns falling characters that look like terminal output.
 */
const CHARS = ['$', '#', '>', '~', '*', '+', '0', '1', '✓', '█', '▓', '░'];
const COLORS = ['#34e534', '#FBBC05', '#4285F4', '#729fcf', '#ad7fa8', '#34A853'];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

export default function Confetti({ active, duration = 2000 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }

    const count = 40;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      left: randomBetween(5, 95),
      delay: randomBetween(0, 0.4),
      duration: randomBetween(1, 2),
      size: randomBetween(10, 20),
      drift: randomBetween(-30, 30),
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute font-mono font-bold animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            color: p.color,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
