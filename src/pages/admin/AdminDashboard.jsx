import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthChange, adminLogout } from '../../services/auth';
import {
  subscribeGameState, subscribeUsers, subscribeQuestions,
  updateGameState, initGameState, addQuestion, updateQuestion,
  deleteQuestion, subscribeLeaderboard, sendBroadcast, clearBroadcast,
  subscribeSubmissions
} from '../../services/firestore';
import { QUESTION_TYPES } from '../../services/validation';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import {
  Users, Play, Square, SkipForward, Trophy,
  Trash2, Edit3, Save, X, LogOut, Settings, Award,
  Terminal, FileOutput, Wrench, LayoutDashboard, Crosshair, Menu, XIcon,
  Upload, FileJson, CheckCircle, AlertCircle, Copy, Megaphone, Download, BarChart3
} from 'lucide-react';

import { DEFAULT_CONFIG } from '../../services/scoring';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Task Management', icon: Terminal },
  { id: 'rounds', label: 'Round Control', icon: Settings },
  { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
  { id: 'leaderboard', label: 'Leaderboard', icon: Award },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(null);
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [gameState, setGameState] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [submissions, setSubmissions] = useState([]);
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
      subscribeSubmissions(setSubmissions),
    ];
    return () => unsubs.forEach((u) => u());
  }, [authed]);

  if (authed === null) return <div className="min-h-screen bg-[#3c1130] flex items-center justify-center"><Loader text="Authenticating..." /></div>;

  return (
    <div className="min-h-screen bg-[#3c1130] relative">
      {/* Floating Sidebar */}
      <aside className={`fixed top-4 left-4 bottom-4 w-56 bg-[#300a24] border border-[#5c3566] rounded-2xl flex flex-col z-50 shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)]'}`}>
        <div className="p-4 border-b border-[#5c3566] flex items-center justify-between">
          <h2 className="font-bold text-[#eeeeec] text-xs flex items-center gap-2 font-mono">
            <span className="w-6 h-6 rounded-lg bg-[#4285F4] flex items-center justify-center">
              <Crosshair size={12} className="text-white" />
            </span>
            Challenge Admin
          </h2>
          <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-[#5c3566]/30 rounded-lg cursor-pointer text-[#ad7fa8]">
            <XIcon size={14} />
          </button>
        </div>
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                ${tab === t.id ? 'bg-[#4285F4]/20 text-[#729fcf]' : 'text-[#ad7fa8] hover:bg-[#5c3566]/20 hover:text-[#eeeeec]'}`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-2.5">
          <button
            onClick={() => { adminLogout(); navigate('/admin'); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold font-mono bg-[#EA4335] hover:bg-[#d33426] text-white cursor-pointer transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar toggle button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-[#300a24] border border-[#5c3566] rounded-xl text-[#ad7fa8] hover:text-[#eeeeec] hover:bg-[#5c3566]/30 cursor-pointer transition-all shadow-lg"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Main content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-8 min-h-screen`}>
        <div className="max-w-5xl mx-auto animate-fade-in">
          {tab === 'overview' && <OverviewTab gameState={gameState} users={users} questions={questions} submissions={submissions} />}
          {tab === 'tasks' && <TasksTab questions={questions} submissions={submissions} />}
          {tab === 'rounds' && <RoundsTab gameState={gameState} questions={questions} />}
          {tab === 'broadcast' && <BroadcastTab gameState={gameState} />}
          {tab === 'leaderboard' && <LeaderboardTab leaders={leaders} />}
          {tab === 'settings' && <SettingsTab gameState={gameState} />}
        </div>
      </main>
    </div>
  );
}

// ── Overview Tab ──
function OverviewTab({ gameState, users, questions, submissions }) {
  const totalSubs = submissions.length;
  const correctSubs = submissions.filter((s) => s.isCorrect).length;
  const accuracy = totalSubs > 0 ? Math.round((correctSubs / totalSubs) * 100) : 0;

  const stats = [
    { label: 'Participants', value: users.length, icon: Users, color: 'text-[#4285F4] bg-[#4285F4]/15' },
    { label: 'Tasks', value: questions.length, icon: Terminal, color: 'text-[#34e534] bg-[#34A853]/15' },
    { label: 'Current Round', value: gameState?.currentRound || 0, icon: Play, color: 'text-[#FBBC05] bg-[#FBBC05]/15' },
    { label: 'Status', value: gameState?.status || 'N/A', icon: Trophy, color: 'text-[#EA4335] bg-[#EA4335]/15', isBadge: true },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#eeeeec] mb-6">Challenge Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon size={18} /></div>
              <div>
                <p className="text-xs text-[#ad7fa8] font-mono">{s.label}</p>
                {s.isBadge ? <StatusBadge status={s.value} /> : <p className="text-xl font-bold text-[#eeeeec]">{s.value}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <h3 className="font-semibold text-[#eeeeec] mb-3 text-sm font-mono">Submission Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-[#300a24] border border-[#5c3566]/30">
            <p className="text-2xl font-bold text-[#eeeeec] font-mono">{totalSubs}</p>
            <p className="text-xs text-[#888a85] font-mono">Total</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#300a24] border border-[#5c3566]/30">
            <p className="text-2xl font-bold text-[#34e534] font-mono">{correctSubs}</p>
            <p className="text-xs text-[#888a85] font-mono">Correct</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#300a24] border border-[#5c3566]/30">
            <p className="text-2xl font-bold text-[#FBBC05] font-mono">{accuracy}%</p>
            <p className="text-xs text-[#888a85] font-mono">Accuracy</p>
          </div>
        </div>
      </Card>
      <Card className="mt-6">
        <h3 className="font-semibold text-[#eeeeec] mb-3 text-sm font-mono">Recent Participants</h3>
        {users.length === 0 ? (
          <p className="text-sm text-[#888a85] font-mono">No participants have joined yet.</p>
        ) : (
          <div className="space-y-2">
            {users.slice(0, 10).map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#300a24] border border-[#5c3566]/30 text-sm">
                <span className="font-medium text-[#eeeeec]">{u.name}</span>
                <span className="text-[#ad7fa8] font-mono text-xs">{u.registerNumber}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Tasks Tab ──
const typeIcons = { command: Terminal, output: FileOutput, fix: Wrench };
const selectClass = "w-full px-4 py-2.5 rounded-lg border border-[#5c3566] bg-[#2d0922] text-[#eeeeec] focus:outline-none focus:ring-2 focus:ring-[#4285F4]/20 focus:border-[#4285F4] text-sm";

function TasksTab({ questions, submissions }) {
  const [form, setForm] = useState({
    questionText: '', correctAnswer: '', acceptableAnswers: '',
    questionType: 'command', round: 1, difficulty: 'medium',
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ questionText: '', correctAnswer: '', acceptableAnswers: '', questionType: 'command', round: 1, difficulty: 'medium' });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.questionText || !form.correctAnswer) return;
    setSaving(true);
    try {
      const acceptableArr = form.acceptableAnswers ? form.acceptableAnswers.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const data = {
        questionText: form.questionText, correctAnswer: form.correctAnswer,
        acceptableAnswers: acceptableArr, questionType: form.questionType,
        round: Number(form.round), difficulty: form.difficulty,
      };
      editingId ? await updateQuestion(editingId, data) : await addQuestion(data);
      resetForm();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleEdit = (q) => {
    setEditingId(q.id);
    setForm({
      questionText: q.questionText, correctAnswer: q.correctAnswer,
      acceptableAnswers: (q.acceptableAnswers || []).join(', '),
      questionType: q.questionType || 'command', round: q.round, difficulty: q.difficulty || 'medium',
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#eeeeec] mb-6">Task Management</h1>
      <Card className="mb-6">
        <h3 className="font-semibold text-[#eeeeec] mb-4 text-sm font-mono">{editingId ? 'Edit Task' : 'Create New Task'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-mono text-[#ad7fa8] uppercase tracking-wider">Task Type</label>
            <div className="grid grid-cols-3 gap-3">
              {QUESTION_TYPES.map((t) => {
                const Icon = typeIcons[t.value];
                const selected = form.questionType === t.value;
                return (
                  <button key={t.value} type="button" onClick={() => setForm({ ...form, questionType: t.value })}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${selected ? 'border-[#4285F4] bg-[#4285F4]/10' : 'border-[#5c3566] hover:border-[#ad7fa8] bg-[#300a24]'}`}>
                    <Icon size={16} className={selected ? 'text-[#4285F4]' : 'text-[#888a85]'} />
                    <p className={`text-sm font-medium mt-1 ${selected ? 'text-[#729fcf]' : 'text-[#eeeeec]'}`}>{t.label}</p>
                    <p className="text-xs text-[#888a85] mt-0.5">{t.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <Input label="Task Description" placeholder="e.g., List all files including hidden files" value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} />
          </div>
          <Input label="Expected Answer" placeholder="e.g., ls -a" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} />
          <Input label="Acceptable Answers (comma-separated)" placeholder='e.g., ls -a, ls -A' value={form.acceptableAnswers} onChange={(e) => setForm({ ...form, acceptableAnswers: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Round" type="number" min="1" value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} />
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#ad7fa8] uppercase tracking-wider">Difficulty</label>
              <select className={selectClass} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 font-mono">
            <Save size={14} />{saving ? 'Saving...' : editingId ? 'Update Task' : 'Create Task'}
          </Button>
          {editingId && <Button variant="ghost" onClick={resetForm} className="flex items-center gap-2"><X size={14} />Cancel</Button>}
        </div>
      </Card>
      <BulkUpload />
      <Card>
        <h3 className="font-semibold text-[#eeeeec] mb-4 text-sm font-mono">All Tasks ({questions.length})</h3>
        {questions.length === 0 ? (
          <p className="text-sm text-[#888a85] py-4 text-center font-mono">No tasks created yet.</p>
        ) : (
          <div className="space-y-2">
            {questions.map((q) => {
              const TypeIcon = typeIcons[q.questionType] || Terminal;
              const typeLabel = QUESTION_TYPES.find((t) => t.value === q.questionType)?.label || q.questionType;
              return (
                <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-[#300a24] border border-[#5c3566]/30 group">
                  <div className="flex items-start gap-3 flex-1 min-w-0 mr-4">
                    <div className="w-8 h-8 rounded-lg bg-[#3c1130] border border-[#5c3566] flex items-center justify-center shrink-0 mt-0.5">
                      <TypeIcon size={14} className="text-[#ad7fa8]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#eeeeec] truncate">{q.questionText}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#888a85] flex-wrap font-mono">
                        <span className="bg-[#4285F4]/15 text-[#729fcf] px-1.5 py-0.5 rounded">{typeLabel}</span>
                        <span>R{q.round}</span>
                        <span className="capitalize">{q.difficulty || 'medium'}</span>
                        <span>→ <code className="text-[#34e534]">{q.correctAnswer}</code></span>
                        {q.acceptableAnswers?.length > 0 && <span className="text-[#ad7fa8]">+{q.acceptableAnswers.length} alt</span>}
                        {(() => {
                          const qSubs = submissions.filter((s) => s.questionId === q.id);
                          const qCorrect = qSubs.filter((s) => s.isCorrect).length;
                          if (qSubs.length === 0) return null;
                          return (
                            <span className="flex items-center gap-1 text-[#888a85]">
                              <BarChart3 size={10} />
                              {qCorrect}/{qSubs.length} ({Math.round((qCorrect / qSubs.length) * 100)}%)
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(q)} className="p-2 hover:bg-[#3c1130] rounded-lg cursor-pointer" aria-label="Edit task"><Edit3 size={14} className="text-[#ad7fa8]" /></button>
                    <button onClick={() => { if (confirm('Delete this task?')) deleteQuestion(q.id); }} className="p-2 hover:bg-[#3c1130] rounded-lg cursor-pointer" aria-label="Delete task"><Trash2 size={14} className="text-[#EA4335]" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Bulk Upload ──
const SAMPLE_JSON = `[
  {
    "questionText": "List all files including hidden files",
    "correctAnswer": "ls -a",
    "acceptableAnswers": ["ls -A", "ls --all"],
    "questionType": "command",
    "difficulty": "easy"
  },
  {
    "questionText": "What does the pwd command display?",
    "correctAnswer": "current working directory",
    "acceptableAnswers": ["present working directory"],
    "questionType": "output",
    "difficulty": "easy"
  },
  {
    "questionText": "Fix this command: ls - l",
    "correctAnswer": "ls -l",
    "acceptableAnswers": [],
    "questionType": "fix",
    "difficulty": "medium"
  }
]`;

function BulkUpload() {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [round, setRound] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // { success: number, errors: string[] }
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonText(ev.target.result);
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!jsonText.trim()) return;
    setUploading(true);
    setResult(null);

    try {
      let tasks;
      try {
        tasks = JSON.parse(jsonText);
      } catch {
        setResult({ success: 0, errors: ['Invalid JSON. Please check your format.'] });
        setUploading(false);
        return;
      }

      if (!Array.isArray(tasks)) {
        setResult({ success: 0, errors: ['JSON must be an array of task objects.'] });
        setUploading(false);
        return;
      }

      const errors = [];
      let success = 0;

      for (let i = 0; i < tasks.length; i++) {
        const t = tasks[i];
        if (!t.questionText || !t.correctAnswer) {
          errors.push(`Task ${i + 1}: missing questionText or correctAnswer`);
          continue;
        }

        const validTypes = ['command', 'output', 'fix'];
        const data = {
          questionText: String(t.questionText),
          correctAnswer: String(t.correctAnswer),
          acceptableAnswers: Array.isArray(t.acceptableAnswers) ? t.acceptableAnswers.map(String) : [],
          questionType: validTypes.includes(t.questionType) ? t.questionType : 'command',
          round: Number(round),
          difficulty: ['easy', 'medium', 'hard'].includes(t.difficulty) ? t.difficulty : 'medium',
        };

        try {
          await addQuestion(data);
          success++;
        } catch (err) {
          errors.push(`Task ${i + 1}: failed to save — ${err.message}`);
        }
      }

      setResult({ success, errors });
      if (success > 0 && errors.length === 0) {
        setJsonText('');
      }
    } catch (err) {
      setResult({ success: 0, errors: [err.message] });
    } finally {
      setUploading(false);
    }
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(SAMPLE_JSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) {
    return (
      <Card className="mb-6">
        <button onClick={() => setOpen(true)} className="w-full flex items-center justify-center gap-2 text-sm text-[#729fcf] font-mono hover:text-[#97c4f0] cursor-pointer py-1 transition-colors">
          <Upload size={14} />
          Bulk Upload Tasks (JSON)
        </button>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#eeeeec] text-sm font-mono flex items-center gap-2">
          <Upload size={14} className="text-[#4285F4]" />
          Bulk Upload Tasks
        </h3>
        <button onClick={() => { setOpen(false); setResult(null); }} className="p-1 hover:bg-[#5c3566]/30 rounded cursor-pointer text-[#ad7fa8]">
          <X size={14} />
        </button>
      </div>

      {/* Round selector */}
      <div className="mb-4 max-w-xs">
        <Input label="Target Round (all tasks will be assigned to this round)" type="number" min="1" value={round} onChange={(e) => setRound(e.target.value)} />
      </div>

      {/* Template */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-mono text-[#ad7fa8] uppercase tracking-wider">JSON Format</label>
          <button onClick={copyTemplate} className="flex items-center gap-1 text-xs font-mono text-[#729fcf] hover:text-[#97c4f0] cursor-pointer transition-colors">
            {copied ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy Template</>}
          </button>
        </div>
        <pre className="bg-[#300a24] border border-[#5c3566]/40 rounded-lg p-3 text-xs font-mono text-[#888a85] overflow-x-auto max-h-36 overflow-y-auto">
          {SAMPLE_JSON}
        </pre>
      </div>

      {/* Input methods */}
      <div className="space-y-3 mb-4">
        {/* File upload */}
        <div>
          <label className="block text-xs font-mono text-[#ad7fa8] uppercase tracking-wider mb-1.5">Upload JSON File</label>
          <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-[#5c3566] bg-[#300a24] hover:border-[#ad7fa8] cursor-pointer transition-colors">
            <FileJson size={16} className="text-[#888a85]" />
            <span className="text-sm font-mono text-[#888a85]">Choose .json file</span>
            <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Or paste */}
        <div>
          <label className="block text-xs font-mono text-[#ad7fa8] uppercase tracking-wider mb-1.5">Or Paste JSON</label>
          <textarea
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); setResult(null); }}
            placeholder='[{"questionText": "...", "correctAnswer": "...", "questionType": "command"}]'
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-[#5c3566] bg-[#2d0922] text-[#eeeeec] placeholder-[#888a85]/40 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#4285F4]/20 focus:border-[#4285F4] resize-y"
          />
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`mb-4 p-3 rounded-lg border font-mono text-xs ${
          result.errors.length === 0
            ? 'bg-[#34A853]/10 border-[#34A853]/30 text-[#34e534]'
            : result.success > 0
              ? 'bg-[#FBBC05]/10 border-[#FBBC05]/30 text-[#FBBC05]'
              : 'bg-[#EA4335]/10 border-[#EA4335]/30 text-[#EA4335]'
        }`}>
          {result.success > 0 && (
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle size={12} />
              {result.success} task{result.success !== 1 ? 's' : ''} uploaded successfully to Round {round}
            </div>
          )}
          {result.errors.map((err, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <AlertCircle size={12} className="shrink-0 mt-0.5" />
              {err}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <Button onClick={handleUpload} disabled={uploading || !jsonText.trim()} className="flex items-center gap-2 font-mono">
        <Upload size={14} />
        {uploading ? 'Uploading...' : `Upload to Round ${round}`}
      </Button>
    </Card>
  );
}

// ── Rounds Tab ──
function RoundsTab({ gameState, questions }) {
  const [timerDuration, setTimerDuration] = useState(300);
  const [updating, setUpdating] = useState(false);
  const roundTasks = questions.filter((q) => q.round === gameState?.currentRound);

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
            roundDuration: timerDuration,
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
            roundDuration: timerDuration,
          });
          break;
        case 'next_task':
          await updateGameState({ currentQuestionIndex: (gameState?.currentQuestionIndex || 0) + 1 });
          break;
        case 'end_challenge':
          await updateGameState({ status: 'challenge_ended', roundEndTime: null });
          break;
        case 'reset':
          await updateGameState({
            status: 'waiting', currentRound: 0, currentQuestionIndex: 0, roundEndTime: null,
            roundDuration: 300,
            // Preserve dynamic config
            challengeName: gameState?.challengeName || DEFAULT_CONFIG.challengeName,
            challengeTagline: gameState?.challengeTagline || DEFAULT_CONFIG.challengeTagline,
            basePoints: gameState?.basePoints || DEFAULT_CONFIG.basePoints,
            maxSpeedBonus: gameState?.maxSpeedBonus || DEFAULT_CONFIG.maxSpeedBonus,
            hintCost: gameState?.hintCost || DEFAULT_CONFIG.hintCost,
            activityFeedLimit: gameState?.activityFeedLimit || DEFAULT_CONFIG.activityFeedLimit,
          });
          break;
      }
    } catch (err) { console.error(err); }
    finally { setUpdating(false); }
  };

  const isActive = gameState?.status === 'round_active';

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#eeeeec] mb-6">Round Control</h1>
      {/* Scoring info */}
      <Card className="mb-6">
        <h3 className="font-semibold text-[#eeeeec] mb-2 text-sm font-mono">⚡ Time-Based Scoring</h3>
        <p className="text-xs text-[#ad7fa8] font-mono leading-relaxed">
          Points = {gameState?.basePoints || DEFAULT_CONFIG.basePoints} (base) + up to {gameState?.maxSpeedBonus || DEFAULT_CONFIG.maxSpeedBonus} (speed bonus). Faster answers earn more points. Max {(gameState?.basePoints || DEFAULT_CONFIG.basePoints) + (gameState?.maxSpeedBonus || DEFAULT_CONFIG.maxSpeedBonus)} pts per task. Hint cost: {gameState?.hintCost || DEFAULT_CONFIG.hintCost} pts.
        </p>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-[#eeeeec] mb-4 text-sm font-mono">Current State</h3>
          <div className="space-y-3 mb-6">
            {[
              ['Status', <StatusBadge key="s" status={gameState?.status} />],
              ['Round', gameState?.currentRound || 0],
              ['Task Index', (gameState?.currentQuestionIndex || 0) + 1],
              ['Tasks in Round', roundTasks.length],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span className="text-[#ad7fa8] font-mono">{label}</span>
                {typeof val === 'object' ? val : <span className="font-bold text-[#eeeeec] font-mono">{val}</span>}
              </div>
            ))}
          </div>
          <Input label="Timer Duration (seconds)" type="number" min="30" value={timerDuration} onChange={(e) => setTimerDuration(Number(e.target.value))} />
        </Card>
        <Card>
          <h3 className="font-semibold text-[#eeeeec] mb-4 text-sm font-mono">Controls</h3>
          <div className="space-y-3">
            {!isActive && gameState?.status !== 'challenge_ended' && (
              <Button onClick={() => handleAction('start')} disabled={updating} className="w-full flex items-center justify-center gap-2 font-mono">
                <Play size={16} />Start Round {(gameState?.currentRound || 0) + 1}
              </Button>
            )}
            {isActive && (
              <>
                <Button variant="danger" onClick={() => handleAction('stop')} disabled={updating} className="w-full flex items-center justify-center gap-2 font-mono">
                  <Square size={16} />End Current Round
                </Button>
                <Button variant="warning" onClick={() => handleAction('next_task')} disabled={updating} className="w-full flex items-center justify-center gap-2 font-mono">
                  <SkipForward size={16} />Next Task
                </Button>
              </>
            )}
            {gameState?.status === 'round_ended' && (
              <Button variant="success" onClick={() => handleAction('next_round')} disabled={updating} className="w-full flex items-center justify-center gap-2 font-mono">
                <SkipForward size={16} />Start Next Round
              </Button>
            )}
            <hr className="border-[#5c3566]" />
            <Button variant="ghost" onClick={() => handleAction('end_challenge')} disabled={updating} className="w-full font-mono">End Challenge</Button>
            <Button variant="ghost" onClick={() => handleAction('reset')} disabled={updating} className="w-full font-mono text-[#EA4335]">Reset Everything</Button>
          </div>
        </Card>
      </div>
      <Card className="mt-6">
        <h3 className="font-semibold text-[#eeeeec] mb-4 text-sm font-mono">Quick Status</h3>
        <div className="flex flex-wrap gap-2">
          {['waiting', 'round_active', 'round_ended', 'challenge_ended'].map((s) => (
            <Button key={s} variant={gameState?.status === s ? 'primary' : 'ghost'} onClick={() => updateGameState({ status: s })} className="text-xs font-mono">
              {s.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Broadcast Tab ──
function BroadcastTab({ gameState }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await sendBroadcast(message.trim());
      setMessage('');
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const handleClear = async () => {
    await clearBroadcast();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#eeeeec] mb-6">Broadcast Message</h1>
      <Card className="mb-6">
        <h3 className="font-semibold text-[#eeeeec] mb-4 text-sm font-mono flex items-center gap-2">
          <Megaphone size={14} className="text-[#FBBC05]" />
          Send to All Participants
        </h3>
        <p className="text-xs text-[#888a85] font-mono mb-4">
          This message will appear as a banner on every participant's screen in real-time.
        </p>
        <div className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., Round 2 starts in 30 seconds! Get ready..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-[#5c3566] bg-[#2d0922] text-[#eeeeec] placeholder-[#888a85]/40 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#FBBC05]/20 focus:border-[#FBBC05] resize-y"
          />
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={sending || !message.trim()} className="flex items-center gap-2 font-mono">
              <Megaphone size={14} />
              {sending ? 'Sending...' : 'Broadcast'}
            </Button>
            {gameState?.broadcastMessage && (
              <Button variant="ghost" onClick={handleClear} className="flex items-center gap-2 font-mono">
                <X size={14} />
                Clear Current
              </Button>
            )}
          </div>
        </div>
      </Card>
      {gameState?.broadcastMessage && (
        <Card>
          <h3 className="font-semibold text-[#eeeeec] mb-3 text-sm font-mono">Current Broadcast</h3>
          <div className="bg-[#FBBC05]/10 border border-[#FBBC05]/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <Megaphone size={16} className="text-[#FBBC05] shrink-0" />
            <p className="text-sm font-mono text-[#FBBC05]">{gameState.broadcastMessage}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Leaderboard Tab (Admin) ──
function LeaderboardTab({ leaders }) {
  const exportCSV = () => {
    const headers = ['Rank', 'Name', 'Register Number', 'Score', 'Streak'];
    const rows = leaders.map((u) => [u.rank, u.name, u.registerNumber || '', u.score || 0, u.streak || 0]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#eeeeec]">Leaderboard</h1>
        {leaders.length > 0 && (
          <Button variant="ghost" onClick={exportCSV} className="flex items-center gap-2 font-mono text-xs">
            <Download size={14} />
            Export CSV
          </Button>
        )}
      </div>
      <Card>
        {leaders.length === 0 ? (
          <p className="text-sm text-[#888a85] py-8 text-center font-mono">No participants yet.</p>
        ) : (
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-[#5c3566]/50">
                <th className="text-left py-3 px-3 text-[#ad7fa8] font-mono font-medium text-xs">#</th>
                <th className="text-left py-3 px-3 text-[#ad7fa8] font-mono font-medium text-xs">PARTICIPANT</th>
                <th className="text-left py-3 px-3 text-[#ad7fa8] font-mono font-medium text-xs">ID</th>
                <th className="text-left py-3 px-3 text-[#ad7fa8] font-mono font-medium text-xs">STREAK</th>
                <th className="text-right py-3 px-3 text-[#ad7fa8] font-mono font-medium text-xs">SCORE</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((u) => (
                <tr key={u.id} className="border-b border-[#5c3566]/20 hover:bg-[#300a24]">
                  <td className="py-3 px-3 font-mono">
                    {u.rank <= 3 ? (
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                        u.rank === 1 ? 'bg-[#FBBC05]/20 text-[#FBBC05]' : u.rank === 2 ? 'bg-[#888a85]/20 text-[#eeeeec]' : 'bg-[#EA4335]/15 text-[#EA4335]'
                      }`}>{u.rank}</span>
                    ) : <span className="text-[#888a85] pl-1.5">{u.rank}</span>}
                  </td>
                  <td className="py-3 px-3 font-medium text-[#eeeeec]">{u.name}</td>
                  <td className="py-3 px-3 text-[#ad7fa8] font-mono text-xs">{u.registerNumber || '—'}</td>
                  <td className="py-3 px-3 font-mono text-sm">
                    {(u.streak || 0) > 0 ? <span className="text-[#FBBC05]">🔥{u.streak}</span> : <span className="text-[#888a85]">—</span>}
                  </td>
                  <td className="py-3 px-3 text-right font-bold font-mono text-[#34e534]">{u.score || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ── Settings Tab ──
// Empty string / empty = use default. Admin only overrides if they type something.
function SettingsTab({ gameState }) {
  const [config, setConfig] = useState({
    challengeName: '',
    challengeTagline: '',
    basePoints: '',
    maxSpeedBonus: '',
    hintCost: '',
    activityFeedLimit: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing overrides from gameState (only if they differ from defaults)
  useEffect(() => {
    if (gameState) {
      setConfig({
        challengeName: gameState.challengeName && gameState.challengeName !== DEFAULT_CONFIG.challengeName ? gameState.challengeName : '',
        challengeTagline: gameState.challengeTagline && gameState.challengeTagline !== DEFAULT_CONFIG.challengeTagline ? gameState.challengeTagline : '',
        basePoints: gameState.basePoints && gameState.basePoints !== DEFAULT_CONFIG.basePoints ? String(gameState.basePoints) : '',
        maxSpeedBonus: gameState.maxSpeedBonus && gameState.maxSpeedBonus !== DEFAULT_CONFIG.maxSpeedBonus ? String(gameState.maxSpeedBonus) : '',
        hintCost: gameState.hintCost && gameState.hintCost !== DEFAULT_CONFIG.hintCost ? String(gameState.hintCost) : '',
        activityFeedLimit: gameState.activityFeedLimit && gameState.activityFeedLimit !== DEFAULT_CONFIG.activityFeedLimit ? String(gameState.activityFeedLimit) : '',
      });
    }
  }, [gameState]);

  // Resolve: use admin value if provided, otherwise default
  const resolved = {
    challengeName: config.challengeName.trim() || DEFAULT_CONFIG.challengeName,
    challengeTagline: config.challengeTagline.trim() || DEFAULT_CONFIG.challengeTagline,
    basePoints: config.basePoints !== '' ? Number(config.basePoints) : DEFAULT_CONFIG.basePoints,
    maxSpeedBonus: config.maxSpeedBonus !== '' ? Number(config.maxSpeedBonus) : DEFAULT_CONFIG.maxSpeedBonus,
    hintCost: config.hintCost !== '' ? Number(config.hintCost) : DEFAULT_CONFIG.hintCost,
    activityFeedLimit: config.activityFeedLimit !== '' ? Number(config.activityFeedLimit) : DEFAULT_CONFIG.activityFeedLimit,
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateGameState(resolved);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    setConfig({ challengeName: '', challengeTagline: '', basePoints: '', maxSpeedBonus: '', hintCost: '', activityFeedLimit: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#eeeeec] mb-6">Challenge Settings</h1>
      <p className="text-xs text-[#888a85] font-mono mb-6">Leave fields empty to use defaults. Only fill in what you want to override.</p>
      <Card className="mb-6">
        <h3 className="font-semibold text-[#eeeeec] mb-4 text-sm font-mono flex items-center gap-2">
          <Settings size={14} className="text-[#4285F4]" />
          Branding
        </h3>
        <div className="space-y-4">
          <Input label="Challenge Name" value={config.challengeName} onChange={(e) => setConfig({ ...config, challengeName: e.target.value })} placeholder={`Default: ${DEFAULT_CONFIG.challengeName}`} />
          <Input label="Challenge Tagline" value={config.challengeTagline} onChange={(e) => setConfig({ ...config, challengeTagline: e.target.value })} placeholder={`Default: ${DEFAULT_CONFIG.challengeTagline}`} />
        </div>
      </Card>
      <Card className="mb-6">
        <h3 className="font-semibold text-[#eeeeec] mb-4 text-sm font-mono flex items-center gap-2">
          <Trophy size={14} className="text-[#FBBC05]" />
          Scoring
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Base Points (per correct answer)" type="number" min="1" value={config.basePoints} onChange={(e) => setConfig({ ...config, basePoints: e.target.value })} placeholder={`Default: ${DEFAULT_CONFIG.basePoints}`} />
          <Input label="Max Speed Bonus" type="number" min="0" value={config.maxSpeedBonus} onChange={(e) => setConfig({ ...config, maxSpeedBonus: e.target.value })} placeholder={`Default: ${DEFAULT_CONFIG.maxSpeedBonus}`} />
          <Input label="Hint Cost (points deducted)" type="number" min="0" value={config.hintCost} onChange={(e) => setConfig({ ...config, hintCost: e.target.value })} placeholder={`Default: ${DEFAULT_CONFIG.hintCost}`} />
          <Input label="Activity Feed Limit" type="number" min="5" value={config.activityFeedLimit} onChange={(e) => setConfig({ ...config, activityFeedLimit: e.target.value })} placeholder={`Default: ${DEFAULT_CONFIG.activityFeedLimit}`} />
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[#300a24] border border-[#5c3566]/30">
          <p className="text-xs text-[#ad7fa8] font-mono mb-1">Active scoring:</p>
          <p className="text-xs text-[#eeeeec] font-mono">
            Points = {resolved.basePoints} (base) + up to {resolved.maxSpeedBonus} (speed bonus) = max {resolved.basePoints + resolved.maxSpeedBonus} pts · Hint cost: {resolved.hintCost} pts
          </p>
        </div>
      </Card>
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 font-mono">
          <Save size={14} />
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Settings'}
        </Button>
        <Button variant="ghost" onClick={handleReset} className="font-mono">Clear All (Use Defaults)</Button>
      </div>
    </div>
  );
}
