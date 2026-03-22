// ─────────────────────────────────────────
// AWARD PIPELINE — XP + STAT AWARDS
// Implements the RuneScape XP curve (D43, D49) and stat group routing (D48).
//
// awardXP()   — add XP to user, check for level-up, update cache
// awardStat() — add stat points to a talent group, award talentPoints at threshold
//
// XP threshold table is generated at module init and cached in-process.
// CharacterLibrary (APP BUNDLE) is the canonical source in production —
// this module provides the same table as a code-generated fallback for LOCAL.
//
// RuneScape formula (D49) — A=0.25, B=300, C=7:
//   xpForLevel(L) = floor( A * sum_{i=1}^{L-1} floor(i + B * 2^(i/C)) )
// ─────────────────────────────────────────

import type { StatGroupKey } from '../types/user';
import { useUserStore } from '../stores/useUserStore';

import { checkAchievements } from '../coach/checkAchievements';
import { awardBadge, checkCoachDrops } from '../coach/rewardPipeline';
import { pushRibbet } from '../coach/ribbet';
import { appendFeedEntry, FEED_SOURCE } from './feedEngine';

// ── XP CURVE PARAMETERS (D49) ────────────────────────────────────────────────

const A = 0.25;
const B = 300;
const C = 7;
const MAX_LEVEL = 120; // generate table to lvl 120

// ── XP THRESHOLD TABLE ────────────────────────────────────────────────────────

/**
 * Generates the RuneScape-style XP threshold table up to MAX_LEVEL.
 * levelThresholds[L] = total XP required to reach level L+1 (0-indexed: index 0 = lvl 1).
 *
 * The formula: xpToReachLevel(L) = floor( A * sum_{i=1}^{L-1}( floor(i + B * 2^(i/C)) ) )
 */
function generateLevelThresholds(): number[] {
  const thresholds: number[] = [0]; // Level 1 requires 0 XP
  let runningSum = 0;
  for (let level = 2; level <= MAX_LEVEL; level++) {
    // Sum floor(i + B * 2^(i/C)) for i=1..level-1 (incremental)
    const iVal = level - 1;
    runningSum += Math.floor(iVal + B * Math.pow(2, iVal / C));
    thresholds.push(Math.floor(A * runningSum));
  }
  return thresholds;
}

/** levelThresholds[n] = minimum XP to be at level n+1 (index 0 = level 1 = 0 XP) */
const LEVEL_THRESHOLDS: readonly number[] = generateLevelThresholds();

/**
 * Derive level from total XP.
 * Returns 1 at minimum, MAX_LEVEL at maximum.
 */
export function deriveLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

// ── MULTIPLIER SPEC ───────────────────────────────────────────────────────────

export interface XPMultipliers {
  /** e.g. 3 for a 3-day streak (×3 total XP) */
  streak?: number;
  /** e.g. 2 for early bird mode (×2 task XP) */
  earlyBird?: number;
}

/** Apply additive multipliers to a base XP value (D43 — additive by default) */
function applyMultipliers(base: number, multipliers?: XPMultipliers): number {
  if (!multipliers) return base;
  let total = base;
  if (multipliers.streak && multipliers.streak > 1) {
    total *= multipliers.streak;
  }
  if (multipliers.earlyBird && multipliers.earlyBird > 1) {
    total *= multipliers.earlyBird;
  }
  return Math.floor(total);
}

// ── AWARD XP ──────────────────────────────────────────────────────────────────

/**
 * Add XP to the user, re-derive level, and emit a levelUp marker if threshold crossed.
 *
 * Reads  — useUserStore.user.progression.stats
 * Writes — useUserStore (stats.xp, stats.level), storageLayer (user)
 *
 * @param userId      User.system.id — validated against current store user
 * @param amount      Raw XP to award (before multipliers)
 * @param multipliers Optional streak/earlyBird multipliers (D43)
 */
export function awardXP(
  userId: string,
  amount: number,
  multipliers?: XPMultipliers,
): void {
  const userStore = useUserStore.getState();
  const user = userStore.user;
  if (!user || user.system.id !== userId) return;

  const effectiveAmount = applyMultipliers(amount, multipliers);
  if (effectiveAmount <= 0) return;

  const oldLevel = user.progression.stats.level;
  const newXP = user.progression.stats.xp + effectiveAmount;
  const newLevel = deriveLevelFromXP(newXP);

  const updatedStats = {
    ...user.progression.stats,
    xp: newXP,
    level: newLevel,
  };

  const updatedUser = {
    ...user,
    progression: { ...user.progression, stats: updatedStats },
  };

  userStore.setUser(updatedUser);

  if (newLevel > oldLevel) {
    console.info(`[awardPipeline] Level up! ${oldLevel} → ${newLevel} (XP: ${newXP})`);
    pushRibbet('level.up', { level: newLevel });

    // Coach drops for milestone levels — re-fetch after setUser above
    let levelUser = useUserStore.getState().user;
    if (levelUser) {
      levelUser = checkCoachDrops(levelUser, oldLevel, newLevel);

      // Achievement check after drops
      const postDropUser = useUserStore.getState().user ?? levelUser;
      const newAchs = checkAchievements(postDropUser);
      let currentUser = postDropUser;
      for (const ach of newAchs) {
        currentUser = awardBadge(ach, currentUser);
      }

      // Feed entry for level-up
      const levelFeedUser = useUserStore.getState().user ?? currentUser;
      appendFeedEntry({
        commentBlock: `Level up! Now level ${newLevel}`,
        sourceType: FEED_SOURCE.LEVEL_UP,
        timestamp: new Date().toISOString(),
      }, levelFeedUser);
    }
  }
}

// ── AWARD STAT ────────────────────────────────────────────────────────────────

const TALENT_POINT_THRESHOLD = 100;

/**
 * Add stat points to a talent group. Awards 1 talentPoint per 100 accumulated statPoints.
 * Custom task fallback: if statGroup is null/undefined, routes to wisdom +25 (D48).
 *
 * Reads  — useUserStore.user.progression.stats.talents + talentPoints
 * Writes — useUserStore (stats.talents, stats.talentPoints), storageLayer
 *
 * @param userId    User.system.id — validated against current store user
 * @param statGroup The StatGroupKey to award points to, or null for wisdom fallback
 * @param points    Points to add to the group
 */
export function awardStat(
  userId: string,
  statGroup: StatGroupKey | null | undefined,
  points: number,
): void {
  const userStore = useUserStore.getState();
  const user = userStore.user;
  if (!user || user.system.id !== userId) return;

  // D48 — custom task fallback: route to wisdom if no stat group set
  const targetGroup: StatGroupKey = statGroup ?? 'wisdom';
  const effectivePoints = statGroup ? points : 25;

  const oldGroup = user.progression.stats.talents[targetGroup];
  const newStatPoints = oldGroup.statPoints + effectivePoints;
  const newXpEarned = oldGroup.xpEarned + effectivePoints;

  // Check how many talentPoints should be awarded from the threshold
  const oldThresholdsPassed = Math.floor(oldGroup.statPoints / TALENT_POINT_THRESHOLD);
  const newThresholdsPassed = Math.floor(newStatPoints / TALENT_POINT_THRESHOLD);
  const talentPointsEarned = newThresholdsPassed - oldThresholdsPassed;

  const updatedTalents = {
    ...user.progression.stats.talents,
    [targetGroup]: {
      ...oldGroup,
      statPoints: newStatPoints,
      xpEarned: newXpEarned,
    },
  };

  const updatedStats = {
    ...user.progression.stats,
    talents: updatedTalents,
    talentPoints: user.progression.stats.talentPoints + talentPointsEarned,
  };

  const updatedUser = {
    ...user,
    progression: { ...user.progression, stats: updatedStats },
  };

  userStore.setUser(updatedUser);
}
