import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { subscribeLeaderboard, subscribeSubmissions } from '../../services/firestore';
import UbuntuTerminal, { TerminalPrompt, TerminalOutput } from '../../components/UbuntuTerminal';

const rankBadge = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}.`;
};

const scoreBar = (score, maxScore) => {
  if (!maxScore) return '';
  const filled = Math.round((score / maxScore) * 20);
  return '█'.repeat(filled) + '░'.repeat(20 - filled);
};

export default function LeaderboardPage() {
  const { userId } = useOutletContext();
  const [leaders, setLeaders] = useState([]);
  const [firstSolverCounts, setFirstSolverCounts] = useState({});

  useEffect(() => {
    const unsub = subscribeLeaderboard(setLeaders);
    return unsub;
  }, []);

  // Track who has the most "first to solve" badges
  useEffect(() => {
    const unsub = subscribeSubmissions((subs) => {
      const counts = {};
      subs.filter((s) => s.isFirstSolver).forEach((s) => {
        counts[s.userId] = (counts[s.userId] || 0) + 1;
      });
      setFirstSolverCounts(counts);
    });
    return unsub;
  }, []);

  const maxScore = leaders.length > 0 ? Math.max(...leaders.map((u) => u.score || 0), 1) : 1;

  // Find the user with most first-solves
  const topSolverId = Object.entries(firstSolverCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-[#eeeeec] mb-6 font-mono">Leaderboard</h1>

      {/* Top 3 podium */}
      {leaders.length >= 3 && (
        <div className="podium-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[leaders[1], leaders[0], leaders[2]].map((u, i) => {
            const pos = [2, 1, 3][i];
            const colors = {
              1: 'border-[#FBBC05] bg-[#FBBC05]/10',
              2: 'border-[#888a85] bg-[#888a85]/10',
              3: 'border-[#EA4335]/60 bg-[#EA4335]/5',
            };
            const isFastest = u.id === topSolverId && firstSolverCounts[u.id] > 0;
            return (
              <div key={u.id} className={`rounded-xl border p-4 sm:p-5 text-center ${colors[pos]} ${pos === 1 ? 'sm:scale-105 podium-first' : ''}`}>
                <div className="text-3xl mb-2">{rankBadge(pos)}</div>
                <p className="text-lg font-bold text-[#eeeeec] truncate">{u.name}</p>
                <p className="text-sm font-mono text-[#ad7fa8] mt-0.5">{u.registerNumber}</p>
                <p className="text-2xl font-bold font-mono text-[#34e534] mt-2">{u.score || 0}</p>
                <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-mono text-[#888a85]">points</span>
                  {(u.streak || 0) > 0 && (
                    <span className="text-xs font-mono text-[#FBBC05]">🔥{u.streak}</span>
                  )}
                  {isFastest && (
                    <span className="text-xs font-mono text-[#FBBC05]">⚡{firstSolverCounts[u.id]}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full rankings table in terminal */}
      <UbuntuTerminal title="root@linux-challenge: ~/leaderboard">
        <TerminalPrompt user="root" path="~/leaderboard">cat rankings.log</TerminalPrompt>

        {leaders.length === 0 ? (
          <div className="mt-3">
            <TerminalOutput color="text-[#FBBC05]">No participants registered yet.</TerminalOutput>
          </div>
        ) : (
          <div className="mt-4">
            {/* Table header */}
            <div className="leaderboard-grid grid grid-cols-[2.5rem_1fr_3rem_5rem] sm:grid-cols-[3rem_1fr_4rem_4rem_6rem_1fr] gap-x-2 sm:gap-x-3 text-xs text-[#ad7fa8] font-mono uppercase tracking-wider pb-2 border-b border-[#5c3566]/40 mb-2">
              <span>Rank</span>
              <span>Participant</span>
              <span className="leaderboard-hide-sm">Streak</span>
              <span className="leaderboard-hide-sm">⚡</span>
              <span className="text-right">Score</span>
              <span className="pl-4 hidden md:block">Progress</span>
            </div>

            {/* Rows */}
            <div className="space-y-0">
              {leaders.map((u) => {
                const isYou = u.id === userId;
                const isFastest = u.id === topSolverId && firstSolverCounts[u.id] > 0;
                return (
                  <div
                    key={u.id}
                    className={`leaderboard-grid grid grid-cols-[2.5rem_1fr_3rem_5rem] sm:grid-cols-[3rem_1fr_4rem_4rem_6rem_1fr] gap-x-2 sm:gap-x-3 items-center py-2.5 font-mono border-b border-[#5c3566]/15 ${
                      isYou ? 'bg-[#4285F4]/8 -mx-3 px-3 rounded-lg' : ''
                    }`}
                  >
                    <span className="text-base">
                      {u.rank <= 3 ? rankBadge(u.rank) : <span className="text-[#888a85] text-sm">{u.rank}</span>}
                    </span>

                    <div className="min-w-0">
                      <span className={`text-base font-medium truncate block ${isYou ? 'text-[#729fcf]' : u.rank <= 3 ? 'text-[#34e534]' : 'text-[#eeeeec]'}`}>
                        {u.name}
                        {isFastest && <span className="ml-1.5 text-xs text-[#FBBC05]" title="Fastest solver">⚡</span>}
                      </span>
                      <span className="text-xs text-[#888a85] block truncate">{u.registerNumber}</span>
                    </div>

                    <span className="text-sm leaderboard-hide-sm">
                      {(u.streak || 0) > 0 ? (
                        <span className="text-[#FBBC05]">🔥{u.streak}</span>
                      ) : (
                        <span className="text-[#888a85]">—</span>
                      )}
                    </span>

                    <span className="text-xs text-[#FBBC05] leaderboard-hide-sm">
                      {firstSolverCounts[u.id] ? firstSolverCounts[u.id] : <span className="text-[#888a85]">—</span>}
                    </span>

                    <span className="text-right text-lg font-bold text-[#FBBC05]">
                      {u.score || 0}
                    </span>

                    <span className="text-[#34e534]/40 text-xs pl-4 hidden md:block">
                      {scoreBar(u.score || 0, maxScore)}
                      {isYou && <span className="text-[#729fcf] ml-2">← you</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-xs text-[#888a85] font-mono">
              {leaders.length} participants · ⚡ = first-to-solve count · 🔥 = streak · Speed bonus: faster = more points
            </div>
          </div>
        )}

        <div className="mt-4">
          <TerminalPrompt user="root" path="~/leaderboard">
            <span className="text-[#34e534] animate-pulse-slow">█</span>
          </TerminalPrompt>
        </div>
      </UbuntuTerminal>
    </div>
  );
}
