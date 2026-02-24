import { useState, useEffect } from 'react';

export default function Timer({ endTime }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endTime) return;
    const tick = () => setRemaining(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isLow = remaining <= 10 && remaining > 0;

  return (
    <div className={`flex items-center gap-2 font-mono text-sm font-bold px-3 py-1.5 rounded-lg border ${
      isLow
        ? 'text-[#EA4335] border-[#EA4335]/30 bg-[#EA4335]/10 animate-pulse-slow'
        : 'text-[#eeeeec] border-[#5c3566] bg-[#2d0922]'
    }`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
    </div>
  );
}
