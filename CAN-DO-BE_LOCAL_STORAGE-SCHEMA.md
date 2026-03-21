# CAN-DO-BE
## LOCAL CHAPTER — STORAGE SCHEMA

**MVP05 ARCHITECTURE · v0.2 · 2026-03-18**

This document defines the complete storage schema for the CAN-DO-BE LOCAL chapter. It covers the three storage tiers, all localStorage keys, the property-level schema for every object in the object model, and the Zustand store topology. Future chapter deltas (MULTI-USER, APP STORE) will be separate documents referencing this baseline.

---

## 1. Storage Tiers

Three distinct tiers govern where data lives. Understanding this boundary is essential before reading any object schema.

| **Tier** | **Location** | **Contents** |
| --- | --- | --- |
| **APP BUNDLE** | Ships with app binary | Coach, AchievementLibrary, CommentLibrary, RecommendationsLibrary, CharacterLibrary. Updated via app releases. Never in localStorage. |
| **DEVICE** | localStorage (flat keyed dictionary) | All user account data. User, Settings, Acts, Events, Resources, PlannedEvents, Tasks, etc. Syncs to cloud in MULTI-USER. |
| **CLOUD** | Remote — MULTI-USER only | Mirror of DEVICE storage with permission controls. publicProfile, shared Acts, shared Events. Stub in LOCAL. |

---

## 2. localStorage Key Map

All DEVICE-tier objects are stored as flat-keyed JSON entries in localStorage. Key patterns below. APP BUNDLE objects are never stored here.

| **Storage Key** | **Object** | **Tier** | **Notes** |
| --- | --- | --- | --- |
| **user** | User | DEVICE | Singleton — one per device |
| **settings** | Settings | DEVICE | Singleton — user preferences |
| **act:{uuid}** | Act | DEVICE | One key per Act — uuid is Act.id |
| **plannedEvent:{uuid}** | PlannedEvent | DEVICE | One key per PlannedEvent |
| **event:{uuid}** | Event | DEVICE | One key per Event |
| **qa:{YYYY-MM-DD}** | QuickActionsEvent | DEVICE | Daily singleton — date-keyed per D12 |
| **resource:{uuid}** | Resource | DEVICE | One key per Resource of any type |
| **task:{uuid}** | Task | DEVICE | One key per live Task instance |
| **taskTemplate:{uuid}** | TaskTemplate | DEVICE | User custom templates only — D34 |
| **badge:{uuid}** | Badge | DEVICE | One key per awarded Badge |
| **gear:{uuid}** | Gear | DEVICE | One key per owned Gear item |
| **useable:{uuid}** | Useable | DEVICE | One key per Useable item |
| **attachment:{uuid}** | Attachment | DEVICE | One key per Attachment |
| **experience:{uuid}** | Experience | DEVICE | One key per Experience post |
| **coach** | Coach | APP | App bundle — never in localStorage |
| **achievementLibrary** | AchievementLibrary | APP | App bundle — never in localStorage |
| **commentLibrary** | CommentLibrary | APP | App bundle — never in localStorage |
| **recommendationsLibrary** | RecommendationsLibrary | APP | App bundle — never in localStorage |
| **characterLibrary** | CharacterLibrary | APP | App bundle — never in localStorage |

---

## 3. Object Schemas

Each schema shows every property, its type, live/stub state in LOCAL, and notes. Stub properties are stored as null in LOCAL with comment blocks per D16.

---

### SYSTEM · SINGLETON

#### Settings

User preference store. Singleton — no id. Coach reads coachPreferences.tone at call time (D26). App reads displayPreferences.theme on open and defers to Coach.activeTheme if default.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **timePreferences{}** | object | live | dayStart (string), weekStart (string) |
| **coachPreferences{}** | object | live | tone (string), trackingSettings (object), character (default│string) |
| **displayPreferences{}** | object | live | mode (light│dark), theme (default│string). Defers to Coach.activeTheme when default |
| **socialPreferences{}** | object | stub | [MULTI-USER] social and sharing preferences |
| **notificationPreferences{}** | object | stub | [APP-STORE] push notification and alarm settings |
| **storagePreferences{}** | object | stub | [MULTI-USER/APP-STORE] provider, lastSynced, cloudRef |

---

### CORE · SINGLETON

#### User

Root owner of all account data. Singleton per device. Grouped into sub-objects to keep the root clean and extensible.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **system{}** | object | live | id (uuid), displayName (settable annually), wrappedAnchor (date — gates annual review D31), auth (stub null [MULTI-USER]) |
| **personal{}** | object | live | nameFirst, nameLast, handle, birthday. User controls what surfaces in publicProfile |
| **progression{}** | object | live | stats (UserStats ref), avatar (Avatar ref), badgeBoard (BadgeBoard ref), equipment (Equipment ref), gold (number), statGroups (health/strength/agility/defense/charisma/wisdom), talentTree (stub null [future]) |
| **goals{}** | object | live | habitats[] (Act refs — user-created), adventures[] (Act refs — Coach-managed) |
| **schedule{}** | object | live | planned[] (PlannedEvent refs), routines[] (PlannedEvent refs). D36 — both are PlannedEvents, distinction is UI-level |
| **events{}** | object | live | active[] (Event refs — pushed by rollover, includes QuickActionsEvent), history[] (Event refs — moved on completion). D02, D03 |
| **lists{}** | object | live | taskLibrary[] (user custom TaskTemplate refs — D34), favouritesList[] (TaskTemplate refs), gtdList[] (Task refs — D05), shoppingLists[] (tagged item lists) |
| **resources{}** | object | live | homes[], vehicles[], contacts[], accounts[], inventory[], docs[] (Resource refs) |
| **feed** | Feed | live | Feed ref — user mailbox. Coach reads and writes ribbet and comment blocks into Feed entries. Feed belongs to User. |
| **publicProfile{}** | object | stub | [MULTI-USER] displayName, icon, optional personal fields. Default anonymous if nothing shared |

---

### DATA · NESTED IN USER

#### UserStats

XP, level, streaks, stat group progression, and talent tree unlocked state. Level is derived at runtime — not stored independently. StatGroups: health, strength, agility, defense, charisma, wisdom.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **xp** | number | live | Total XP earned. Level derived from XP via RuneScape exponential curve at runtime — D43 |
| **level** | number | live | Cached — derived from XP at runtime against threshold table in Coach bundle. Never source of truth |
| **talentPoints** | number | live | Unspent balance — 1 point per 100 statPoints earned |
| **milestones{}** | object | live | streakCurrent (login-based), streakBest, questsCompleted, tasksCompleted |
| **talents{}** | object | live | health{}, strength{}, agility{}, defense{}, charisma{}, wisdom{}. Each: statPoints (number), xpEarned (number), tier (number 0–5) |
| **talentTree{}** | object | live | User unlocked state only. WoW-style 6 trees × 5 tiers. Enhancement catalogue in Coach bundle — D35, D43 |

---

#### Avatar

Visual representation of the user. Visual state (seed → tree) derived at runtime from XP thresholds via CharacterLibrary. Stores equipped gear ids and slot taxonomy reference only.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **equippedGear{}** | object | live | Keyed by slot. Slot taxonomy is a BUILD-time task |
| **slotTaxonomyRef** | string | live | References slot taxonomy version in CharacterLibrary |
| **publicVisibility** | boolean | stub | [MULTI-USER] avatar visible on public profile |
| **additionalAnimations[]** | array | stub | [APP-STORE] poses, animation states, prestige engine. Arc: tree → burns → egg → phoenix |

---

#### BadgeBoard

Holds earned badges awaiting claim and manages the user-curated pinned display. Coach checks earned[] on session open and prompts claim if not empty.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **earned[]** | Badge[] | live | Badge refs awarded but not yet placed by user |
| **pinned[]** | Badge[] | live | Badge refs placed on board by user |
| **publicVisibility** | boolean | stub | [MULTI-USER] feed notification when badge earned. Board not publicly viewable |

---

#### Equipment

Passive inventory list of Gear ids owned by the user. Definitions live in CharacterLibrary (app bundle). Populated by Coach drops.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **equipment[]** | string[] | live | Gear id refs. Visual definitions resolved from CharacterLibrary at runtime |
| **storeUnlocks[]** | string[] | stub | [APP-STORE] Gear id refs available via store purchase |

---

#### Feed

User mailbox and activity stream. Receives pushed entries from Coach, task completions, badge awards, and level-ups. Belongs to User — Coach reads and writes but does not own it.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **entries[]** | object[] | live | Each entry: commentBlock (string), sourceType (string), timestamp (date), triggerRef (optional ref) |
| **unreadCount** | number | live | UI unread indicator — reset on markRead() |
| **sharedActivityEntries[]** | object[] | stub | [MULTI-USER] pushed from contact activity, badge notifications, quest completion updates |

---

### ITEM CLUSTER

#### ItemTemplate

Universal parent for all reward item types. Extended by Badge, Gear, Useable, Attachment, and Experience (D21). Type-specific data lives in contents{}.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **id** | string | live | uuid |
| **type** | string | live | badge │ gear │ useable │ attachment │ experience |
| **name** | string | live | — |
| **description** | string | live | — |
| **icon** | string | live | Ref to icon asset in CharacterLibrary (app bundle) |
| **source** | string | live | Origin — Coach drop, store, quest reward |
| **contents{}** | object | live | Type-specific shape — defined per child type below |

**Badge (extends ItemTemplate)**

Reward token earned by completing achievements. Placed and curated on BadgeBoard.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **contents.achievementRef** | string | live | AchievementDefinition ref — reads icon and sticker from AchievementLibrary |
| **contents.awardedDate** | date | live | Timestamp — used for board render ordering |
| **contents.location** | mixed | live | null = unclaimed │ {x,y} = placed on board │ "claimed" = removed from board |

**Gear (extends ItemTemplate)**

Wearable reward item equipped to Avatar slots. Grants xpBoost when equipped. Visual asset resolved from CharacterLibrary.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **contents.slot** | string | live | Enum — slot taxonomy BUILD-time task |
| **contents.rarity** | string | live | Enum — rarity tier names BUILD-time task |
| **contents.name** | string | live | Display name |
| **contents.description** | string | live | Flavour text |
| **contents.model** | string | live | Ref to visual asset in CharacterLibrary — applied to Avatar slot |
| **contents.xpBoost** | number | live | XP boost value applied when gear is equipped |
| **contents.equippedState** | boolean | live | true when in Avatar.equippedGear slot |

**Useable (extends ItemTemplate)**

Tracks real-world consumables and tools. Auto-pushes to User.lists.shoppingLists[] when quantity hits minimum.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **contents.type** | string | live | consumable │ tool |
| **contents.name** | string | live | — |
| **contents.icon** | string | live | Ref to icon asset |
| **contents.description** | string | live | — |
| **contents.quantity** | number | live | Current quantity |
| **contents.unit** | string | live | Unit of measure |
| **contents.maintenance{}** | object | live | expiry, minQuantity, inspectionSchedule, howToDocRef, autoPushToShoppingList trigger — BUILD-time task |

**Attachment (extends ItemTemplate)**

Local file reference attached to Events or Tasks. Supports optional contract validation. Max 200KB in LOCAL per D09.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **contents.fileRef** | string | live | Local file reference path |
| **contents.size** | number | live | File size — constrained to 200KB in LOCAL |
| **contents.type** | string | live | image │ text │ doc │ etc — for renderer |
| **contents.taskRef** | string | live | Optional Task ref — for contract validation flow |
| **contents.validationStatus** | string | live | Optional: pending │ approved │ denied |
| **contents.approverRef** | string | stub | [MULTI-USER] user ref for contract event approver |

**Experience (extends ItemTemplate)**

User-authored post or journal entry linked to an Event. Private in LOCAL. Surfaces in EventCenter in MULTI-USER and world view in APP-STORE.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **contents.rating** | number | live | User rating |
| **contents.iconReaction** | string | live | Ref to reaction icon |
| **contents.description** | string | live | User write-up |
| **contents.taskList[]** | string[] | live | Task refs attached to this Experience |
| **contents.mediaRoll[]** | string[] | live | Media refs |
| **contents.dateCompleted** | date | live | Optional — user-declared completion date |
| **contents.relevanceScore** | number | live | Sort algorithm — BUILD-time task |
| **contents.authorRef** | string | live | User ref |
| **contents.eventRef** | string | live | Linked Event ref |
| **contents.timestamp** | date | live | Created date |

---

### QUEST CLUSTER

#### Act

Top of the 4-level quest hierarchy (Act → Chain → Quest → Milestone). Only level shared externally per D22. UUID is the only ID in the hierarchy — Chain, Quest, Milestone are array-indexed per D27.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **id** | string | live | uuid — only Act gets uuid in quest hierarchy (D27) |
| **name** | string | live | — |
| **description** | string | live | — |
| **icon** | string | live | Ref to icon asset |
| **owner** | string | live | user ref │ coach ref — distinguishes habitat (user) from adventure (Coach) |
| **chains[]** | Chain[] | live | Array of Chain objects — array-indexed per D27 |
| **accountability{}** | object | live | Stub shape in LOCAL — expands in MULTI-USER |
| **commitment{}** | object | live | Routine review tied to Act — BUILD-time task |
| **toggle{}** | object | live | Action on chain completion, gating logic for next Act — BUILD-time task |
| **completionState** | string | live | active │ complete |
| **sharedContacts[]** | string[] | stub | [MULTI-USER] accountability sharing |

**Chain (WOOP framework — array-indexed within Act)**

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **name** | string | live | — |
| **description** | string | live | — |
| **icon** | string | live | Ref to icon asset |
| **wish** | string | live | WOOP — exaggerated intention |
| **outcome** | string | live | WOOP — mental imagery |
| **obstacle** | string | live | WOOP — blocker identification |
| **plan{}** | object | live | WOOP — stages Quests, feeds SMARTER fields |
| **chainReward** | string | live | XP or item ref — granted on completion |
| **quests[]** | Quest[] | live | Array of Quest objects — array-indexed per D27 |
| **completionState** | string | live | active │ complete — cached derived state |

**Quest (SMARTER framework — array-indexed within Chain)**

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **name** | string | live | — |
| **description** | string | live | — |
| **icon** | string | live | Ref to icon asset |
| **completionState** | string | live | active │ complete │ failed |
| **specific{}** | object | live | SMARTER — target count, end state, or resource value |
| **measurable{}** | object | live | SMARTER — relevant task types that apply progress |
| **attainable{}** | object | live | SMARTER — prereq quests, 91-day feasibility check |
| **relevant{}** | object | live | SMARTER — stat group, resource, or custom tag |
| **timely{}** | object | live | SMARTER — Marker generation rules. Marker objects live here |
| **exigency{}** | object | live | SMARTER — how missed Markers are handled — BUILD-time task |
| **result{}** | object | live | SMARTER — reward grant and completion state handler |
| **milestones[]** | Milestone[] | live | Logged Milestone results — array-indexed |
| **questReward** | string | live | XP or item ref — granted on quest completion |

**Milestone (TaskTemplate type — array-indexed within Quest)**

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **questRef** | string | live | Parent Quest ref |
| **taskTemplateShape{}** | object | live | Inherits full TaskTemplate property shape — BUILD-time task |

**Marker (lives inside Quest.timely)**

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **questRef** | string | live | Parent Quest ref |
| **interval** | RecurrenceRule | live | Recurrence shape — D37. Anchor is Marker.lastFired |
| **taskTemplateRef** | string | live | Milestone TaskTemplate ref — instantiated when Marker fires |
| **lastFired** | date | live | Timestamp of last fire — serves as RecurrenceRule anchor |
| **nextFire** | date | live | Computed from lastFired and interval |
| **activeState** | boolean | live | Fires for life of Quest unless Quest completes or is paused |

---

### TASK / SCHEDULE CLUSTER

#### TaskTemplate

Universal task blueprint. Instanced into Tasks by Markers, FavouritesList, and RecommendationsLibrary. No UUID — lives inside parent objects. User custom templates in taskLibrary only — D34.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **name** | string | live | — |
| **description** | string | live | — |
| **icon** | string | live | Ref to icon asset |
| **taskType** | string | live | Enum — CHECK │ COUNTER │ SETS_REPS │ CIRCUIT │ DURATION │ TIMER │ RATING │ TEXT │ FORM │ CHOICE │ CHECKLIST │ SCAN │ LOG │ LOCATION_POINT │ LOCATION_TRAIL — D38 |
| **inputFields{}** | object | live | Typed input shape per taskType — D41. See Section 3a for full shapes. |
| **xpAward{}** | object | live | Partial StatGroup record — health, strength, agility, defense, charisma, wisdom point values. Sum = total XP. Custom template default: +5 to assigned stat group — D43 |
| **cooldown** | number│null | live | Minutes. null = no cooldown. Enables repeat-check patterns e.g. drink water every 4 hours. Future: fires notification in APP-STORE — D41 |
| **media** | string | live | Optional instructional content ref — video or image shown before completion. Not a capture type. |
| **items[]** | string[] | live | Optional Useable refs — items required for completion, enables inventory check |

#### RecurrenceRule

Custom lightweight recurrence definition. Used by PlannedEvent, Marker, and Resource Account bills/paydays. No RRULE dependency — D28, D37.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **frequency** | string | live | daily │ weekly │ monthly │ custom. daily = shorthand, days[] ignored. monthly uses parent seedDate or Marker.lastFired to resolve nth-weekday implicitly — D37 |
| **days[]** | string[] | live | Weekday strings — mon, tue, wed, thu, fri, sat, sun. Which weekdays fire within the period. Ignored for daily and monthly — D37 |
| **interval** | number | live | Every N periods — default 1 |
| **endsOn** | date | live | null = indefinite |
| **customCondition** | string | live | Optional expression for unusual patterns e.g. friday-13th |

#### Task

Live instance of a TaskTemplate. Execution unit. Lives in User.lists.gtdList[] or inside an Event. UUID needed for undo and quest logging.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **id** | string | live | uuid |
| **templateRef** | string | live | Ref to originating TaskTemplate |
| **completionState** | string | live | pending │ complete │ skipped |
| **completedAt** | date | live | Completion timestamp |
| **resultFields{}** | object | live | Recorded values matching inputFields shape of TaskTemplate — D41 |
| **attachmentRef** | string | live | Optional Attachment ref — user evidence on completion |
| **resourceRef** | string│null | live | Optional ref to Resource that contextualised completion. Enables +2 defense bonus routing and links task history back to resource log — D40 |
| **location{}** | object | live | Optional coordinates recorded during completion |
| **sharedWith** | string | stub | [MULTI-USER] push completion to contact QuickActionsEvent |

#### PlannedEvent

Self-contained schedule and task pool. Materialises into Events via midnight rollover per D14. Serves as both planned event and routine — D36. Same-day creation triggers immediate materialisation.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **id** | string | live | uuid |
| **name** | string | live | — |
| **description** | string | live | — |
| **icon** | string | live | Ref to icon asset |
| **color** | string | live | For calendar display |
| **seedDate** | date | live | First occurrence — serves as RecurrenceRule anchor for nth-weekday monthly resolution — D37 |
| **dieDate** | date | live | Optional end date for multi-day or one-off events |
| **recurrenceInterval** | RecurrenceRule | live | D37 — RecurrenceRule ref. seedDate is the anchor. |
| **activeState** | string | live | active │ sleep |
| **taskPool[]** | string[] | live | D07 — full set of interchangeable TaskTemplate refs |
| **taskList[]** | string[] | live | Current rotation pulled from pool — cursor tracking BUILD-time task |
| **conflictMode** | string | live | D08 — override │ shift │ truncate │ concurrent |
| **startTime** | string | live | HH:MM format |
| **endTime** | string | live | HH:MM format |
| **location{}** | object | live | Optional coordinates and place name — D20 |
| **sharedWith[]** | string[] | stub | [MULTI-USER] shared PlannedEvents between contacts |
| **pushReminder** | boolean | stub | [APP-STORE] push notification on startTime |

#### Event

Concrete execution record materialised from PlannedEvent. System log per D02 and D03. User can convert any past Event with location to an Experience post.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **id** | string | live | uuid |
| **eventType** | string | live | standard │ quickActions │ planned. Discriminator for UI rendering and history filtering — D44 |
| **plannedEventRef** | string | live | Optional — null for manually created events |
| **name** | string | live | — |
| **startDate** | date | live | — |
| **startTime** | string | live | HH:MM format |
| **endDate** | date | live | For multi-day events |
| **endTime** | string | live | HH:MM format |
| **tasks[]** | string[] | live | Task instance refs |
| **completionState** | string | live | pending │ complete │ skipped |
| **xpAwarded** | number | live | Sum of completed task XP |
| **attachments[]** | string[] | live | Attachment refs — max 5, max 200KB each per D09 |
| **location{}** | object | live | Optional coordinates and place name — D20 |
| **note** | string | live | Optional freetext |
| **sharedWith[]** | string[] | stub | [MULTI-USER] contact-scoped world view visibility |
| **coAttendees[]** | string[] | stub | [MULTI-USER] completed-together events |

#### QuickActionsEvent

Daily singleton receiving quick-fire completions from favouritesList and gtdList. Date-keyed per D12. Lives in User.events.active[] during the day, moves to history[] at midnight rollover.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **id** | string | live | qa-{YYYY-MM-DD} — date-keyed singleton per D12 |
| **eventType** | string | live | quickActions — matches Event.eventType discriminator — D44 |
| **date** | date | live | — |
| **completions[]** | object[] | live | Each: Task ref, completedAt timestamp. User-editable and deletable. Completions award +2 agility bonus — D39 |
| **xpAwarded** | number | live | Running daily total |
| **sharedCompletions[]** | object[] | stub | [MULTI-USER] pushed to contact QuickActionsEvent |

---

### RESOURCE CLUSTER

#### Resource

Parent object for all real-world resources. Type-specific data lives in meta{}. Each resource type generates a specific task category via prebuilt templates in RecommendationsLibrary — D42.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **id** | string | live | uuid |
| **name** | string | live | — |
| **icon** | string | live | Ref to icon asset |
| **description** | string | live | — |
| **type** | string | live | contact │ home │ vehicle │ account │ inventory │ doc |
| **attachments[]** | string[] | live | Attachment refs — optional |
| **log[]** | object[] | live | Each entry: note (string), timestamp (date), taskRef (optional Task ref) |
| **meta{}** | object | live | Type-specific shape — see below |

**Resource meta{} shapes by type**

**Contact meta** — generates: birthday task

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **info{}** | object | live | Flexible data bag — birthday, phone, email, address, customFields. Designed for MULTI-USER extension where fields pull from shared user state |
| **customTag** | string | live | User-defined tag |
| **groups[]** | string[] | live | Group membership strings |
| **notes** | string | live | Freetext notes |

**Home meta** — generates: chore tasks

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **memberContactRefs[]** | string[] | live | Contact Resource refs for household members |
| **rooms[]** | object[] | live | Each: id, name, icon, assignedTo (string[]│'all'), linkedDocs[], linkedLayoutRef (Doc ref│null) |
| **linkedInventoryRef** | string | live | Linked Inventory Resource ref. Layout Doc is the bridge between inventory items and physical space. |
| **linkedDocs[]** | string[] | live | Lease, photos, and other Doc refs |
| **recurringTasksStub** | object | stub | [MULTI-USER] Home-generated recurring tasks via TaskTemplate refs |

**Vehicle meta** — generates: maintenance tasks

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **make** | string | live | Vehicle make |
| **model** | string | live | Vehicle model |
| **year** | number | live | Vehicle year |
| **mileage** | number│null | live | Current mileage |
| **memberContactRefs[]** | string[] | live | Contact Resource refs for vehicle users |
| **linkedDocs[]** | string[] | live | Loan doc, photos, insurance refs |
| **recurringTasksStub** | object | stub | [MULTI-USER] Vehicle-generated recurring tasks via TaskTemplate refs |

**Account meta** — generates: transaction tasks

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **kind** | string | live | bank │ bill │ income │ debt │ subscription │ allowance |
| **linkedAccountRef** | string│null | live | Points bill/income/allowance at a bank account Resource |
| **linkedResourceRef** | string│null | live | Optional — Home, Vehicle, or Contact context |
| **linkedDocs[]** | string[] | live | Lease, contract, loan doc refs |
| **balance** | number | live | Running balance — user can override |
| **balanceOverriddenAt** | date│null | live | Audit trail on manual override |
| **recurrenceRuleRef** | string│null | live | For bill, income, allowance — recurring schedule |
| **amount** | number│null | live | Expected recurring amount |
| **pendingTransactions[]** | object[] | live | Each: id, date, amount?, description, sourceRef? (shopping list), assignedAccountRef?, status (pending│assigned│posted) |
| **transactionTaskRef** | string│null | live | Prebuilt TaskTemplate ref — generates transaction task |

**Shopping list → pending transaction flow:**
1. User checks item off shoppingList → pushed to pendingTransactions[] as `pending`
2. User assigns to account → status `assigned`
3. Transaction task completion → status `posted`

**Inventory meta** — generates: replenish tasks

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **containers[]** | object[] | live | Each: id, name, icon, linkedResourceRef (any Resource — Home/Vehicle/Contact for lending, null = standalone), notes? |
| **items[]** | object[] | live | Each: useableRef, containerId (null = uncontained), quantity |

**Doc meta** — no task generation

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **docType** | string | live | text │ pdf │ contract │ manual │ layout │ course │ walkthrough |
| **content** | string | live | Rich text — for text type docs |
| **linkedResourceRef** | string│null | live | For manuals, contracts, layouts — links to owning Resource |
| **courseRef** | string│null | live | RecommendationsLibrary course ref — for course type docs |
| **progression{}** | object | live | Locked progression state for course docs — BUILD-time task |
| **tags[]** | string[] | live | — |
| **createdAt** | date | live | — |
| **updatedAt** | date | live | — |

**Resource-generates-task pattern**

Tasks completed in resource context award +2 defense bonus per D39.

| **Resource** | **Generates** | **TaskType** |
| --- | --- | --- |
| Contact | birthday task | CHECK with annual recurrence |
| Home | chore tasks | CHECK / CHECKLIST |
| Vehicle | maintenance tasks | CHECKLIST / LOG |
| Account | transaction tasks | LOG |
| Inventory | replenish tasks | COUNTER |
| Doc | no task generation | — |

---

### STUBS · APP-STORE

#### EventCenter (stub)

Public-facing Experience post hub. Hosts user-authored Experience content only. Distinct from Leaderboard — D45. Null in LOCAL per D25. Activated in APP-STORE.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **id** | string | stub | uuid — stub |
| **activeState** | boolean | stub | [APP-STORE] full public activation |
| **experienceBoard** | string | stub | [APP-STORE] ExperienceBoard ref |

#### ExperienceBoard (stub)

Holds and sorts Experience posts by relevance. Null in LOCAL per D25. Activated in APP-STORE.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **id** | string | stub | uuid — stub |
| **experiences[]** | string[] | stub | [APP-STORE] Experience ItemTemplate refs |
| **sortRule{}** | object | stub | [APP-STORE] relevance sort algorithm — BUILD-time task |

#### Leaderboard (stub)

Competitive task completion ranking. Opt-in data reporting. Level gated. Distinct from EventCenter which hosts Experience posts — D45. Stub in LOCAL. Friends leaderboard activated in MULTI-USER. Global and challenge activated in APP-STORE.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **id** | string | stub | uuid — stub |
| **type** | string | stub | global │ friends │ challenge — D45 |
| **entries[]** | object[] | stub | Each: userRef, value, timestamp, anonymised (boolean). Non-opted users appear as anonymous figures on global board |
| **levelGate** | number | stub | [APP-STORE] minimum user level to access leaderboard UI — BUILD-time task |
| **activeChallenge** | object | stub | [APP-STORE] current Challenge ref |

#### Challenge (stub)

Weekly rotating competitive event preset and curated by developer. Users opt in to share task completion data. Placement grants bonus XP. Lives in Leaderboard — D45.

| **Property** | **Type** | **State** | **Note** |
| --- | --- | --- | --- |
| **id** | string | stub | uuid — stub |
| **startDate** | date | stub | [APP-STORE] challenge window open |
| **endDate** | date | stub | [APP-STORE] challenge window close |
| **taskTemplateRefs[]** | string[] | stub | [APP-STORE] 2–3 prebuilt TaskTemplate refs per week e.g. most km walked, most meals logged, most agility XP earned |
| **metric** | string | stub | [APP-STORE] distance │ count │ xp │ duration |
| **entries[]** | object[] | stub | [APP-STORE] each: userRef, value, timestamp |
| **placementRewards[]** | object[] | stub | [APP-STORE] XP or item rewards by placement — ties into D43 XP model |

---

## 3a. inputFields Shapes by TaskType

Full typed input shapes per TaskType — D38, D41. These define what the user fills in on completion and what gets written to Task.resultFields{}.

| **TaskType** | **inputFields shape** |
| --- | --- |
| **CHECK** | `note: string│null` |
| **COUNTER** | `target: number, increment: number (default 1), unit: string│null` |
| **SETS_REPS** | `sets: [{reps: number, weight: number│null, unit: kg│lb, restAfter: number│null}], dropSet: boolean, restTimer: number│null` |
| **CIRCUIT** | `rounds: number (default 1), steps: [{name, taskType, inputFields{}, media: string│null, restAfter: number│null}], restBetweenRounds: number│null` |
| **DURATION** | `duration: number (minutes), note: string│null` |
| **TIMER** | `targetDuration: number (seconds), actualDuration: number` |
| **RATING** | `scale: number, value: number, label: string│null` |
| **TEXT** | `prompt: string│null, value: string` |
| **FORM** | `fields: [{id, label, fieldType: text│number│choice│rating│boolean, required, options: string[]│null}], courseRef: string│null, responses: {}` |
| **CHOICE** | `options: string[], emojiMode: boolean, multiSelect: boolean, selected: string[]` |
| **CHECKLIST** | `items: [{id, label, checked: boolean}], requireAll: boolean` |
| **SCAN** | `scanType: barcode│qr│receipt, value: string, resourceRef: string│null` |
| **LOG** | `prompt: string│null, value: string, resourceRef: string│null, amount: number│null, unit: string│null` |
| **LOCATION_POINT** | `coordinates: {lat, lng}, placeName: string│null, note: string│null` |
| **LOCATION_TRAIL** | `polyline: [{lat, lng, timestamp}], distance: number (metres), duration: number (seconds), elevationGain: number│null, startPoint: {lat, lng}, endPoint: {lat, lng}` |

Notes:
- CIRCUIT steps can contain any taskType except CIRCUIT — no nesting
- CIRCUIT.restAfter on a step = passive rest. A TIMER step = active countdown the user watches
- FORM.courseRef links to Doc.courseRef when used as a course quiz
- CHOICE absorbs CHOICE_EMOJI via emojiMode flag
- SCAN.resourceRef and LOG.resourceRef = write destination. Task.resourceRef = completion context. Both can coexist and often share the same value.

---

## 4. XP Model

Full XP model — D39, D43.

**Base XP** — set on TaskTemplate at creation. Sum of all stat group values = total XP pushed to UserStats.xp.

| **Stat group** | **Natural task affinities** |
| --- | --- |
| health | CHECK, COUNTER, TIMER, DURATION, LOG, SCAN |
| strength | SETS_REPS, CIRCUIT, COUNTER |
| agility | DURATION, TIMER, LOCATION_TRAIL, LOCATION_POINT |
| defense | CHECKLIST, FORM, SCAN, LOG |
| charisma | CHOICE, TEXT, RATING, LOG |
| wisdom | TEXT, FORM, RATING, CHECKLIST, DURATION |

Custom template default: **+5 to assigned stat group**. Prebuilt templates have tuned values.

**Context bonuses** — applied at Task.complete(), additive:

| **Context** | **Bonus** |
| --- | --- |
| QuickActions completion | +2 agility |
| Resource completion | +2 defense |
| Talent tree tier unlock | +1 to specific stat group per node |

**Multipliers:**

| **Trigger** | **Multiplier** |
| --- | --- |
| 3-day streak | ×3 total XP |
| Early bird mode | ×2 task XP (time window BUILD-time task) |
| Multiplicative stacking | talent tree unlock reward — additive by default |

**Level curve** — RuneScape exponential shape. Level 99 ≈ halfway to level 100 in XP. Threshold table lives in CharacterLibrary Coach bundle. UserStats.level is cached — derived at runtime, never source of truth.

**Talent tree** — WoW-style 6 trees × 5 tiers. Spend points to unlock tier; each tier grants a specific named enhancement. Enhancement catalogue in Coach bundle — BUILD-time task. 1 talentPoint per 100 statPoints earned.

---

## 5. Architecture Decisions

Decisions D01–D25 recorded in the project handoff document. D26–D36 recorded in v0.1 of this document.

| **Ref** | **Decision** |
| --- | --- |
| **D26** | Settings.coachPreferences.tone is the source of truth for Coach tone. Coach reads it at call time. |
| **D27** | Act gets UUID v4. Chain, Quest, and Milestone are array-indexed within their parent. No independent IDs below Act level. |
| **D28** | RecurrenceRule is a custom lightweight object. No RRULE dependency. Extensible for unusual patterns. |
| **D29** | Three storage tiers: APP BUNDLE, DEVICE (localStorage), CLOUD (MULTI-USER mirror). |
| **D30** | Coach and static libraries live in APP BUNDLE, not localStorage. |
| **D31** | User.system.wrappedAnchor gates annual wrapped review at 365 days. User-editable after first wrapped completes. |
| **D32** | User has a dedicated schedule{} sub-object holding PlannedEvent refs. Distinct from events{}. |
| **D33** | Routine originally planned as distinct object. Superseded by D36. |
| **D34** | User.lists.taskLibrary[] holds user-created custom TaskTemplates only. |
| **D35** | TalentTree tier definitions live in Coach app bundle. UserStats.talentTree{} holds user unlocked state only. |
| **D36** | Routine is not a separate object. PlannedEvent is the universal schedule object. Distinction is UI-level only. |
| **D37** | RecurrenceRule anchor inherited from parent context — PlannedEvent.seedDate or Marker.lastFired. daily is a valid frequency shorthand. monthly uses seedDate for nth-weekday resolution implicitly. |
| **D38** | TaskType enum confirmed at 15 types — CHECK, COUNTER, SETS_REPS, CIRCUIT, DURATION, TIMER, RATING, TEXT, FORM, CHOICE, CHECKLIST, SCAN, LOG, LOCATION_POINT, LOCATION_TRAIL. |
| **D39** | XP bonus model — +2 agility on QuickActions completion, +2 defense on Resource completion, talent tree tier enhancements. |
| **D40** | Task.resourceRef added — optional resource context field for completion bonus routing and resource log linking. |
| **D41** | inputFields shapes confirmed for all 15 TaskTypes. TaskTemplate.cooldown added (minutes│null). CIRCUIT gets rounds + restBetweenRounds. SETS_REPS gets dropSet + restAfter. |
| **D42** | ResourceMeta shapes confirmed for all 6 types. Contact info{} replaces birthday field. Home rooms redesigned. Vehicle gets make/model/year/mileage. Account redesigned with kind discriminator and pendingTransactions[]. Inventory containers support any Resource as linkedResourceRef. Doc gets walkthrough type. Resource-generates-task pattern documented. |
| **D43** | XP model confirmed — RuneScape level curve, WoW talent tree, additive multipliers by default, multiplicative stacking as talent unlock. No cap on multiplier stacking. Custom task default +5 stat XP set at creation. |
| **D44** | Zustand store topology confirmed — 5 stores, Coach as pure function engine with no store. Event.eventType discriminator added. QuickActionsEvent confirmed as Event subtype living in active[] during day. |
| **D45** | Storage scaling confirmed — localStorage default, optional cloud sync in MULTI-USER, user owns data throughout. Leaderboard and EventCenter are distinct objects. Challenge object defined. Weekly rotation preset by developer. Level gate on leaderboard. Anonymous figures for non-opted global board users. |

---

## 6. Zustand Store Topology

Zustand sits between localStorage and React components. On every state change, Zustand writes to the store (components re-render instantly) and to localStorage (persists for next session). On app open, the Session Manager reads localStorage and hydrates the Zustand stores — components never read localStorage directly.

```
localStorage          persistence layer — survives sessions
     ↕
Zustand stores        reactive memory — components subscribe
     ↕
React components      re-render on subscribed state change
```

### Five Stores

**useSystemStore**
- Contents: Settings, session metadata, rollover timestamp
- Persistence: localStorage only in LOCAL. In MULTI-USER, also syncs lastRollover timestamp to cloud for multi-device coordination — prevents double-rollover when user opens app on two devices same day.
- Never holds game data. Never syncs user content.

**useUserStore**
- Contents: User, UserStats, Avatar, BadgeBoard, Equipment, Feed
- Feed lives here — it is the user's mailbox. Coach reads and writes it but does not own it.
- Persistence: localStorage → cloud sync in MULTI-USER

**useProgressionStore**
- Contents: Acts (with nested Chains, Quests, Milestones, Markers)
- Markers are virtual — evaluated at rollover, not subscribed to by components directly.
- Persistence: localStorage → cloud sync in MULTI-USER

**useScheduleStore**
- Contents: PlannedEvents, Events (active[] and history[]), QuickActionsEvent, Tasks, TaskTemplates (user custom only — D34)
- QuickActionsEvent lives in active[] during the day. Moves to history[] at midnight rollover.
- Persistence: localStorage → cloud sync in MULTI-USER

**useResourceStore**
- Contents: Resources (all 6 types), Useables, Attachments, Badges, Gear
- Avatar and BadgeBoard in useUserStore hold refs into this store for rendering.
- Persistence: localStorage → cloud sync in MULTI-USER

### Coach — No Store

Coach is a pure function engine. It reads from the Zustand stores and returns results. It never owns state and has no Zustand store. It lives in the APP BUNDLE.

```
Coach.checkAchievements(user)   reads useUserStore
Coach.ribbet(context)           reads useUserStore, useScheduleStore
Coach.review(user, period)      reads all stores
```

### Cross-Store Communication

The rollover engine orchestrates across stores once at midnight. Components do not subscribe across store boundaries.

```
Midnight rollover (useSystemStore orchestrates):
  reads  useProgressionStore   → find due Markers
  writes useScheduleStore      → create Task instances, materialise Events
  writes useUserStore          → push Feed entries
  writes useSystemStore        → update lastRollover timestamp

Task completion (useScheduleStore):
  writes useScheduleStore      → update Task.completionState
  writes useUserStore          → push XP to UserStats via getState()
  side effect → Coach.checkAchievements() if milestone threshold met
```

Cross-slice reads use Zustand's `getState()` pattern — one slice reads another without subscribing to it. No circular dependency.

### LOCAL → MULTI-USER Scaling Pattern

The sync boundary is clean — no store refactoring needed. Swap the persistence middleware per store.

| **Store** | **LOCAL** | **MULTI-USER** |
| --- | --- | --- |
| useSystemStore | localStorage only | localStorage + cloud sync (timestamps only) |
| useUserStore | localStorage only | localStorage + dual-write cloud middleware |
| useProgressionStore | localStorage only | localStorage + dual-write cloud middleware |
| useScheduleStore | localStorage only | localStorage + dual-write cloud middleware |
| useResourceStore | localStorage only | localStorage + dual-write cloud middleware |

**Server holds in MULTI-USER:** auth tokens, user index for contact discovery, leaderboard snapshots (opt-in, APP-STORE). No game data stored server-side. User owns their data throughout all chapters.

---

## 7. System Processes

Runtime processes — not domain objects. Do not appear in localStorage. Documented here as architectural context.

### Rollover Engine (D14 — 9-step midnight sequence)

Runs at midnight (or on app open if missed). App resets at midnight — last login was yesterday is handled on app open by comparing lastRollover timestamp.

| **Step** | **Action** |
| --- | --- |
| **1** | Read User.schedule.planned[] — identify PlannedEvents due today |
| **2** | Resolve conflicts per conflictMode (override │ shift │ truncate │ concurrent) — D08 |
| **3** | Materialise PlannedEvents → create Event instances in User.events.active[] |
| **4** | Pull taskList from taskPool for each new Event — D07 |
| **5** | Evaluate all active Markers — check nextFire threshold |
| **6** | Fire due Markers → instantiate TaskTemplates → push Tasks to User.lists.gtdList[] |
| **7** | Move completed Events from active[] to history[]. Move QuickActionsEvent to history[]. |
| **8** | Update RecurrenceRules — compute next seedDate for recurring PlannedEvents |
| **9** | Coach.review() — queue ribbet messages, check achievements, push Feed entries |

### Session Manager

Boots app, reads localStorage, hydrates Zustand stores. Handles missed rollover detection by comparing lastRollover timestamp to current date — runs catch-up sequence if needed. Auth wraps around User naturally in MULTI-USER.

---

*CAN-DO-BE · LOCAL CHAPTER · STORAGE SCHEMA · v0.2 · 2026-03-18*
