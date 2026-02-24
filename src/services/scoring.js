/**
 * Time-based scoring system.
 * 
 * Points = BASE + SPEED_BONUS
 * - BASE: 5 points for a correct answer
 * - SPEED_BONUS: up to 15 extra points based on how fast you answered
 * - Max possible: 20 points (answered instantly)
 * - Min possible: 5 points (answered at the very end)
 * 
 * Formula: 5 + floor(15 * (timeRemaining / totalRoundTime))
 * 
 * This rewards fast answers fairly — someone who answers in the first 10%
 * of the round gets ~18-20 pts, someone at 50% gets ~12 pts, and someone
 * at the last second still gets the base 5 pts.
 */

// ── Scoring config (stored in gameState, with defaults) ──
export const DEFAULT_CONFIG = {
  basePoints: 5,
  maxSpeedBonus: 15,
  hintCost: 3,
  activityFeedLimit: 30,
  challengeName: 'Linux Challenge',
  challengeTagline: 'Real-time command challenge platform',
};

export function calculatePoints(roundEndTime, totalDurationSeconds, config = {}) {
  const basePoints = config.basePoints || DEFAULT_CONFIG.basePoints;
  const maxSpeedBonus = config.maxSpeedBonus || DEFAULT_CONFIG.maxSpeedBonus;

  if (!roundEndTime || !totalDurationSeconds) return basePoints;

  const now = Date.now();
  const remainingMs = Math.max(0, roundEndTime - now);
  const totalMs = totalDurationSeconds * 1000;
  const ratio = Math.min(1, remainingMs / totalMs);

  return basePoints + Math.floor(maxSpeedBonus * ratio);
}

/**
 * Format points earned for display.
 */
export function formatPoints(points, config = {}) {
  const maxPossible = (config.basePoints || DEFAULT_CONFIG.basePoints) + (config.maxSpeedBonus || DEFAULT_CONFIG.maxSpeedBonus);
  const highThreshold = Math.floor(maxPossible * 0.9);
  const midThreshold = Math.floor(maxPossible * 0.6);
  const lowThreshold = Math.floor(maxPossible * 0.4);

  if (points >= highThreshold) return { text: `+${points} pts (lightning fast!)`, tier: 'gold' };
  if (points >= midThreshold) return { text: `+${points} pts (quick!)`, tier: 'silver' };
  if (points >= lowThreshold) return { text: `+${points} pts`, tier: 'bronze' };
  return { text: `+${points} pts`, tier: 'base' };
}
