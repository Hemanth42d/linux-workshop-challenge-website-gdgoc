import { useMemo } from 'react';

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789$#>~./|\\{}[]';

/**
 * Matrix-style falling characters background.
 * Lightweight — uses CSS animations, no canvas.
 */
export default function MatrixRain({ columns = 20 }) {
  const cols = useMemo(() => {
    return Array.from({ length: columns }, (_, i) => ({
      id: i,
      left: (i / columns) * 100 + Math.random() * (100 / columns),
      chars: Array.from({ length: 8 + Math.floor(Math.random() * 12) }, () =>
        CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join('\n'),
      duration: 4 + Math.random() * 8,
      delay: Math.random() * 5,
      opacity: 0.05 + Math.random() * 0.12,
      size: 10 + Math.random() * 4,
    }));
  }, [columns]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {cols.map((col) => (
        <div
          key={col.id}
          className="absolute top-0 font-mono text-[#34e534] whitespace-pre leading-tight animate-matrix-fall"
          style={{
            left: `${col.left}%`,
            opacity: col.opacity,
            fontSize: `${col.size}px`,
            '--duration': `${col.duration}s`,
            '--delay': `${col.delay}s`,
          }}
        >
          {col.chars}
        </div>
      ))}
    </div>
  );
}
