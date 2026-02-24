/**
 * Normalize an answer string: trim, lowercase, collapse multiple spaces.
 */
const normalize = (str) => str.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Validate a user's answer against correctAnswer and optional acceptableAnswers.
 * - Ignores leading/trailing whitespace
 * - Ignores multiple spaces between words
 * - Case-insensitive
 */
export function validateAnswer(userAnswer, correctAnswer, acceptableAnswers = []) {
  const normalized = normalize(userAnswer);
  if (normalized === normalize(correctAnswer)) return true;
  if (Array.isArray(acceptableAnswers) && acceptableAnswers.length > 0) {
    return acceptableAnswers.some((a) => normalize(a) === normalized);
  }
  return false;
}

export const QUESTION_TYPES = [
  { value: 'command', label: 'Command Task', description: 'Participant types the correct Linux command' },
  { value: 'output', label: 'Output Challenge', description: 'Participant predicts command output' },
  { value: 'fix', label: 'Fix the Command', description: 'Participant corrects a broken command' },
];

/**
 * Generate a hint from the correct answer.
 * Shows first char + underscores for the rest, preserving spaces.
 * e.g., "ls -la" → "l_ -__"
 */
export function generateHint(correctAnswer) {
  if (!correctAnswer) return 'No hint available';
  return correctAnswer
    .split('')
    .map((ch, i) => {
      if (ch === ' ' || ch === '-' || ch === '/') return ch;
      if (i === 0) return ch;
      return '_';
    })
    .join('');
}
