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
