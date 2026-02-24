import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthChange, adminLogout } from '../../services/auth';
import {
  subscribeGameState, subscribeUsers, subscribeQuestions,
  updateGameState, initGameState, addQuestion, updateQuestion,
  deleteQuestion, subscribeLeaderboard
} from '../../services/firestore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import {
  Users, HelpCircle, Play, Square, SkipForward, Trophy,
  Plus, Trash2, Edit3, Save, X, LogOut, LayoutDashboard, Settings, Award
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'questions', label: 'Questions', icon: HelpCircle },
  { id: 'rounds', label: 'Round Control', icon: Settings },
  { id: 'leaderboard', label: 'Leaderboard', icon: Award },
];

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(null);
  const [tab, setTab] = useState('overview');
  const [gameState, setGameState] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (!user) { navigate('/admin'); return; }
      setAuthed(user);
      initGameState();
    });
    return unsub;
  }, [navigate]);

  useEffect(() => {
    if (!authed) return;
    const unsubs = [
      subscribeGameState(setGameState),
      subscribeUsers(setUsers),
      subscribeQuestions(setQuestions),
      subscribeLeaderboard(setLeaders),
    ];
    return () => unsubs.forEach((u) => u());
  }, [authed]);

  if (authed === null) return <Loader text="Checking authentication..." />;

  const handleLogout = async () => { await adminLogout(); navigate('/admin'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <Settings size={14} className="text-white" />
            </span>
            Admin Panel
          </h2>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${tab === t.id ? 'bg-[#4285F4]/10 text-[#4285F4]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto animate-fade-in">
          {tab === 'overview' && <OverviewTab gameState={gameState} users={users} questions={questions} />}
          {tab === 'questions' && <QuestionsTab questions={questions} />}
          {tab === 'rounds' && <RoundsTab gameState={gameState} questions={questions} />}
          {tab === 'leaderboard' && <LeaderboardTab leaders={leaders} />}
        </div>
      </main>
    </div>
  );
}

// ── Overview Tab ──
function OverviewTab({ gameState, users, questions }) {
  const stats = [
    { label: 'Participants', value: users.length, icon: Users, color: 'bg-blue-50 text-[#4285F4]' },
    { label: 'Questions', value: questions.length, icon: HelpCircle, color: 'bg-green-50 text-[#34A853]' },
    { label: 'Current Round', value: gameState?.currentRound || 0, icon: Play, color: 'bg-yellow-50 text-[#FBBC05]' },
    { label: 'Status', value: gameState?.status || 'N/A', icon: Trophy, color: 'bg-red-50 text-[#EA4335]', isBadge: true },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                {s.isBadge ? <StatusBadge status={s.value} /> : <p className="text-xl font-bold text-gray-900">{s.value}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Recent Participants</h3>
        {users.length === 0 ? (
          <p className="text-sm text-gray-400">No participants have joined yet.</p>
        ) : (
          <div className="space-y-2">
            {users.slice(0, 10).map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 text-sm">
                <span className="font-medium text-gray-700">{u.name}</span>
                <span className="text-gray-400">{u.registerNumber}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Questions Tab ──
function QuestionsTab({ questions }) {
  const [form, setForm] = useState({ questionText: '', correctAnswer: '', round: 1, difficulty: 'medium' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => { setForm({ questionText: '', correctAnswer: '', round: 1, difficulty: 'medium' }); setEditingId(null); };

  const handleSave = async () => {
    if (!form.questionText || !form.correctAnswer) return;
    setSaving(true);
    try {
      const data = { ...form, round: Number(form.round) };
      if (editingId) {
        await updateQuestion(editingId, data);
      } else {
        await addQuestion(data);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (q) => {
    setEditingId(q.id);
    setForm({ questionText: q.questionText, correctAnswer: q.correctAnswer, round: q.round, difficulty: q.difficulty || 'medium' });
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this question?')) await deleteQuestion(id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Question Management</h1>
      <Card className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">{editingId ? 'Edit Question' : 'Add New Question'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <Input label="Question Text" placeholder="e.g., What command lists files in a directory?" value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} />
          </div>
          <Input label="Correct Answer" placeholder="e.g., ls" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Round" type="number" min="1" value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 focus:border-[#4285F4] text-sm"
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            <Save size={14} />{saving ? 'Saving...' : editingId ? 'Update' : 'Add Question'}
          </Button>
          {editingId && <Button variant="ghost" onClick={resetForm} className="flex items-center gap-2"><X size={14} />Cancel</Button>}
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">All Questions ({questions.length})</h3>
        {questions.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No questions added yet.</p>
        ) : (
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 group">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-gray-900 truncate">{q.questionText}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>Round {q.round}</span>
                    <span className="capitalize">{q.difficulty || 'medium'}</span>
                    <span>Answer: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">{q.correctAnswer}</code></span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(q)} className="p-2 hover:bg-white rounded-lg cursor-pointer" aria-label="Edit question"><Edit3 size={14} className="text-gray-500" /></button>
                  <button onClick={() => handleDelete(q.id)} className="p-2 hover:bg-white rounded-lg cursor-pointer" aria-label="Delete question"><Trash2 size={14} className="text-[#EA4335]" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Rounds Tab ──
function RoundsTab({ gameState, questions }) {
  const [timerDuration, setTimerDuration] = useState(300);
  const [updating, setUpdating] = useState(false);

  const roundQuestions = questions.filter((q) => q.round === gameState?.currentRound);

  const handleAction = async (action) => {
    setUpdating(true);
    try {
      switch (action) {
        case 'start':
          await updateGameState({
            status: 'round_active',
            currentRound: (gameState?.currentRound || 0) + 1,
            currentQuestionIndex: 0,
            roundEndTime: Date.now() + timerDuration * 1000,
          });
          break;
        case 'stop':
          await updateGameState({ status: 'round_ended', roundEndTime: null });
          break;
        case 'next_round':
          await updateGameState({
            status: 'round_active',
            currentRound: (gameState?.currentRound || 0) + 1,
            currentQuestionIndex: 0,
            roundEndTime: Date.now() + timerDuration * 1000,
          });
          break;
        case 'next_question':
          await updateGameState({
            currentQuestionIndex: (gameState?.currentQuestionIndex || 0) + 1,
          });
          break;
        case 'end_challenge':
          await updateGameState({ status: 'challenge_ended', roundEndTime: null });
          break;
        case 'reset':
          await updateGameState({ status: 'waiting', currentRound: 0, currentQuestionIndex: 0, roundEndTime: null });
          break;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const isActive = gameState?.status === 'round_active';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Round Control</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Current State</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Status</span>
              <StatusBadge status={gameState?.status} />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Round</span>
              <span className="font-bold text-gray-900">{gameState?.currentRound || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Question Index</span>
              <span className="font-bold text-gray-900">{(gameState?.currentQuestionIndex || 0) + 1}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Questions in Round</span>
              <span className="font-bold text-gray-900">{roundQuestions.length}</span>
            </div>
          </div>
          <div className="mb-4">
            <Input
              label="Timer Duration (seconds)"
              type="number"
              min="30"
              value={timerDuration}
              onChange={(e) => setTimerDuration(Number(e.target.value))}
            />
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Controls</h3>
          <div className="space-y-3">
            {!isActive && gameState?.status !== 'challenge_ended' && (
              <Button onClick={() => handleAction('start')} disabled={updating} className="w-full flex items-center justify-center gap-2">
                <Play size={16} />Start Round {(gameState?.currentRound || 0) + 1}
              </Button>
            )}
            {isActive && (
              <>
                <Button variant="danger" onClick={() => handleAction('stop')} disabled={updating} className="w-full flex items-center justify-center gap-2">
                  <Square size={16} />End Current Round
                </Button>
                <Button variant="warning" onClick={() => handleAction('next_question')} disabled={updating} className="w-full flex items-center justify-center gap-2">
                  <SkipForward size={16} />Next Question
                </Button>
              </>
            )}
            {gameState?.status === 'round_ended' && (
              <Button variant="success" onClick={() => handleAction('next_round')} disabled={updating} className="w-full flex items-center justify-center gap-2">
                <SkipForward size={16} />Start Next Round
              </Button>
            )}
            <hr className="border-gray-100" />
            <Button variant="ghost" onClick={() => handleAction('end_challenge')} disabled={updating} className="w-full">
              End Challenge
            </Button>
            <Button variant="ghost" onClick={() => handleAction('reset')} disabled={updating} className="w-full text-[#EA4335]">
              Reset Everything
            </Button>
          </div>
        </Card>
      </div>
      {/* Game State Changer */}
      <Card className="mt-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Quick Status Change</h3>
        <div className="flex flex-wrap gap-2">
          {['waiting', 'round_active', 'round_ended', 'challenge_ended'].map((s) => (
            <Button
              key={s}
              variant={gameState?.status === s ? 'primary' : 'ghost'}
              onClick={() => updateGameState({ status: s })}
              className="text-xs"
            >
              {s.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Leaderboard Tab ──
function LeaderboardTab({ leaders }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leaderboard</h1>
      <Card>
        {leaders.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No participants yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Rank</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">Register #</th>
                  <th className="text-right py-3 px-3 text-gray-500 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      {u.rank <= 3 ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          u.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                          u.rank === 2 ? 'bg-gray-100 text-gray-600' :
                          'bg-amber-50 text-amber-700'
                        }`}>{u.rank}</span>
                      ) : (
                        <span className="text-gray-400 pl-1.5">{u.rank}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-900">{u.name}</td>
                    <td className="py-3 px-3 text-gray-500">{u.registerNumber || '—'}</td>
                    <td className="py-3 px-3 text-right font-bold text-[#4285F4]">{u.score || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
