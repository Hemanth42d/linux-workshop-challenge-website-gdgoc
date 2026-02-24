import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { subscribeGameState, getUser, subscribeUsers, subscribeLeaderboard } from '../../services/firestore';
import { DEFAULT_CONFIG } from '../../services/scoring';
import StatusBadge from '../../components/StatusBadge';
import RankNotification from '../../components/RankNotification';
import BroadcastBanner from '../../components/BroadcastBanner';
import { useSoundToggle, playRankUpSound } from '../../hooks/useSound';
import { Terminal, Trophy, Activity, Radio, User, LogOut, Users, Volume2, VolumeX } from 'lucide-react';

const NAV = [
  { path: '/lobby', label: 'Lobby', icon: Radio, key: '1' },
  { path: '/challenge', label: 'Challenge', icon: Terminal, key: '2' },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy, key: '3' },
  { path: '/activity', label: 'Activity', icon: Activity, key: '4' },
];

export default function ParticipantLayout() {
  const [gameState, setGameState] = useState(null);
  const [score, setScore] = useState(0);
  const [participantCount, setParticipantCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentRank, setCurrentRank] = useState(null);
  const [previousRank, setPreviousRank] = useState(null);
  const { soundEnabled, toggleSound } = useSoundToggle();
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('workshopUserName') || 'participant';
  const userId = localStorage.getItem('workshopUserId');
  const rankRef = useRef(null);

  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    const unsub1 = subscribeGameState(setGameState);
    const unsub2 = subscribeUsers((users) => setParticipantCount(users.length));
    const unsub3 = subscribeLeaderboard((leaders) => {
      const me = leaders.find((u) => u.id === userId);
      if (me) {
        const newRank = me.rank;
        if (rankRef.current !== null && rankRef.current !== newRank) {
          setPreviousRank(rankRef.current);
          setCurrentRank(newRank);
          if (newRank < rankRef.current && soundEnabled) playRankUpSound();
        }
        rankRef.current = newRank;
      }
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [userId, navigate, soundEnabled]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(async () => {
      const user = await getUser(userId);
      if (user) {
        setScore(user.score || 0);
        setStreak(user.streak || 0);
      }
    }, 5000);
    getUser(userId).then((u) => {
      if (u) {
        setScore(u.score || 0);
        setStreak(u.streak || 0);
      }
    });
    return () => clearInterval(interval);
  }, [userId]);

  // Keyboard shortcuts: Ctrl+1-4 to navigate
  const handleKeyboard = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    const nav = NAV.find((n) => n.key === e.key);
    if (nav) {
      e.preventDefault();
      navigate(nav.path);
    }
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  const handleLeave = () => {
    localStorage.removeItem('workshopUserId');
    localStorage.removeItem('workshopUserName');
    navigate('/');
  };

  const currentPage = NAV.find((n) => n.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#3c1130] flex flex-col md:flex-row">
      {/* Rank change notification */}
      <RankNotification currentRank={currentRank} previousRank={previousRank} />

      {/* Desktop Sidebar */}
      <aside className="sidebar-desktop fixed top-4 left-4 bottom-4 w-52 bg-[#300a24] border border-[#5c3566] rounded-2xl flex flex-col z-50 shadow-2xl">
        <div className="p-4 border-b border-[#5c3566]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#4285F4]/20 flex items-center justify-center">
              <User size={14} className="text-[#4285F4]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#eeeeec] truncate">{userName}</p>
              <p className="text-xs font-mono text-[#34e534]">{score} pts</p>
            </div>
          </div>
          {gameState && <StatusBadge status={gameState.status} />}
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5">
          {NAV.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${active ? 'bg-[#4285F4]/20 text-[#729fcf]' : 'text-[#ad7fa8] hover:bg-[#5c3566]/20 hover:text-[#eeeeec]'}`}
              >
                <item.icon size={15} />
                <span className="flex-1 text-left">{item.label}</span>
                <span className="text-[10px] text-[#888a85]/50 font-mono">⌘{item.key}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-2.5 space-y-1.5">
          <button
            onClick={toggleSound}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#ad7fa8] hover:text-[#eeeeec] hover:bg-[#5c3566]/20 cursor-pointer transition-colors"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            Sound {soundEnabled ? 'On' : 'Off'}
          </button>
          <button
            onClick={handleLeave}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold font-mono bg-[#EA4335] hover:bg-[#d33426] text-white cursor-pointer transition-colors"
          >
            <LogOut size={14} />
            Leave Challenge
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-[#300a24] border-t border-[#5c3566] px-2 py-1.5 justify-around items-center">
        {NAV.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors
                ${active ? 'text-[#729fcf]' : 'text-[#ad7fa8]'}`}
            >
              <item.icon size={18} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main area */}
      <div className="main-with-sidebar md:ml-60 flex-1 min-h-screen flex flex-col pb-16 md:pb-0">
        {/* Floating header */}
        <header className="sticky top-0 z-40 mx-4 mt-4 bg-[#300a24] border border-[#5c3566] rounded-2xl shadow-2xl px-4 md:px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#34A853]/15 border border-[#34A853]/30 flex items-center justify-center">
              <span className="text-[#34e534] font-mono text-sm font-bold">$_</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#eeeeec] font-mono">{gameState?.challengeName || DEFAULT_CONFIG.challengeName}</h1>
              <p className="text-xs text-[#888a85] font-mono">{currentPage}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 header-desktop-items">
            {/* Participant count */}
            <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/20">
              <Users size={13} className="text-[#4285F4]" />
              <span className="text-xs font-mono font-bold text-[#729fcf]">{participantCount}</span>
              <span className="text-xs font-mono text-[#888a85] hidden lg:inline">online</span>
            </div>

            {/* Rank badge */}
            {rankRef.current && (
              <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg bg-[#ad7fa8]/10 border border-[#ad7fa8]/20">
                <span className="text-xs font-mono font-bold text-[#ad7fa8]">#{rankRef.current}</span>
              </div>
            )}

            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg bg-[#FBBC05]/10 border border-[#FBBC05]/20">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-mono font-bold text-[#FBBC05]">{streak}</span>
              </div>
            )}

            {/* Score */}
            <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg bg-[#34A853]/10 border border-[#34A853]/20">
              <span className="text-xs font-mono font-bold text-[#34e534]">{score} pts</span>
            </div>

            {gameState && <StatusBadge status={gameState.status} />}
          </div>

          {/* Mobile: just show score */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-xs font-mono font-bold text-[#34e534]">{score}pts</span>
            {streak > 0 && <span className="text-xs">🔥{streak}</span>}
          </div>
        </header>

        {/* Broadcast banner */}
        {gameState?.broadcastMessage && (
          <BroadcastBanner message={gameState.broadcastMessage} broadcastAt={gameState.broadcastAt} />
        )}

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet context={{ gameState, userName, userId, streak, setStreak, soundEnabled }} />
        </main>
      </div>
    </div>
  );
}
