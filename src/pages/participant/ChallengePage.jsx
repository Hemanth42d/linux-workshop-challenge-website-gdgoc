import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  subscribeGameState, getQuestionsForRound, submitAnswer,
  getUserSubmissionForQuestion, getUser, updateUserScore
} from '../../services/firestore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Timer from '../../components/Timer';
import StatusBadge from '../../components/StatusBadge';
import { Send, CheckCircle, XCircle, Terminal } from 'lucide-react';

export default function ChallengePage() {
  const [gameState, setGameState] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('workshopUserId');

  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    const unsub = subscribeGameState((state) => {
      setGameState(state);
      if (state?.status === 'waiting') navigate('/lobby');
      if (state?.status === 'challenge_ended') navigate('/leaderboard');
      if (state?.currentQuestionIndex !== undefined) setCurrentQIdx(state.currentQuestionIndex);
    });
    return unsub;
  }, [navigate, userId]);

  useEffect(() => {
    if (!gameState?.currentRound) return;
    getQuestionsForRound(gameState.currentRound).then(setQuestions);
  }, [gameState?.currentRound]);

  const checkAlreadySubmitted = useCallback(async () => {
    const q = questions[currentQIdx];
    if (!q) return;
    const existing = await getUserSubmissionForQuestion(userId, q.id);
    if (existing) {
      setSubmitted(true);
      setResult(existing.isCorrect ? 'correct' : 'incorrect');
    } else {
      setSubmitted(false);
      setResult(null);
      setAnswer('');
    }
  }, [questions, currentQIdx, userId]);

  useEffect(() => { checkAlreadySubmitted(); }, [checkAlreadySubmitted]);

  const currentQuestion = questions[currentQIdx];
  const isRoundActive = gameState?.status === 'round_active';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || !currentQuestion || submitted) return;
    setSubmitting(true);
    try {
      const isCorrect = answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
      await submitAnswer({
        userId,
        questionId: currentQuestion.id,
        answer: answer.trim(),
        isCorrect,
        userName: localStorage.getItem('workshopUserName') || 'Unknown',
      });
      if (isCorrect) {
        const user = await getUser(userId);
        if (user) await updateUserScore(userId, (user.score || 0) + 10);
      }
      setSubmitted(true);
      setResult(isCorrect ? 'correct' : 'incorrect');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <Card className="text-center max-w-md w-full">
          <Terminal className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">
            {gameState?.status === 'round_ended' ? 'Round has ended. Waiting for next round...' : 'No questions available for this round yet.'}
          </p>
          {gameState && <div className="mt-3"><StatusBadge status={gameState.status} /></div>}
          <button onClick={() => navigate('/leaderboard')} className="mt-4 text-sm text-[#4285F4] hover:underline cursor-pointer">View Leaderboard</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-2xl mx-auto pt-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <StatusBadge status={gameState?.status} />
            <span className="text-sm text-gray-500">Round {gameState?.currentRound} · Q{currentQIdx + 1}/{questions.length}</span>
          </div>
          {gameState?.roundEndTime && <Timer endTime={gameState.roundEndTime} />}
        </div>
        <Card className="mb-4">
          <div className="mb-1 text-xs font-semibold text-[#4285F4] uppercase tracking-wide">Question {currentQIdx + 1}</div>
          <p className="text-lg font-medium text-gray-900 mb-6">{currentQuestion.questionText}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Type your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={!isRoundActive || submitted}
            />
            {!submitted ? (
              <Button type="submit" disabled={!isRoundActive || submitting || !answer.trim()} className="w-full flex items-center justify-center gap-2">
                {submitting ? 'Submitting...' : <><Send size={16} /><span>Submit Answer</span></>}
              </Button>
            ) : (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${result === 'correct' ? 'bg-green-50 text-[#34A853]' : 'bg-red-50 text-[#EA4335]'}`}>
                {result === 'correct' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                {result === 'correct' ? 'Correct! +10 points' : 'Incorrect. Better luck next time!'}
              </div>
            )}
          </form>
        </Card>
        <div className="text-center">
          <button onClick={() => navigate('/leaderboard')} className="text-sm text-[#4285F4] hover:underline cursor-pointer">View Leaderboard</button>
        </div>
      </div>
    </div>
  );
}
