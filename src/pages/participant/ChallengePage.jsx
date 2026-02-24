import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  getQuestionsForRound, submitAnswer,
  getUserSubmissionForQuestion, getUser, updateUserScore, useHint
} from '../../services/firestore';
import { validateAnswer, generateHint } from '../../services/validation';
import { calculatePoints, formatPoints, DEFAULT_CONFIG } from '../../services/scoring';
import UbuntuTerminal, { TerminalPrompt, TerminalOutput } from '../../components/UbuntuTerminal';
import Confetti from '../../components/Confetti';
import Timer from '../../components/Timer';
import StatusBadge from '../../components/StatusBadge';
import { playCorrectSound, playIncorrectSound, playStreakSound } from '../../hooks/useSound';

const typeLabels = { command: 'Command Task', output: 'Output Challenge', fix: 'Fix the Command' };
const placeholders = {
  command: 'type your command here...',
  fix: 'type the corrected command...',
  output: 'type your answer...',
};

const diffColors = {
  easy: 'bg-[#34A853]/15 text-[#34e534] border-[#34A853]/30',
  medium: 'bg-[#FBBC05]/15 text-[#FBBC05] border-[#FBBC05]/30',
  hard: 'bg-[#EA4335]/15 text-[#EA4335] border-[#EA4335]/30',
};

export default function ChallengePage() {
  const { gameState, userName, userId, streak, setStreak, soundEnabled } = useOutletContext();
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFirstSolver, setIsFirstSolver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintText, setHintText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameState?.status === 'waiting') navigate('/lobby');
    if (gameState?.status === 'challenge_ended') navigate('/leaderboard');
    if (gameState?.currentQuestionIndex !== undefined) setCurrentQIdx(gameState.currentQuestionIndex);
  }, [gameState, navigate]);

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
      setEarnedPoints(existing.pointsEarned || 0);
      setIsFirstSolver(existing.isFirstSolver || false);
    } else {
      setSubmitted(false);
      setResult(null);
      setAnswer('');
      setEarnedPoints(0);
      setIsFirstSolver(false);
      setHintUsed(false);
      setHintText('');
    }
  }, [questions, currentQIdx, userId]);

  useEffect(() => { checkAlreadySubmitted(); }, [checkAlreadySubmitted]);

  // Typewriter effect for task text
  const currentTask = questions[currentQIdx];
  useEffect(() => {
    if (!currentTask?.questionText) return;
    setTypedText('');
    setIsTyping(true);
    const text = currentTask.questionText;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setTypedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [currentTask?.questionText, currentQIdx]);

  const isRoundActive = gameState?.status === 'round_active';

  const hintCost = gameState?.hintCost || DEFAULT_CONFIG.hintCost;

  const handleHint = async () => {
    if (hintUsed || !currentTask || submitted) return;
    const success = await useHint(userId, currentTask.id, hintCost);
    if (success) {
      setHintUsed(true);
      setHintText(generateHint(currentTask.correctAnswer));
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim() || !currentTask || submitted) return;
    setSubmitting(true);
    try {
      const isCorrect = validateAnswer(answer, currentTask.correctAnswer, currentTask.acceptableAnswers);
      const roundDuration = gameState?.roundDuration || 300;
      const scoringConfig = { basePoints: gameState?.basePoints, maxSpeedBonus: gameState?.maxSpeedBonus };
      const points = isCorrect ? calculatePoints(gameState?.roundEndTime, roundDuration, scoringConfig) : 0;

      const { isFirstSolver: firstSolver } = await submitAnswer({
        userId, questionId: currentTask.id, answer: answer.trim(),
        isCorrect, pointsEarned: points, userName,
      });

      if (isCorrect) {
        const user = await getUser(userId);
        const newStreak = (user?.streak || 0) + 1;
        if (user) await updateUserScore(userId, (user.score || 0) + points, newStreak);
        setStreak(newStreak);
        setIsFirstSolver(firstSolver);
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 600);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
        if (soundEnabled) {
          if (newStreak >= 3) playStreakSound(newStreak);
          else playCorrectSound();
        }
      } else {
        await updateUserScore(userId, undefined, 0);
        setStreak(0);
        if (soundEnabled) playIncorrectSound();
      }

      setSubmitted(true);
      setResult(isCorrect ? 'correct' : 'incorrect');
      setEarnedPoints(points);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (!currentTask) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold text-[#eeeeec] mb-6 font-mono">Challenge</h1>
        <UbuntuTerminal title={`${userName}@linux-challenge: ~`}>
          <TerminalPrompt user={userName} path="~">challenge --load-task</TerminalPrompt>
          <TerminalOutput color="text-[#FBBC05]">
            {gameState?.status === 'round_ended' ? 'Round complete. Awaiting next round...' : 'No tasks available for this round.'}
          </TerminalOutput>
          {gameState && <div className="mt-2"><StatusBadge status={gameState.status} /></div>}
        </UbuntuTerminal>
      </div>
    );
  }

  const taskType = typeLabels[currentTask.questionType] || 'Task';
  const placeholder = placeholders[currentTask.questionType] || 'type your answer...';
  const pointsInfo = earnedPoints > 0 ? formatPoints(earnedPoints, { basePoints: gameState?.basePoints, maxSpeedBonus: gameState?.maxSpeedBonus }) : null;
  const difficulty = currentTask.difficulty || 'medium';

  return (
    <div className="max-w-2xl mx-auto animate-fade-in relative">
      <Confetti active={showConfetti} />
      {showFlash && (
        <div className="fixed inset-0 bg-[#34e534]/5 pointer-events-none z-50 animate-flash" />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={gameState?.status} />
          <span className="text-sm text-[#ad7fa8] font-mono">
            Round {gameState?.currentRound} · Task {currentQIdx + 1}/{questions.length}
          </span>
          {/* Difficulty badge */}
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${diffColors[difficulty]}`}>
            {difficulty}
          </span>
        </div>
        {gameState?.roundEndTime && <Timer endTime={gameState.roundEndTime} />}
      </div>

      {/* Terminal */}
      <UbuntuTerminal title={`${userName}@linux-challenge: ~/round-${gameState?.currentRound}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#4285F4]/20 text-[#729fcf] border border-[#4285F4]/30">{taskType}</span>
          <span className="text-xs font-mono text-[#888a85]">task-{currentQIdx + 1}</span>
        </div>

        <TerminalPrompt user={userName} path={`~/round-${gameState?.currentRound}`}>cat task.txt</TerminalPrompt>
        <div className="mt-2 mb-4 bg-[#2d0922] rounded-lg p-4 border border-[#5c3566]/40">
          <p className="text-[#eeeeec] text-lg leading-relaxed">
            {typedText}
            {isTyping && <span className="text-[#34e534] animate-pulse-slow">█</span>}
          </p>
        </div>

        {/* Hint section */}
        {!submitted && isRoundActive && (
          <div className="mb-3">
            {!hintUsed ? (
              <button
                onClick={handleHint}
                className="text-xs font-mono text-[#888a85] hover:text-[#ad7fa8] cursor-pointer transition-colors"
              >
                $ man --hint (-{hintCost} pts)
              </button>
            ) : (
              <div className="text-xs font-mono">
                <TerminalPrompt user={userName} path={`~/round-${gameState?.currentRound}`}>man --hint</TerminalPrompt>
                <TerminalOutput color="text-[#ad7fa8]">Hint: {hintText}</TerminalOutput>
                <TerminalOutput color="text-[#888a85]">(-{hintCost} pts deducted)</TerminalOutput>
              </div>
            )}
          </div>
        )}

        <TerminalPrompt user={userName} path={`~/round-${gameState?.currentRound}`}>
          {submitted ? (
            <span className="text-[#eeeeec]">{answer}</span>
          ) : (
            <input
              type="text" value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              disabled={!isRoundActive || submitted}
              placeholder={placeholder}
              className="bg-transparent text-[#34e534] font-mono text-sm placeholder-[#888a85]/40 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed caret-[#34e534] w-full"
              autoComplete="off" spellCheck="false" autoFocus
            />
          )}
        </TerminalPrompt>

        {submitted && result === 'correct' && (
          <div className="mt-2 space-y-0.5">
            <TerminalOutput color="text-[#34e534]">✓ Task completed successfully. {pointsInfo?.text}</TerminalOutput>
            {isFirstSolver && (
              <TerminalOutput color="text-[#FBBC05]">⚡ First to solve! Speed demon.</TerminalOutput>
            )}
            {streak > 1 && (
              <TerminalOutput color="text-[#FBBC05]">🔥 {streak} correct in a row!</TerminalOutput>
            )}
            <TerminalOutput color="text-[#888a85]">[Process exited with code 0]</TerminalOutput>
          </div>
        )}

        {submitted && result === 'incorrect' && (
          <div className="mt-2 space-y-0.5">
            <TerminalOutput color="text-[#eeeeec]">bash: {answer}: command not found</TerminalOutput>
            <TerminalOutput color="text-[#EA4335]">-bash: task failed: invalid command or incorrect output</TerminalOutput>
            <TerminalOutput color="text-[#888a85]">[Process exited with code 127]</TerminalOutput>
          </div>
        )}

        {!submitted && isRoundActive && answer.trim() && (
          <TerminalOutput color="text-[#888a85]">Press Enter to execute</TerminalOutput>
        )}

        {!submitted && !answer && !isTyping && (
          <div className="mt-1"><span className="text-[#34e534] animate-pulse-slow font-mono">█</span></div>
        )}
      </UbuntuTerminal>

      {!submitted && (
        <div className="mt-4">
          <button onClick={handleSubmit} disabled={!isRoundActive || submitting || !answer.trim()}
            className="w-full py-3 rounded-lg bg-[#34A853] hover:bg-[#2d9249] text-white font-mono text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            {submitting ? 'Executing...' : '$ submit --answer'}
          </button>
        </div>
      )}
    </div>
  );
}
