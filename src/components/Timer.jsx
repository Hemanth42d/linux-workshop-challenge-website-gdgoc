import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function Timer({ endTime }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isLow = remaining <= 10 && remaining > 0;

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-bold ${isLow ? 'text-[#EA4335] animate-pulse-slow' : 'text-gray-700'}`}>
      <Clock size={18} />
      <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
    </div>
  );
}
