// ─────────────────────────────────────────
// ENGINE — BARREL EXPORT
// Re-exports all engine module public APIs.
// ─────────────────────────────────────────

export { materialisePlannedEvent, advanceCursor } from './materialise';
export type { MaterialiseResult } from './materialise';

export { executeRollover, checkAndRunRolloverOnBoot } from './rollover';

export { completeTask, completeEvent, recordAttachment } from './eventExecution';
export type { TaskResult, AttachmentRecord } from './eventExecution';

export { awardXP, awardStat, deriveLevelFromXP } from './awardPipeline';
export type { XPMultipliers } from './awardPipeline';

export {
  evaluateQuestSpecific,
  evaluateMarkerCondition,
  computeProjectedFinish,
  deriveQuestProgress,
  updateQuestProgress,
} from './questEngine';

export {
  encodeQuestRef,
  decodeQuestRef,
  fireMarker,
  completeMilestone,
} from './markerEngine';
export type { FireMarkerParams } from './markerEngine';
