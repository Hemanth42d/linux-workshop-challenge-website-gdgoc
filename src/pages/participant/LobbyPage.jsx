import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeGameState } from '../../services/firestore';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { Loader2, Users } from 'lucide-react';

export default function LobbyPage() {
  const [gameState, setGameState] = useState(null);
  const navigate = useNavigate();
  const userName = localStorage.getItem('workshopUserName') || 'Participant';

  useEffect(() => {
    const userId = localStorage.getItem('workshopUserId');
    if (!userId) { navigate('/'); return; }

    const unsub = subscribeGameState((state) => {
      setGameState(state);
      if (state?.status === 'round_active') navigate('/challenge');
    });
    return unsub;
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-lg text-center animate-fade-in">
        <Card className="space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 mx-auto">
            <Users className="text-[#4285F4]" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Welcome, {userName}</h2>
            <p className="text-gray-500 text-sm mt-1">You're in the lobby. Hang tight.</p>
          </div>
          {gameState && <StatusBadge status={gameState.status} />}
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" />
            <span>Waiting for the admin to start the round...</span>
          </div>
          {gameState?.status === 'challenge_ended' && (
            <p className="text-sm font-medium text-gray-600">The challenge has ended. Check the leaderboard!</p>
          )}
        </Card>
        <button onClick={() => navigate('/leaderboard')} className="mt-4 text-sm text-[#4285F4] hover:underline cursor-pointer">
          View Leaderboard
        </button>
      </div>
    </div>
  );
}
