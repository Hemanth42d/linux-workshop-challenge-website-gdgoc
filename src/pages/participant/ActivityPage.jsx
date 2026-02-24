import { useEffect, useState } from 'react';
import { subscribeActivityFeed } from '../../services/firestore';
import UbuntuTerminal, { TerminalPrompt, TerminalOutput } from '../../components/UbuntuTerminal';

export default function ActivityPage() {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    const unsub = subscribeActivityFeed(setFeed);
    return unsub;
  }, []);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-[#eeeeec] mb-6 font-mono">Live Activity</h1>

      <UbuntuTerminal title="root@linux-challenge: ~/logs">
        <TerminalPrompt user="root" path="~/logs">tail -f /var/log/challenge/activity.log</TerminalPrompt>
        <TerminalOutput color="text-[#888a85]">--- Live feed started ---</TerminalOutput>

        {feed.length === 0 ? (
          <div className="mt-4">
            <TerminalOutput color="text-[#FBBC05]">Waiting for activity...</TerminalOutput>
            <div className="mt-2">
              <span className="text-[#34e534] animate-pulse-slow font-mono">█</span>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-1">
            {feed.map((item, idx) => (
              <div key={item.id} className={`font-mono text-base py-1 ${idx === 0 ? 'animate-fade-in' : ''}`}>
                <span className={`inline-block w-14 ${item.isCorrect ? 'text-[#34e534]' : 'text-[#EA4335]'}`}>
                  [{item.isCorrect ? 'PASS' : 'FAIL'}]
                </span>
                <span className="text-[#ad7fa8] mr-2">{item.userName || 'user'}</span>
                <span className="text-[#888a85]">
                  {item.isCorrect ? '→ task completed' : '→ task failed'}
                </span>
                {item.pointsEarned > 0 && (
                  <span className="text-[#FBBC05] ml-2">+{item.pointsEarned}pts</span>
                )}
                {item.isFirstSolver && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-[#FBBC05]/15 text-[#FBBC05] border border-[#FBBC05]/30">
                    ⚡ FIRST
                  </span>
                )}
              </div>
            ))}
            <div className="mt-3">
              <span className="text-[#34e534] animate-pulse-slow font-mono">█</span>
            </div>
          </div>
        )}
      </UbuntuTerminal>
    </div>
  );
}
