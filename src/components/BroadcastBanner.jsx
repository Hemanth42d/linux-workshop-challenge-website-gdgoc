import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';

/**
 * Shows admin broadcast messages as a banner below the header.
 */
export default function BroadcastBanner({ message, broadcastAt }) {
  const [dismissed, setDismissed] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    if (broadcastAt && broadcastAt !== lastSeen) {
      setDismissed(false);
      setLastSeen(broadcastAt);
    }
  }, [broadcastAt, lastSeen]);

  if (!message || dismissed) return null;

  return (
    <div className="mx-4 mt-3 animate-slide-down">
      <div className="bg-[#FBBC05]/10 border border-[#FBBC05]/30 rounded-xl px-4 py-3 flex items-center gap-3">
        <Megaphone size={16} className="text-[#FBBC05] shrink-0" />
        <p className="text-sm font-mono text-[#FBBC05] flex-1">{message}</p>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-[#FBBC05]/20 rounded-lg cursor-pointer text-[#FBBC05]/60 hover:text-[#FBBC05]"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
