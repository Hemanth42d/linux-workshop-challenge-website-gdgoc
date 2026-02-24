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
  { value: 'command', label: 'Command Writing', description: 'User types the correct Linux command' },
  { value: 'output', label: 'Output Prediction', description: 'User predicts command output or explanation' },
  { value: 'fix', label: 'Fix the Command', description: 'User corrects an incorrect command' },
];
