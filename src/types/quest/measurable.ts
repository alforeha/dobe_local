// ─────────────────────────────────────────
// Quest.measurable{} — SMARTER: M
// Defines which task types count as completion events toward Quest progress.
// Q02 DECISION (confirmed): flat list — all listed task types count equally.
// The list is a filter on which task type completions the system recognises
// as meaningful progress events for this Quest.
// ─────────────────────────────────────────

import type { TaskType } from '../taskTemplate';

export interface QuestMeasurable {
  /**
   * Task types whose completions count toward this Quest's progress.
   * Only completions of these task types are recognised by progress evaluation.
   * All listed types count equally — evaluation is a completion count filter.
   */
  taskTypes: TaskType[];
}
