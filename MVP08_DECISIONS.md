# CAN-DO-BE · LOCAL CHAPTER
## MVP08 ADVISOR SESSION — DECISIONS REFERENCE
**Coach + Rewards · 2026-03-19**

---

## Session Scope

Resolved all open design questions for MVP08 COACH + REWARDS prior to implementation. No code was written. All decisions below are locked for BUILD.

---

## D-MVP08-T01 — Coach Tone Enum

**Decided:** `muted | friendly | militant`

| Tone | Behavior |
|---|---|
| `muted` | System messages only. Badge awards, feed entries, essential state changes. No flavor, no encouragement. Coach is functionally present but quiet. |
| `friendly` | Default. Warm, playful, froggy character voice. Positive reinforcement, personality-forward. |
| `militant` | High intensity, no-nonsense, still positive enforcement. Pushes completion, never punishes — demands more. |

**Notes:**
- Tone is independent of character. Character voice is a future layer.
- Audio and per-character comment variants deferred to future chapters.
- One tone set serves all characters in LOCAL v1.
- Future tones (zen, android, etc.) extend the enum without breaking current shape.

---

## D-MVP08-CL01 — CommentLibrary Context Key Enum

`ribbet()` operates on two distinct call sites.

### Passive Call Site
Always-on ambient. Runs a priority check against user state snapshot — first match wins, falls back to flat general pool. Priority order defined at BUILD time. Routing logic lives in the passive call site function, not in CommentLibrary.

| Key | Trigger |
|---|---|
| `ambient.morning` | Correlated to early bird boost window |
| `ambient.evening` | Correlated to night owl boost window |
| `ambient.general` | Priority-check pool — evaluates user state (active quest progress, streak state, recent activity). Falls back to flat general pool. |

### Reactive Call Site
Session-scoped queue. Fills during active session from high-signal events. Cleared on logout. On login, flush pass can push missed activity items (MULTI-USER expansion point).

| Key | Trigger |
|---|---|
| `quest.progress` | Task with questRef completed — shows XP gain + progress %. |
| `quest.completed` | Quest hits 100%. Check-in task surfaces in QuickActions. |
| `quest.exigency` | Finish line missed, exigency handler fired (extend, pause, etc.) |
| `quest.toggled` | Act-level pause or close. |
| `event.completed` | Event closes with all tasks done. |
| `level.up` | XP threshold crossed. |
| `streak.started` | Streak begins or restarts after break. |
| `streak.milestone` | Defined streak thresholds (3-day, 7-day, etc.) |
| `streak.broken` | Streak ended. |
| `badge.awarded` | Badge created and pushed to BadgeBoard.earned[]. |
| `gear.awarded` | Gear created and pushed to Equipment[]. |
| `talent.tier.unlocked` | Talent tree tier reached. |
| `login.return` | Login flush pass. References missed activity. MULTI-USER push point. |

**Notes:**
- Events closed with incomplete tasks generate no Coach message. Coach sees them in history but stays quiet.
- Single task completion is not reactive unless the task carries a questRef.
- `quest.progress` is a distinct key from `task.completed` — gives CommentLibrary a separate comment pool for quest-progress vs generic task completion.

---

## D-MVP08-A01 — AchievementDefinition List (LOCAL v1)

### Trigger Type Enum

| Type | Description |
|---|---|
| `first.time` | One-time event, fires once per user lifetime |
| `counter.threshold` | Cumulative count reaches N |
| `streak.threshold` | streakCurrent or streakBest reaches N |
| `level.threshold` | Overall level or per-stat statPoints reaches N |
| `gold.threshold` | User.progression.gold reaches N — never re-awarded if user spends below threshold |
| `combination` | Two conditions both true simultaneously |

**Note:** Stat tier achievements not used — talent tree is resettable, invalidating tier-based triggers. `statPoints` accumulates and never resets, making it the correct anchor for stat-based achievements.

### Achievement Set

**First Time**
| Achievement | Condition |
|---|---|
| First task completed | `tasksCompleted >= 1` |
| First quest completed | `questsCompleted >= 1` |
| First event completed | `eventsCompleted >= 1` |
| First badge placed | `badgesPlaced >= 1` |
| First gear equipped | `gearEquipped >= 1` |
| First Act created | `actsCreated >= 1` |
| First resource created | `resourcesCreated >= 1` |

**Counter Threshold — Tasks**
| Achievement | Condition |
|---|---|
| Task milestone I | `tasksCompleted >= 10` |
| Task milestone II | `tasksCompleted >= 50` |
| Task milestone III | `tasksCompleted >= 100` |
| Task milestone IV | `tasksCompleted >= 500` |

**Counter Threshold — Quests**
| Achievement | Condition |
|---|---|
| Quest milestone I | `questsCompleted >= 1` |
| Quest milestone II | `questsCompleted >= 5` |
| Quest milestone III | `questsCompleted >= 10` |
| Quest milestone IV | `questsCompleted >= 25` |

**Counter Threshold — Events**
| Achievement | Condition |
|---|---|
| Event milestone I | `eventsCompleted >= 10` |
| Event milestone II | `eventsCompleted >= 50` |
| Event milestone III | `eventsCompleted >= 100` |

**Streak Threshold**
| Achievement | Condition |
|---|---|
| Streak I | `streakCurrent >= 3` |
| Streak II | `streakCurrent >= 7` |
| Streak III | `streakCurrent >= 30` |
| Best streak I | `streakBest >= 7` |
| Best streak II | `streakBest >= 30` |
| Best streak III | `streakBest >= 100` |

**Level Threshold — Overall**
| Achievement | Condition |
|---|---|
| Level milestone I | `level >= 10` |
| Level milestone II | `level >= 25` |
| Level milestone III | `level >= 50` |
| Level milestone IV | `level >= 99` |

**Level Threshold — Per Stat**
| Achievement | Condition |
|---|---|
| Stat depth I | Any single stat `statPoints >= 100` |
| Stat depth II | Any single stat `statPoints >= 500` |

**Gold Threshold**
| Achievement | Condition |
|---|---|
| Gold I | `gold >= 100` |
| Gold II | `gold >= 500` |
| Gold III | `gold >= 1000` |
| Gold IV | `gold >= 5000` |

**Combination**
| Achievement | Condition |
|---|---|
| All-rounder | All six stats `statPoints >= 100` |

**BadgeBoard Curation**
| Achievement | Condition |
|---|---|
| Collector | `badgesPlaced >= 100` |

---

## D-MVP08-G01 — Gear Slot Taxonomy (LOCAL v1)

**Decided:** 5 slots for LOCAL v1. Full kit expansion in MULTI-USER.

| Slot | Examples |
|---|---|
| `head` | Hat, crown, helmet |
| `body` | Shirt, jacket, armor |
| `hand` | Single slot — tool, weapon, shield |
| `feet` | Boots, shoes, flippers |
| `accessory` | Ring, amulet, pin — catch-all |

**Note:** Eyes, back, left/right hand split, and neck are expansion slots for MULTI-USER when Avatar rendering investment increases.

---

## D-MVP08-G02 — Gear Rarity Enum (LOCAL v1)

**Decided:** `common | rare | epic | legendary`

| Tier | Notes |
|---|---|
| `common` | Base drop tier |
| `rare` | Meaningful upgrade |
| `epic` | High-value reward |
| `legendary` | Long-term aspirational ceiling |

**Note:** `mythic` reserved for APP-STORE purchasable gear. Extends the enum without breaking current shape.

---

## D-MVP08-R01 — Reward Trigger Rules (LOCAL v1)

### Badge Pipeline

1. `checkAchievements(user)` evaluates all AchievementDefinitions on qualifying events
2. Condition met + not previously awarded → creates Badge → pushes to `BadgeBoard.earned[]` → fires `badge.awarded` reactive context
3. Badge can carry optional `rewardRef` → if present, executes Gear drop after Badge creation

### Gear Pipeline — Two Entry Points

| Entry | Flow |
|---|---|
| Quest completion | Quest carries `rewardRef` → Gear created → pushed to `Equipment[]` → fires `gear.awarded` |
| Coach drop | Level threshold or streak milestone → same destination |

### Useables — Not Part of Reward Pipeline

- System-defined inventory items shipped with app
- User can add custom items with own icon
- Gold unlocks cosmetic variants (APP-STORE)
- Coach does not drop Useables

### `source` Enum on ItemTemplate

`coach.drop | quest.reward | badge.reward | leaderboard | experience.post`

---

## D-MVP08-CL02 — CharacterLibrary Content Inventory (LOCAL v1)

| Property | Consumer | Notes |
|---|---|---|
| `avatarStates[]` | Avatar component | Visual states keyed by XP threshold. Seed → tree progression. |
| `levelThresholds[]` | UserStats | XP threshold table. Level derived at runtime — never stored independently. |
| `talentTreeDefinitions{}` | UserStats.talentTree | 6 trees × 5 tiers enhancement catalogue. User unlocked state lives in UserStats. |
| `gearModels[]` | Gear rendering | Visual asset refs keyed by slot. Applied to Avatar slot at render time. |
| `coachCharacters[]` | Coach.visual | Default frog coach visual assets. APP-STORE additional characters extend this array. |
| `badgeStickerModels[]` | Badge rendering | Sticker visuals keyed by achievementRef. Resolved at Badge render time. |

---

## Additional Decisions Captured in Session

| Ref | Decision |
|---|---|
| D-MVP08-NightOwl | Night owl boost mode confirmed — parallel to early bird. Correlated to `ambient.evening` context key. |
| D-MVP08-Feed | Reactive ribbet call site is session-scoped. Fills during active session. Cleared on logout. Login flush pass evaluates missed activity. MULTI-USER push point for contact activity. |
| D-MVP08-Incomplete | Events closed with incomplete tasks generate no Coach message. No explicit skip state — non-completion is visible in history only. |
| D-MVP08-GoldAward | Gold achievements never re-awarded. User spends below threshold after award — their problem. Creates incentive to accumulate beyond badge threshold. |

---

## What Comes Next

**MVP08 STRUCTURE then BUILD:**
1. Author static JSON libraries — CommentLibrary, AchievementLibrary, CharacterLibrary
2. Implement `ribbet()` — passive call site with priority check, reactive call site with session queue
3. Implement `checkAchievements()` — evaluates AchievementDefinition set against UserStats
4. Implement reward pipeline — Badge pipeline, Gear pipeline, `source` routing
5. Implement BadgeBoard check on session open
6. Wire Coach footer display — passive ambient + reactive elevated feed

---

*CAN-DO-BE LOCAL · MVP08 Advisor Session · 2026-03-19*
