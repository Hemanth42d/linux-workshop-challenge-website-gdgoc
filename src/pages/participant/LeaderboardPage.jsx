import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeLeaderboard, subscribeActivityFeed, subscribeGameState } from '../../services/firestore';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { Trophy, Medal, ArrowLeft, Activity } from 'lucide-react';

const rankColors = ['text-[#FBBC05]', 'text-gray-400', 'text-amber-700'];

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [feed, setFeed] = useState([]);
  const [gameState, setGameState] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('workshopUserId');

  useEffect(() => {
    const unsubs = [
      subscribeLeaderboard(setLeaders),
      subscribeActivityFeed(setFeed),
      subscribeGameState(setGameState),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto pt-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer" aria-label="Go back">
              <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Leaderboard</h1>
          </div>
          {gameState && <StatusBadge status={gameState.status} />}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              {leaders.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No participants yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" role="table">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-2 text-gray-500 font-medium">Rank</th>
                        <th className="text-left py-3 px-2 text-gray-500 font-medium">Name</th>
                        <th className="text-right py-3 px-2 text-gray-500 font-medium">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaders.map((u) => (
                        <tr key={u.id} className={`border-b border-gray-50 ${u.id === userId ? 'bg-blue-50/50' : ''}`}>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1">
                              {u.rank <= 3 ? (
                                <Medal size={18} className={rankColors[u.rank - 1]} />
                              ) : (
                                <span className="text-gray-400 w-[18px] text-center">{u.rank}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 font-medium text-gray-900">
                            {u.name} {u.id === userId && <span className="text-xs text-[#4285F4] ml-1">(You)</span>}
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-[#4285F4]">{u.score || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
          <div>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-[#34A853]" />
                <h3 className="font-semibold text-gray-900 text-sm">Activity Feed</h3>
              </div>
              {feed.length === 0 ? (
                <p className="text-xs text-gray-400">No activity yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {feed.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-gray-50">
                      {item.isCorrect ? <CheckIcon /> : <XIcon />}
                      <div>
                        <span className="font-medium text-gray-700">{item.userName || 'User'}</span>
                        <span className="text-gray-400"> answered {item.isCorrect ? 'correctly' : 'incorrectly'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return <span className="w-4 h-4 rounded-full bg-green-100 text-[#34A853] flex items-center justify-center text-[10px] mt-0.5 shrink-0">✓</span>;
}
function XIcon() {
  return <span className="w-4 h-4 rounded-full bg-red-100 text-[#EA4335] flex items-center justify-center text-[10px] mt-0.5 shrink-0">✗</span>;
}
