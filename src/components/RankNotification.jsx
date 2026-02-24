import { useEffect, useState } from 'react';

/**
 * Toast notification that appears when your rank changes on the leaderboard.
 */
export default function RankNotification({ currentRank, previousRank }) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('up'); // 'up' or 'down'

  useEffect(() => {
    if (!previousRank || !currentRank || previousRank === currentRank) return;

    if (currentRank < previousRank) {
      setMessage(`Rank up! #${previousRank} → #${currentRank}`);
      setType('up');
    } else {
      setMessage(`Rank dropped: #${previousRank} → #${currentRank}`);
      setType('down');
    }
    setShow(true);
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, [currentRank, previousRank]);

  if (!show) return null;

  return (
    <div className={`fixed top-24 right-6 z-[90] animate-slide-in-right font-mono text-sm px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2 ${
      type === 'up'
        ? 'bg-[#34A853]/15 border-[#34A853]/40 text-[#34e534]'
        : 'bg-[#EA4335]/15 border-[#EA4335]/40 text-[#EA4335]'
    }`}>
      <span className="text-lg">{type === 'up' ? '📈' : '📉'}</span>
      <span>{message}</span>
    </div>
  );
}
