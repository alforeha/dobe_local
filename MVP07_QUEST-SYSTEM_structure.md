<!-- CHAPTER
name: LOCAL
project: CAN-DO-BE
status: ACTIVE
purpose: Single-user local chapter — storage, core loop, quest engine, and progression
root: E:\02_PROJECTS\CAN-DO-BE\01_WORK\1_LOCAL
architecture: true
-->

---

# CHAPTER — CAN-DO-BE LOCAL

**Project:** CAN-DO-BE | **Status:** `ACTIVE` | **Purpose:** Single-user local chapter — storage, core loop, quest engine, and progression

---

<!-- CHAPTER_ROADMAP
stages:
  - id: MVP07
    name: QUEST SYSTEM
    status: ACTIVE
    artifacts:
      - name: Quest engine types and logic
        root: src/types/quest
      - name: useProgressionStore updates
        root: src/stores/useProgressionStore
-->

> Chapter roadmap renders dynamically from stage and artifact data above.

---
---

<!-- STAGE
id: MVP07
name: QUEST SYSTEM
status: ACTIVE
priority: 5
dependency: MVP06_CORE LOOP
next: MVP08_PROGRESSION ENGINE
build_root: E:\02_PROJECTS\CAN-DO-BE\01_WORK\BUILDS\MVP07_QUEST-SYSTEM
output_root: E:\02_PROJECTS\CAN-DO-BE\03_OUTPUT\MVP07_QUEST-SYSTEM
-->

# MVP07 — QUEST SYSTEM

**Status:** `ACTIVE` | **Priority:** 5 | **Dependency:** MVP06_CORE LOOP | **Next:** MVP08_PROGRESSION ENGINE

**Build Root:** `E:\02_PROJECTS\CAN-DO-BE\01_WORK\BUILDS\MVP07_QUEST-SYSTEM`

**Output Root:** `E:\02_PROJECTS\CAN-DO-BE\03_OUTPUT\MVP07_QUEST-SYSTEM`

---

<!-- SCOPE
stage: MVP07
included:
  - Quest.specific{} field implementation with sourceType routing
  - Quest.timely{} field implementation with conditionType, Marker array, and projectedFinish
  - Marker type definition — conditionType interval and xpThreshold, virtual projection and fire logic
  - Milestone type definition — condition-generated result node with questRef, actRef, resourceRef
  - Quest.measurable{} field — task types that count toward Quest progress
  - Quest.exigency{} stub — state handler shape for missed finish line (restart, extend, sleep)
  - Act.commitment{} field — trackedTaskRefs and routineRefs
  - useProgressionStore updates to hold Act hierarchy with all new field shapes
excluded:
  - exigency{} full handler logic — shape stub only, execution is BUILD-time
  - commitment{} routine review UI — wiring to schedule is BUILD-time
  - toggle{} gating logic on Act — BUILD-time
  - taskCount condition type on Marker — deferred post LOCAL v1
  - XP rate projection algorithm — projectedFinish computed field is BUILD-time
  - MULTI-USER accountability{} expansion
-->

<!-- ACCEPTANCE
stage: MVP07
items:
  - id: A01
    text: Quest.specific{} accepts targetValue, unit, sourceType (taskInput | resourceRef), resourceRef, and resourceProperty — sourceType correctly routes condition evaluation at Milestone completion
  - id: A02
    text: Quest.timely{} holds conditionType (interval | xpThreshold), interval (RecurrenceRule | null), xpThreshold (number | null), markers array, and projectedFinish (date | null) — conditionType determines which field drives Marker generation
  - id: A03
    text: Marker fires correctly for both conditionTypes — interval fires on RecurrenceRule schedule, xpThreshold fires when User XP accumulated meets threshold — both push a Task instance to User.gtdList[]
  - id: A04
    text: Milestone task carries questRef, actRef, and resourceRef (null if not resource-linked) — on completion, system evaluates Quest.specific{} end state condition and either logs finish line Milestone or projects next Marker
  - id: A05
    text: Act.commitment{} persists trackedTaskRefs and routineRefs arrays — readable from useProgressionStore
-->

<!-- DECISIONS
stage: MVP07
items:
  - id: D01
    text: Quest.specific{} carries sourceType — taskInput reads from Milestone result fields, resourceRef reads from linked Resource property (resourceRef + resourceProperty). Both paths evaluate against targetValue.
  - id: D02
    text: Markers are virtual indicators — two conditionTypes in LOCAL v1 — interval (time-based RecurrenceRule) and xpThreshold (accumulated XP threshold). taskCount deferred post LOCAL v1, enum extensible.
  - id: D03
    text: One TaskTemplate per Quest shared across all Milestones. Marker holds taskTemplateRef, fires it into a Task instance at each check-in. Template defines the input capture shape for every check-in on that Quest.
  - id: D04
    text: Milestone is condition-generated, not calendar-generated. Created when a Marker fires and the user completes the pushed Task. Carries questRef, actRef, resourceRef. If finish line condition met at completion — Quest closes. If not — next Marker projects forward or exigency fires.
  - id: D05
    text: Quest.timely{} is the Marker configuration and container object — not a simple array. Holds conditionType, the condition parameters, the Marker instances, and the computed projectedFinish date.
  - id: D06
    text: Quest.exigency{} is a stub shape in MVP07 — options are restart, extend interval, new check-in schedule, sleep state. Full handler logic is BUILD-time.
  - id: D07
    text: Act.commitment{} carries two fields — trackedTaskRefs (TaskTemplate refs the user has committed to scheduling) and routineRefs (PlannedEvent refs where those tasks live). No lastReviewed in LOCAL v1.
  - id: D08
    text: ACTS on Act — A (accountability) and T (toggle) remain stubs in LOCAL v1. S (system) has no property — it is engine behavior. C (commitment) is the two-list shape per D07.
  - id: D09
    text: Chain carries WOOP framework — wish, outcome, obstacle, plan. Quest carries SMARTER framework — specific, measurable, attainable, relevant, timely, exigency, result. These are confirmed framework assignments per OOD v0.2.
-->

<!-- QUESTIONS
stage: MVP07
items:
  - projectedFinish calculation algorithm — what inputs does the system use to estimate XP rate from user schedule? Which PlannedEvents count? BUILD-time task but input shape may need confirming.
  - Quest.measurable{} exact shape — holds task types that count toward progress, but does it also carry a weighting or is it a flat list of taskType refs?
  - Marker xpThreshold — is this cumulative XP across all time, or XP earned since last Marker fired?
-->

### Planning

**Included Scope**
- Quest.specific{} field implementation with sourceType routing
- Quest.timely{} field implementation with conditionType, Marker array, and projectedFinish
- Marker type definition — conditionType interval and xpThreshold, virtual projection and fire logic
- Milestone type definition — condition-generated result node with questRef, actRef, resourceRef
- Quest.measurable{} field — task types that count toward Quest progress
- Quest.exigency{} stub — state handler shape for missed finish line
- Act.commitment{} field — trackedTaskRefs and routineRefs
- useProgressionStore updates to hold Act hierarchy with all new field shapes

**Excluded Scope**
- exigency{} full handler logic — stub shape only
- commitment{} routine review UI — BUILD-time
- toggle{} gating logic — BUILD-time
- taskCount Marker condition type — deferred post LOCAL v1
- XP rate projection algorithm — BUILD-time
- MULTI-USER accountability{} expansion

**Acceptance List**
- A01 — Quest.specific{} accepts targetValue, unit, sourceType, resourceRef, resourceProperty — sourceType correctly routes condition evaluation
- A02 — Quest.timely{} holds conditionType, interval, xpThreshold, markers[], projectedFinish — conditionType drives Marker generation
- A03 — Marker fires correctly for both conditionTypes — both push Task to User.gtdList[]
- A04 — Milestone task carries questRef, actRef, resourceRef — completion evaluates end state condition correctly
- A05 — Act.commitment{} persists trackedTaskRefs and routineRefs — readable from useProgressionStore

**Decision List**
- D01 — Quest.specific{} sourceType: taskInput reads Milestone result, resourceRef reads linked Resource property
- D02 — Two Marker conditionTypes in LOCAL v1: interval and xpThreshold. taskCount deferred, enum extensible.
- D03 — One TaskTemplate per Quest shared across all Milestones
- D04 — Milestone is condition-generated. Carries questRef, actRef, resourceRef. Finish line evaluated at completion.
- D05 — Quest.timely{} is the Marker configuration and container object
- D06 — Quest.exigency{} is a stub shape in MVP07 — full handler is BUILD-time
- D07 — Act.commitment{} carries trackedTaskRefs[] and routineRefs[] only in LOCAL v1
- D08 — ACTS on Act: A and T stub, S no property, C is commitment shape per D07
- D09 — Chain = WOOP, Quest = SMARTER — confirmed framework assignments

**Open Questions**
- projectedFinish calculation — input shape may need confirming before BUILD
- Quest.measurable{} shape — flat task type list or weighted?
- Marker xpThreshold — cumulative all-time XP or XP since last Marker?

> Tasks roadmap, artifact diagram, and release diagram render dynamically in viewer.

---

<!-- GANTT
stage: MVP07
phases:
  - name: CONCEPT
    begin: YYYY-MM-DD
    end: YYYY-MM-DD
  - name: STRUCTURE
    begin: YYYY-MM-DD
    end: YYYY-MM-DD
  - name: BUILD
    begin: YYYY-MM-DD
    end: YYYY-MM-DD
  - name: VALIDATE
    begin: YYYY-MM-DD
    end: YYYY-MM-DD
  - name: RELEASE
    begin: YYYY-MM-DD
    end: YYYY-MM-DD
-->

<!-- PHASE
stage: MVP07
name: CONCEPT
status: COMPLETE
progress: 1/1
begin: YYYY-MM-DD
end: YYYY-MM-DD
note: Design decisions resolved in advisor session — specific, timely, Marker conditionTypes, Milestone shape, commitment shape all decided.
-->

- [x] Resolve open design questions for quest hierarchy field shapes

<!-- PHASE
stage: MVP07
name: STRUCTURE
status: ACTIVE
progress: 0/4
begin: YYYY-MM-DD
end: YYYY-MM-DD
note: Type scaffold exists from MVP05. This phase locks field-level shapes before BUILD.
-->

- [ ] Confirm field-level type shapes for Quest.specific, Quest.timely, Marker, Milestone, Act.commitment

<!-- PHASE
stage: MVP07
name: BUILD
status: PENDING
progress: 0/0
begin: YYYY-MM-DD
end: YYYY-MM-DD
note: Implement quest engine logic against confirmed type scaffold.
-->

- [ ] Implement Marker fire logic, Milestone generation, condition evaluation, and store wiring

<!-- PHASE
stage: MVP07
name: VALIDATE
status: PENDING
progress: 0/0
begin: YYYY-MM-DD
end: YYYY-MM-DD
note: Verify all acceptance criteria against implemented logic.
-->

- [ ] Verify all five acceptance criteria against working implementation

<!-- PHASE
stage: MVP07
name: RELEASE
status: PENDING
progress: 0/0
begin: YYYY-MM-DD
end: YYYY-MM-DD
output: E:\02_PROJECTS\CAN-DO-BE\03_OUTPUT\MVP07_QUEST-SYSTEM
-->

- [ ] Merge quest engine into main branch and update OOD to v0.3

---

<!-- TASK
stage: MVP07
id: T01
name: Lock Quest.specific{} type shape
phase: STRUCTURE
scope_ref: Quest.specific{} field implementation with sourceType routing
acceptance_ref: A01
decision_ref: D01
note: sourceType drives two evaluation paths — confirm resourceProperty is a string key ref not a typed enum for LOCAL v1
-->

<!-- TASK_ITEM
task: T01
id: TI01
name: Define Quest.specific{} TypeScript interface — targetValue, unit, sourceType, resourceRef, resourceProperty
status: ACTIVE
artifact_root: src/types/quest/specific.ts
-->

<!-- TASK_ITEM
task: T01
id: TI02
name: Confirm resourceProperty shape — string key ref vs typed enum — log decision
status: PENDING
artifact_root: NONE
-->

<!-- TASK_ITEM
task: T01
id: TI03
name: Add Quest.specific{} to Quest type in OOD type scaffold
status: PENDING
artifact_root: src/types/quest/Quest.ts
-->

---

<!-- TASK
stage: MVP07
id: T02
name: Lock Quest.timely{} and Marker type shapes
phase: STRUCTURE
scope_ref: Quest.timely{} field implementation with conditionType, Marker array, and projectedFinish
acceptance_ref: A02, A03
decision_ref: D02, D03, D05
note: timely{} is the configuration object and Marker container — not a flat array. Marker holds taskTemplateRef shared across all check-ins.
-->

<!-- TASK_ITEM
task: T02
id: TI04
name: Define Quest.timely{} interface — conditionType enum, interval, xpThreshold, markers[], projectedFinish
status: PENDING
artifact_root: src/types/quest/timely.ts
-->

<!-- TASK_ITEM
task: T02
id: TI05
name: Define Marker interface — questRef, conditionType, interval, xpThreshold, taskTemplateRef, lastFired, nextFire, activeState
status: PENDING
artifact_root: src/types/quest/Marker.ts
-->

<!-- TASK_ITEM
task: T02
id: TI06
name: Confirm xpThreshold scope — cumulative all-time vs since last Marker fired — log decision before BUILD
status: PENDING
artifact_root: NONE
-->

<!-- TASK_ITEM
task: T02
id: TI07
name: Add Quest.timely{} and Marker types to Quest type scaffold
status: PENDING
artifact_root: src/types/quest/Quest.ts
-->

---

<!-- TASK
stage: MVP07
id: T03
name: Lock Milestone type shape
phase: STRUCTURE
scope_ref: Milestone type definition — condition-generated result node with questRef, actRef, resourceRef
acceptance_ref: A04
decision_ref: D04
note: Milestone inherits TaskTemplate shape and adds questRef, actRef, resourceRef. Condition evaluation logic runs at Task completion — not at Milestone creation.
-->

<!-- TASK_ITEM
task: T03
id: TI08
name: Define Milestone interface — questRef, actRef, resourceRef, taskTemplateShape, completedAt
status: PENDING
artifact_root: src/types/quest/Milestone.ts
-->

<!-- TASK_ITEM
task: T03
id: TI09
name: Define condition evaluation signature — reads Quest.specific sourceType and compares against targetValue
status: PENDING
artifact_root: src/types/quest/conditionEval.ts
-->

<!-- TASK_ITEM
task: T03
id: TI10
name: Add Milestone type to Quest.milestones[] array in Quest type scaffold
status: PENDING
artifact_root: src/types/quest/Quest.ts
-->

---

<!-- TASK
stage: MVP07
id: T04
name: Lock Quest.measurable{} and Quest.exigency{} stub shapes
phase: STRUCTURE
scope_ref: Quest.measurable{} field — task types that count toward Quest progress
acceptance_ref: A01
decision_ref: D06
note: measurable{} shape question — flat list vs weighted — must be resolved before defining interface. exigency{} is stub only.
-->

<!-- TASK_ITEM
task: T04
id: TI11
name: Resolve Quest.measurable{} shape — flat taskType string[] or weighted object — log decision
status: PENDING
artifact_root: NONE
-->

<!-- TASK_ITEM
task: T04
id: TI12
name: Define Quest.measurable{} interface from resolved shape
status: PENDING
artifact_root: src/types/quest/measurable.ts
-->

<!-- TASK_ITEM
task: T04
id: TI13
name: Define Quest.exigency{} stub interface — options: restart | extend | reschedule | sleep — no handler logic
status: PENDING
artifact_root: src/types/quest/exigency.ts
-->

---

<!-- TASK
stage: MVP07
id: T05
name: Lock Act.commitment{} shape and update Act type
phase: STRUCTURE
scope_ref: Act.commitment{} field — trackedTaskRefs and routineRefs
acceptance_ref: A05
decision_ref: D07, D08
note: Commitment is user-facing behavior scaffolding — two lists only in LOCAL v1. No lastReviewed.
-->

<!-- TASK_ITEM
task: T05
id: TI14
name: Define Act.commitment{} interface — trackedTaskRefs string[], routineRefs string[]
status: PENDING
artifact_root: src/types/quest/Act.ts
-->

<!-- TASK_ITEM
task: T05
id: TI15
name: Confirm Act.accountability{} and Act.toggle{} remain stubs — no shape expansion in MVP07
status: PENDING
artifact_root: NONE
-->

---

<!-- TASK
stage: MVP07
id: T06
name: Implement Marker fire logic and Milestone generation
phase: BUILD
scope_ref: Marker type definition — virtual projection and fire logic
acceptance_ref: A03, A04
decision_ref: D02, D03, D04
note: Marker.evaluate() called by Rollover Engine. Marker.fire() instantiates TaskTemplate, pushes Task to gtdList[]. Task completion triggers condition evaluation and Milestone log.
-->

<!-- TASK_ITEM
task: T06
id: TI16
name: Implement Marker.evaluate() — checks conditionType and fires if interval or xpThreshold met
status: PENDING
artifact_root: src/logic/quest/markerEngine.ts
-->

<!-- TASK_ITEM
task: T06
id: TI17
name: Implement Marker.fire() — instantiates TaskTemplate into Task, sets questRef/actRef/resourceRef, pushes to gtdList[]
status: PENDING
artifact_root: src/logic/quest/markerEngine.ts
-->

<!-- TASK_ITEM
task: T06
id: TI18
name: Implement condition evaluation on Task completion — reads Quest.specific sourceType, evaluates against targetValue, logs Milestone or projects next Marker
status: PENDING
artifact_root: src/logic/quest/conditionEval.ts
-->

<!-- TASK_ITEM
task: T06
id: TI19
name: Wire Marker evaluation into Rollover Engine — called per Quest with activeState Markers at rollover
status: PENDING
artifact_root: src/logic/rollover/rolloverEngine.ts
-->

<!-- TASK_ITEM
task: T06
id: TI20
name: Wire Milestone log into useProgressionStore — Quest.milestones[] appended on finish line or check-in completion
status: PENDING
artifact_root: src/stores/useProgressionStore.ts
-->

---

<!-- TASK
stage: MVP07
id: T07
name: Validate acceptance criteria
phase: VALIDATE
scope_ref: All MVP07 scope
acceptance_ref: A01, A02, A03, A04, A05
decision_ref: NONE
note: Manual validation pass against all five acceptance criteria before release.
-->

<!-- TASK_ITEM
task: T07
id: TI21
name: Verify A01 — Quest.specific{} sourceType routing evaluates correctly for taskInput and resourceRef paths
status: PENDING
artifact_root: NONE
-->

<!-- TASK_ITEM
task: T07
id: TI22
name: Verify A02 and A03 — Quest.timely{} conditionType drives correct Marker generation and Task push for both interval and xpThreshold
status: PENDING
artifact_root: NONE
-->

<!-- TASK_ITEM
task: T07
id: TI23
name: Verify A04 — Milestone task carries correct refs and condition evaluation closes Quest or projects next Marker correctly
status: PENDING
artifact_root: NONE
-->

<!-- TASK_ITEM
task: T07
id: TI24
name: Verify A05 — Act.commitment{} reads and persists correctly from useProgressionStore
status: PENDING
artifact_root: NONE
-->

---

---

## DECISIONS LOG

All decisions from MVP07 advisor session — confirmed, do not revisit.

| ID | Decision |
|---|---|
| D01 | Quest.specific{} sourceType — taskInput reads Milestone result fields, resourceRef reads linked Resource property via resourceRef + resourceProperty |
| D02 | Marker conditionTypes LOCAL v1 — interval and xpThreshold only. taskCount deferred post LOCAL v1, enum extensible. |
| D03 | One TaskTemplate per Quest, shared across all Milestones. Marker holds taskTemplateRef. |
| D04 | Milestone is condition-generated. Carries questRef, actRef, resourceRef. Finish line evaluated at Task completion. |
| D05 | Quest.timely{} is the Marker configuration and container object — conditionType, parameters, markers[], projectedFinish. |
| D06 | Quest.exigency{} stub shape only in MVP07 — options: restart, extend, reschedule, sleep. Handler logic BUILD-time. |
| D07 | Act.commitment{} — trackedTaskRefs[] and routineRefs[] only. No lastReviewed in LOCAL v1. |
| D08 | ACTS on Act — A (accountability) and T (toggle) stub in LOCAL v1. S has no property. C is commitment per D07. |
| D09 | Chain = WOOP framework. Quest = SMARTER framework. Confirmed per OOD v0.2. |

---

## OPEN QUESTIONS

Questions that must be resolved before or during BUILD — not design questions, implementation decisions.

| # | Question | Blocks |
|---|---|---|
| Q01 | projectedFinish calculation — which PlannedEvents and task types feed XP rate estimate? Input shape may need confirming. | BUILD T06 |
| Q02 | Quest.measurable{} shape — flat taskType string[] or weighted object with per-type multipliers? | STRUCTURE T04 |
| Q03 | Marker xpThreshold — cumulative all-time XP or XP earned since last Marker fired? | STRUCTURE T02 |

---

## REFERENCE SHAPES

Confirmed field shapes from advisor session. Implementer uses these as the type source of truth.

### Quest.specific{}
```typescript
specific: {
  targetValue: number
  unit: string | null
  sourceType: 'taskInput' | 'resourceRef'
  resourceRef: string | null        // null if sourceType is taskInput
  resourceProperty: string | null   // key of Resource property to read, e.g. 'balance'
}
```

### Quest.timely{}
```typescript
timely: {
  conditionType: 'interval' | 'xpThreshold'
  interval: RecurrenceRule | null     // set if conditionType is interval
  xpThreshold: number | null          // set if conditionType is xpThreshold
  markers: Marker[]                   // projected and fired instances
  projectedFinish: date | null        // computed from user schedule XP rate — BUILD-time
}
```

### Marker
```typescript
marker: {
  questRef: string
  conditionType: 'interval' | 'xpThreshold'
  interval: RecurrenceRule | null
  xpThreshold: number | null
  taskTemplateRef: string             // shared TaskTemplate ref for this Quest
  lastFired: date | null
  nextFire: date | null               // computed from lastFired and interval
  activeState: boolean                // false when Quest completes or pauses
}
```

### Milestone
```typescript
milestone: {
  questRef: string
  actRef: string
  resourceRef: string | null
  taskTemplateShape: TaskTemplate     // inherited full shape
  completedAt: date
}
```

### Quest.exigency{} stub
```typescript
exigency: {
  onMissedFinish: 'restart' | 'extend' | 'reschedule' | 'sleep'
  // handler logic BUILD-time
}
```

### Act.commitment{}
```typescript
commitment: {
  trackedTaskRefs: string[]    // TaskTemplate refs user has committed to scheduling
  routineRefs: string[]        // PlannedEvent refs where those tasks live
}
```
