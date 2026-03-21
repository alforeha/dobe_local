# OOD — OBJECT ORIENTED DESIGN
## CAN-DO-BE

<!-- OOD
project: CAN-DO-BE
chapter: LOCAL
version: 0.2
stack: React, Vite, TypeScript, Zustand, Capacitor
current_build: MVP05
updated: 2026-03-18
-->

---

## OBJECT MODEL

```json
{
  "objects": [
    {
      "id": "OBJ_settings",
      "name": "Settings",
      "type": "SYSTEM",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Holds all user-controlled application preferences. Singleton \u2014 no id needed.",
      "properties": [
        {
          "name": "timePreferences",
          "type": "object",
          "note": "live \u2014 dayStart, weekStart"
        },
        {
          "name": "coachPreferences",
          "type": "object",
          "note": "live \u2014 tone, trackingSettings, character (default|string)"
        },
        {
          "name": "displayPreferences",
          "type": "object",
          "note": "live \u2014 mode (light|dark), theme (default|string). App checks user theme first; if default, defers to Coach.activeTheme"
        },
        {
          "name": "socialPreferences",
          "type": "object",
          "note": "[MULTI-USER] stub null in LOCAL"
        },
        {
          "name": "notificationPreferences",
          "type": "object",
          "note": "[APP-STORE] stub null in LOCAL"
        },
        {
          "name": "storagePreferences",
          "type": "object",
          "note": "[MULTI-USER] provider, lastSynced, cloudRef. In MULTI-USER useSystemStore also syncs to cloud for multi-device timestamp coordination"
        }
      ],
      "methods": [
        {
          "name": "get",
          "params": "key: string",
          "returns": "any"
        },
        {
          "name": "set",
          "params": "key: string, value: any",
          "returns": "void"
        },
        {
          "name": "reset",
          "returns": "void"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "User",
          "note": "preferences configure and serve the User"
        },
        {
          "type": "references",
          "target": "Coach",
          "note": "coachPreferences.tone read by Coach at call time \u2014 D26"
        }
      ],
      "open_questions": [
        "Paid theme always overrides Coach.activeTheme. Coach.activeTheme applies to default theme users only. Mechanism confirmed \u2014 no further design needed in LOCAL."
      ]
    },
    {
      "id": "OBJ_user",
      "name": "User",
      "type": "CORE",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Root owner of all user account data. Identity, progression, goals, schedule, events, lists, and resources. Singleton per device.",
      "properties": [
        {
          "name": "system",
          "type": "object",
          "note": "live \u2014 id (uuid), displayName (settable annually), wrappedAnchor (date, gates annual Coach review \u2014 D31), auth (stub null [MULTI-USER])"
        },
        {
          "name": "personal",
          "type": "object",
          "note": "live \u2014 nameFirst, nameLast, handle, birthday. User controls what surfaces in publicProfile"
        },
        {
          "name": "progression",
          "type": "object",
          "note": "live \u2014 stats (UserStats ref), avatar (Avatar ref), badgeBoard (BadgeBoard ref), equipment (Equipment ref), gold (number), statGroups (health, strength, agility, defense, charisma, wisdom), talentTree (stub null [future])"
        },
        {
          "name": "goals",
          "type": "object",
          "note": "live \u2014 habitats[] (Act refs \u2014 user-created), adventures[] (Act refs \u2014 Coach managed)"
        },
        {
          "name": "schedule",
          "type": "object",
          "note": "live \u2014 planned[] (PlannedEvent refs), routines[] (PlannedEvent refs). D36 \u2014 both are PlannedEvents, distinction is UI-level only. D32"
        },
        {
          "name": "events",
          "type": "object",
          "note": "live \u2014 active[] (Event refs pushed by rollover, includes QuickActionsEvent), history[] (Event refs moved here on completion \u2014 D02, D03)"
        },
        {
          "name": "lists",
          "type": "object",
          "note": "live \u2014 taskLibrary[] (user custom TaskTemplate refs \u2014 D34), favouritesList[] (TaskTemplate refs), gtdList[] (Task refs \u2014 D05), shoppingLists[] (tagged item lists)"
        },
        {
          "name": "resources",
          "type": "object",
          "note": "live \u2014 homes[], vehicles[], contacts[], accounts[], inventory[], docs[] (Resource refs)"
        },
        {
          "name": "feed",
          "type": "Feed",
          "note": "live \u2014 Feed ref. User mailbox. Coach reads and writes ribbet and comment blocks into Feed entries. Feed belongs to User not Coach."
        },
        {
          "name": "publicProfile",
          "type": "object",
          "note": "[MULTI-USER] stub null \u2014 displayName, icon, optional personal fields. Default anonymous if nothing shared"
        }
      ],
      "methods": [
        {
          "name": "setPersonal",
          "params": "fields: object",
          "returns": "void"
        },
        {
          "name": "setSystem",
          "params": "fields: object",
          "returns": "void",
          "note": "handle and wrappedAnchor editable \u2014 wrappedAnchor only after first wrapped completes"
        },
        {
          "name": "addToTaskLibrary",
          "params": "template: TaskTemplate",
          "returns": "void"
        },
        {
          "name": "removeFromTaskLibrary",
          "params": "id: string",
          "returns": "void"
        },
        {
          "name": "addToFavourites",
          "params": "template: TaskTemplate",
          "returns": "void"
        },
        {
          "name": "removeFromFavourites",
          "params": "id: string",
          "returns": "void"
        },
        {
          "name": "addToShopping",
          "params": "item: string",
          "returns": "void"
        },
        {
          "name": "removeFromShopping",
          "params": "id: string",
          "returns": "void"
        },
        {
          "name": "addHabitat",
          "params": "act: Act",
          "returns": "void"
        },
        {
          "name": "removeHabitat",
          "params": "id: string",
          "returns": "void"
        },
        {
          "name": "addResource",
          "params": "type: string, data: object",
          "returns": "void"
        },
        {
          "name": "removeResource",
          "params": "type: string, id: string",
          "returns": "void"
        }
      ],
      "relationships": [
        {
          "type": "has",
          "target": "UserStats"
        },
        {
          "type": "has",
          "target": "Avatar"
        },
        {
          "type": "has",
          "target": "BadgeBoard"
        },
        {
          "type": "has",
          "target": "Equipment"
        },
        {
          "type": "has",
          "target": "Feed"
        },
        {
          "type": "contains",
          "target": "Event"
        },
        {
          "type": "contains",
          "target": "Resource"
        },
        {
          "type": "contains",
          "target": "PlannedEvent"
        },
        {
          "type": "references",
          "target": "Settings"
        }
      ],
      "open_questions": [
        "Annual wrapped: Coach gates review until 365 days from wrappedAnchor. User can change wrappedAnchor after first review completes \u2014 D31.",
        "Contact discovery via user id or QR code. Social graph and shared content between contacts deferred to MULTI-USER."
      ]
    },
    {
      "id": "OBJ_user_stats",
      "name": "UserStats",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Tracks XP, level, streaks, completion counters, stat group progression, and talent tree unlocked state for the user.",
      "properties": [
        {
          "name": "xp",
          "type": "number",
          "note": "total XP earned \u2014 level derived from this at runtime via RuneScape exponential curve. Level 99 is approximately halfway to level 100 in XP terms \u2014 D43"
        },
        {
          "name": "level",
          "type": "number",
          "note": "cached \u2014 derived from XP at runtime against threshold table in Coach bundle. Never source of truth \u2014 D43"
        },
        {
          "name": "talentPoints",
          "type": "number",
          "note": "unspent balance \u2014 1 point per 100 statPoints earned"
        },
        {
          "name": "milestones",
          "type": "object",
          "note": "live \u2014 streakCurrent (login-based), streakBest, questsCompleted, tasksCompleted"
        },
        {
          "name": "talents",
          "type": "object",
          "note": "live \u2014 health{}, strength{}, agility{}, defense{}, charisma{}, wisdom{}. Each: statPoints (number), xpEarned (number), tier (number 0-5)"
        },
        {
          "name": "talentTree",
          "type": "object",
          "note": "live \u2014 user unlocked state only. WoW-style tiered tree: 6 trees x 5 tiers. Tier definitions and enhancement catalogue in Coach bundle \u2014 D35, D43"
        }
      ],
      "methods": [
        {
          "name": "addXP",
          "params": "amount: number",
          "returns": "void"
        },
        {
          "name": "pushStatXP",
          "params": "stat: string, amount: number",
          "returns": "void",
          "note": "routes xp to correct talent group on task completion"
        },
        {
          "name": "applyBonus",
          "params": "context: string",
          "returns": "number",
          "note": "applies context bonuses: +2 agility (QuickActions), +2 defense (Resource). Checks talent tree for bonus enhancements \u2014 D39, D43"
        },
        {
          "name": "applyMultiplier",
          "params": "base: number",
          "returns": "number",
          "note": "applies streak and early bird multipliers. Additive by default. Multiplicative stacking unlockable via talent tree \u2014 D43"
        },
        {
          "name": "checkLevelUp",
          "returns": "boolean"
        },
        {
          "name": "updateStreak",
          "params": "date: date",
          "returns": "void"
        },
        {
          "name": "assignTalentPoint",
          "params": "stat: string, tier: number",
          "returns": "void"
        },
        {
          "name": "clearTalentTree",
          "params": "stat: string",
          "returns": "void",
          "note": "reclaims talentPoints to unspent balance"
        }
      ],
      "relationships": [
        {
          "type": "subscribes",
          "target": "Task",
          "note": "receives statXP push on task completion"
        },
        {
          "type": "references",
          "target": "CharacterLibrary",
          "note": "XP threshold table and talent tree definitions read from Coach bundle"
        }
      ],
      "open_questions": [
        "XP threshold table values are a BUILD-time task \u2014 RuneScape curve shape confirmed, exact numbers TBD.",
        "Early bird mode time window is a BUILD-time task.",
        "Streak multiplier: x3 at 3-day streak confirmed. Additional streak tiers BUILD-time task.",
        "Talent tree enhancement catalogue is a BUILD-time task \u2014 D43."
      ]
    },
    {
      "id": "OBJ_avatar",
      "name": "Avatar",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Visual representation of the user. Visual state derived at runtime from XP and level thresholds. Stores equipped gear slot refs and slot taxonomy reference only.",
      "properties": [
        {
          "name": "equippedGear",
          "type": "object",
          "note": "live \u2014 keyed by slot. Slot taxonomy is a BUILD-time task"
        },
        {
          "name": "slotTaxonomyRef",
          "type": "string",
          "note": "live \u2014 references slot taxonomy version in Coach app bundle"
        },
        {
          "name": "publicVisibility",
          "type": "boolean",
          "note": "[MULTI-USER] stub null \u2014 avatar visible on public profile"
        },
        {
          "name": "additionalAnimations",
          "type": "array",
          "note": "[APP-STORE] stub null \u2014 poses, animation states, prestige engine. Arc: tree \u2192 burns \u2192 egg \u2192 phoenix"
        }
      ],
      "methods": [
        {
          "name": "equipGear",
          "params": "slot: string, gearId: string",
          "returns": "void"
        },
        {
          "name": "unequipGear",
          "params": "slot: string",
          "returns": "void"
        },
        {
          "name": "getEquipped",
          "returns": "object"
        },
        {
          "name": "getVisualState",
          "returns": "string",
          "note": "derived at runtime from UserStats.xp \u2014 seed to tree arc in LOCAL"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "Equipment"
        },
        {
          "type": "references",
          "target": "CharacterLibrary"
        }
      ],
      "open_questions": [
        "Slot taxonomy definition is a BUILD-time task.",
        "Prestige engine (burns \u2192 egg \u2192 phoenix) deferred to APP-STORE."
      ]
    },
    {
      "id": "OBJ_badge_board",
      "name": "BadgeBoard",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Holds earned badges awaiting claim and manages the user-curated pinned display. Coach checks earned[] on session open.",
      "properties": [
        {
          "name": "earned",
          "type": "array",
          "note": "live \u2014 Badge refs awarded but not yet placed by user"
        },
        {
          "name": "pinned",
          "type": "array",
          "note": "live \u2014 Badge refs placed on board by user"
        },
        {
          "name": "publicVisibility",
          "type": "boolean",
          "note": "[MULTI-USER] stub null \u2014 feed notification when badge earned. Board not publicly viewable"
        }
      ],
      "methods": [
        {
          "name": "claimBadge",
          "params": "badgeId: string",
          "returns": "void"
        },
        {
          "name": "pin",
          "params": "badgeId: string",
          "returns": "void"
        },
        {
          "name": "unpin",
          "params": "badgeId: string",
          "returns": "void"
        }
      ],
      "relationships": [
        {
          "type": "contains",
          "target": "Badge"
        },
        {
          "type": "references",
          "target": "Coach",
          "note": "Coach checks earned[] on session open and prompts claim if not empty"
        }
      ],
      "open_questions": []
    },
    {
      "id": "OBJ_equipment",
      "name": "Equipment",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Passive inventory list of Gear ids owned by the user. Definitions live in Coach app bundle. Populated by Coach drops.",
      "properties": [
        {
          "name": "equipment",
          "type": "array",
          "note": "live \u2014 Gear id refs. Visual definitions resolved from CharacterLibrary at runtime"
        },
        {
          "name": "storeUnlocks",
          "type": "array",
          "note": "[APP-STORE] stub null \u2014 Gear id refs available via store purchase"
        }
      ],
      "methods": [
        {
          "name": "add",
          "params": "gearId: string",
          "returns": "void"
        },
        {
          "name": "getByType",
          "params": "type: string",
          "returns": "Gear[]",
          "note": "reads definitions from Coach bundle to filter"
        }
      ],
      "relationships": [
        {
          "type": "contains",
          "target": "Gear"
        },
        {
          "type": "references",
          "target": "CharacterLibrary"
        }
      ],
      "open_questions": []
    },
    {
      "id": "OBJ_feed",
      "name": "Feed",
      "type": "CORE",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "User mailbox and activity stream. Receives pushed entries from Coach, task completions, badge awards, and level-ups. Belongs to User \u2014 Coach reads and writes but does not own it.",
      "properties": [
        {
          "name": "entries",
          "type": "array",
          "note": "live \u2014 each entry: commentBlock (string), sourceType (string), timestamp (date), triggerRef (optional ref)"
        },
        {
          "name": "unreadCount",
          "type": "number",
          "note": "live \u2014 UI unread indicator, reset on markRead()"
        },
        {
          "name": "sharedActivityEntries",
          "type": "array",
          "note": "[MULTI-USER] stub null \u2014 pushed from contact activity, badge notifications, quest completion updates"
        }
      ],
      "methods": [
        {
          "name": "push",
          "params": "entry: object",
          "returns": "void"
        },
        {
          "name": "getRecent",
          "params": "count: number",
          "returns": "object[]"
        },
        {
          "name": "markRead",
          "returns": "void"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "Coach",
          "note": "Coach reads mailbox and writes ribbet entries"
        },
        {
          "type": "references",
          "target": "Event",
          "note": "Feed entries triggered by Event and task completion side effects"
        }
      ],
      "open_questions": []
    },
    {
      "id": "OBJ_item_template",
      "name": "ItemTemplate",
      "type": "CORE",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Universal parent for all reward item types. Extended by Badge, Gear, Useable, Attachment, and Experience per D21.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid"
        },
        {
          "name": "type",
          "type": "string",
          "note": "badge | gear | useable | attachment | experience"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "icon",
          "type": "string",
          "note": "ref to icon asset in CharacterLibrary app bundle"
        },
        {
          "name": "source",
          "type": "string",
          "note": "origin \u2014 Coach drop, store, quest reward"
        },
        {
          "name": "contents",
          "type": "object",
          "note": "live \u2014 type-specific shape defined per child type"
        }
      ],
      "methods": [
        {
          "name": "describe",
          "returns": "string"
        },
        {
          "name": "getIcon",
          "returns": "string",
          "note": "resolves icon ref from CharacterLibrary"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "CharacterLibrary",
          "note": "icon assets read from CharacterLibrary in Coach app bundle"
        },
        {
          "type": "references",
          "target": "User",
          "note": "items owned by User via Equipment, BadgeBoard, and inventory"
        }
      ],
      "open_questions": []
    },
    {
      "id": "OBJ_badge",
      "name": "Badge",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Reward token earned by completing achievements. Placed and curated on BadgeBoard by the user.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid"
        },
        {
          "name": "contents",
          "type": "object",
          "note": "achievementRef (AchievementDefinition ref \u2014 reads icon and sticker from AchievementLibrary), awardedDate (timestamp), location (null = unclaimed | {x,y} = placed | claimed = removed from board)"
        }
      ],
      "methods": [
        {
          "name": "place",
          "params": "position: object",
          "returns": "void",
          "note": "sets location to {x,y}"
        },
        {
          "name": "remove",
          "returns": "void",
          "note": "sets location to claimed"
        }
      ],
      "relationships": [
        {
          "type": "extends",
          "target": "ItemTemplate"
        },
        {
          "type": "references",
          "target": "AchievementLibrary",
          "note": "reads icon and sticker via achievementRef"
        }
      ],
      "open_questions": []
    },
    {
      "id": "OBJ_gear",
      "name": "Gear",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Wearable reward item equipped to Avatar slots. Grants xpBoost when equipped. Visual asset resolved from CharacterLibrary.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid"
        },
        {
          "name": "contents",
          "type": "object",
          "note": "slot (enum \u2014 BUILD-time task), rarity (enum \u2014 tier names BUILD-time task), name (string), description (string \u2014 flavour text), model (ref \u2014 visual asset in CharacterLibrary applied to Avatar slot), xpBoost (number \u2014 boost value when equipped), equippedState (boolean)"
        }
      ],
      "methods": [
        {
          "name": "getModel",
          "returns": "string",
          "note": "returns visual asset ref for Avatar rendering"
        },
        {
          "name": "isEquipped",
          "returns": "boolean"
        }
      ],
      "relationships": [
        {
          "type": "extends",
          "target": "ItemTemplate"
        },
        {
          "type": "references",
          "target": "CharacterLibrary",
          "note": "gear model and visual assets from CharacterLibrary"
        }
      ],
      "open_questions": [
        "Slot taxonomy and rarity tier names are BUILD-time tasks."
      ]
    },
    {
      "id": "OBJ_useable",
      "name": "Useable",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Tracks real-world consumables and tools including quantity, units, and maintenance schedules. Auto-pushes to shoppingList when quantity hits minimum.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid"
        },
        {
          "name": "contents",
          "type": "object",
          "note": "type (consumable | tool), name (string), icon (ref), description (string), quantity (number), unit (string), maintenance{} (expiry, minQuantity, inspectionSchedule, howToDocRef, autoPushToShoppingList)"
        }
      ],
      "methods": [
        {
          "name": "updateQuantity",
          "params": "amount: number",
          "returns": "void"
        },
        {
          "name": "checkMaintenance",
          "returns": "boolean",
          "note": "triggers shoppingList push if below minQuantity \u2014 Inventory generates replenish task \u2014 D42"
        }
      ],
      "relationships": [
        {
          "type": "extends",
          "target": "ItemTemplate"
        },
        {
          "type": "notifies",
          "target": "User",
          "note": "pushes to User.lists.shoppingLists[] when quantity below minimum"
        }
      ],
      "open_questions": [
        "Maintenance trigger condition detail is a BUILD-time task."
      ]
    },
    {
      "id": "OBJ_attachment",
      "name": "Attachment",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Local file reference attached to Events or Tasks. Supports optional contract validation flow. Max 200KB in LOCAL per D09.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid"
        },
        {
          "name": "contents",
          "type": "object",
          "note": "fileRef (local file ref), size (number \u2014 max 200KB in LOCAL), type (image | text | doc | etc), taskRef (optional \u2014 contract validation), validationStatus (optional: pending | approved | denied), approverRef (stub null [MULTI-USER])"
        }
      ],
      "methods": [
        {
          "name": "validate",
          "returns": "boolean",
          "note": "checks size constraint and file type"
        },
        {
          "name": "setValidationStatus",
          "params": "status: string",
          "returns": "void",
          "note": "[MULTI-USER] stub in LOCAL"
        }
      ],
      "relationships": [
        {
          "type": "extends",
          "target": "ItemTemplate"
        },
        {
          "type": "references",
          "target": "Resource",
          "note": "optional \u2014 attached to Resource log entries"
        }
      ],
      "open_questions": [
        "Contract validation flow and multi-attachment support deferred to MULTI-USER.",
        "Full media support deferred to APP-STORE."
      ]
    },
    {
      "id": "OBJ_experience",
      "name": "Experience",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "User-authored post or journal entry linked to an Event. Private in LOCAL. Surfaces in EventCenter in MULTI-USER and world view in APP-STORE.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid"
        },
        {
          "name": "contents",
          "type": "object",
          "note": "rating (number), iconReaction (ref), description (string), taskList[] (Task refs), mediaRoll[] (media refs), dateCompleted (date \u2014 optional), relevanceScore (number \u2014 BUILD-time task), authorRef (User ref), eventRef (Event ref), timestamp (date)"
        }
      ],
      "methods": [
        {
          "name": "create",
          "params": "eventRef: string",
          "returns": "Experience"
        },
        {
          "name": "update",
          "params": "fields: object",
          "returns": "void"
        }
      ],
      "relationships": [
        {
          "type": "extends",
          "target": "ItemTemplate"
        },
        {
          "type": "references",
          "target": "User",
          "note": "authorRef links Experience to its author"
        }
      ],
      "open_questions": [
        "Relevance score sort algorithm is a BUILD-time task.",
        "Visible to friends, co-attendee posts, reactions deferred to MULTI-USER.",
        "Public world view and full media support deferred to APP-STORE."
      ]
    },
    {
      "id": "OBJ_coach",
      "name": "Coach",
      "type": "CORE",
      "scope": "APP",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Pure function engine and comment generator. Reads from Zustand stores, returns results, never owns state. Holds built-in libraries. No LLM ever \u2014 D11. No Zustand store \u2014 D44.",
      "properties": [
        {
          "name": "name",
          "type": "string",
          "note": "Coach display name"
        },
        {
          "name": "visual",
          "type": "string",
          "note": "ref to visual representation in CharacterLibrary"
        },
        {
          "name": "tone",
          "type": "string",
          "note": "active tone read from Settings.coachPreferences.tone at runtime \u2014 D26"
        },
        {
          "name": "activeTheme",
          "type": "string",
          "note": "default | seasonal variant. App reads when User displayPreferences.theme is default"
        },
        {
          "name": "adventures",
          "type": "array",
          "note": "live \u2014 Act refs created or managed by Coach"
        },
        {
          "name": "additionalCharacters",
          "type": "array",
          "note": "[APP-STORE] stub null \u2014 additional Coach characters and poses"
        }
      ],
      "methods": [
        {
          "name": "ribbet",
          "params": "context: object",
          "returns": "string",
          "note": "selects comment from CommentLibrary based on tone and context. Reads User.feed as mailbox context."
        },
        {
          "name": "checkAchievements",
          "params": "user: User",
          "returns": "Badge[]"
        },
        {
          "name": "track",
          "params": "user: User",
          "returns": "object"
        },
        {
          "name": "review",
          "params": "user: User, period: string",
          "returns": "object",
          "note": "annual wrapped gated by User.system.wrappedAnchor \u2014 D31"
        },
        {
          "name": "recommend",
          "params": "user: User",
          "returns": "string[]"
        },
        {
          "name": "addAdventure",
          "params": "act: Act, user: User",
          "returns": "void"
        },
        {
          "name": "checkBadgeBoard",
          "params": "user: User",
          "returns": "void"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "Settings"
        },
        {
          "type": "tracks",
          "target": "User"
        },
        {
          "type": "contains",
          "target": "AchievementLibrary"
        },
        {
          "type": "contains",
          "target": "CommentLibrary"
        },
        {
          "type": "contains",
          "target": "CharacterLibrary"
        },
        {
          "type": "contains",
          "target": "RecommendationsLibrary"
        }
      ],
      "open_questions": [
        "APP-STORE: additional Coach characters inherit holiday overlays. Paid coach selection and seasonal costume logic deferred to APP-STORE."
      ]
    },
    {
      "id": "OBJ_achievement_library",
      "name": "AchievementLibrary",
      "type": "SYSTEM",
      "scope": "APP",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Static collection of AchievementDefinitions Coach checks against to award badges and gear. Lives in Coach app bundle.",
      "properties": [
        {
          "name": "achievements",
          "type": "array",
          "note": "array of AchievementDefinition objects \u2014 each: id, name, icon, description, condition (function trigger), rewardRef"
        },
        {
          "name": "version",
          "type": "string",
          "note": "app bundle version"
        }
      ],
      "methods": [
        {
          "name": "getById",
          "params": "id: string",
          "returns": "AchievementDefinition"
        },
        {
          "name": "checkAll",
          "params": "user: User",
          "returns": "Badge[]"
        }
      ],
      "relationships": [
        {
          "type": "creates",
          "target": "Badge",
          "note": "awards Badge on achievement condition met"
        },
        {
          "type": "references",
          "target": "User",
          "note": "checks user data to evaluate achievement conditions"
        }
      ],
      "open_questions": [
        "V1 achievement set is a BUILD-time task."
      ]
    },
    {
      "id": "OBJ_comment_library",
      "name": "CommentLibrary",
      "type": "SYSTEM",
      "scope": "APP",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Keyed collection of comment copy Coach draws from via ribbet(). Tone variants per context entry. Lives in Coach app bundle.",
      "properties": [
        {
          "name": "comments",
          "type": "object",
          "note": "keyed by context \u2014 each entry has tone variants and commentCount for diversity tracking"
        },
        {
          "name": "version",
          "type": "string",
          "note": "app bundle version"
        }
      ],
      "methods": [
        {
          "name": "getByContext",
          "params": "context: string, tone: string",
          "returns": "string"
        },
        {
          "name": "getCount",
          "params": "context: string",
          "returns": "number"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "Settings",
          "note": "tone variants align with Settings.coachPreferences.tone"
        },
        {
          "type": "references",
          "target": "User",
          "note": "context drawn from user activity state"
        }
      ],
      "open_questions": [
        "Context key taxonomy and comment copy are BUILD-time tasks."
      ]
    },
    {
      "id": "OBJ_recommendations_library",
      "name": "RecommendationsLibrary",
      "type": "SYSTEM",
      "scope": "APP",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Prebuilt TaskTemplates and PlannedEvents Coach can suggest or assign. Organised by stat group. Lives in Coach app bundle.",
      "properties": [
        {
          "name": "tasks",
          "type": "array",
          "note": "live \u2014 prebuilt TaskTemplate refs organised by stat group. Includes resource-generating templates: birthday (Contact), chore (Home), maintenance (Vehicle), transaction (Account), replenish (Inventory) \u2014 D42"
        },
        {
          "name": "routines",
          "type": "array",
          "note": "live \u2014 prebuilt PlannedEvent refs organised by stat group"
        },
        {
          "name": "courses",
          "type": "array",
          "note": "[APP-STORE] stub null \u2014 structured learning paths with progression, scheduled lessons, quizzes"
        },
        {
          "name": "version",
          "type": "string",
          "note": "app bundle version"
        }
      ],
      "methods": [
        {
          "name": "getByStatGroup",
          "params": "stat: string",
          "returns": "TaskTemplate[]"
        },
        {
          "name": "getRoutinesByType",
          "params": "type: string",
          "returns": "PlannedEvent[]"
        }
      ],
      "relationships": [
        {
          "type": "contains",
          "target": "TaskTemplate"
        },
        {
          "type": "contains",
          "target": "PlannedEvent"
        }
      ],
      "open_questions": [
        "Shared course progress and accountability partners deferred to MULTI-USER.",
        "Expanded course library and user-created courses deferred to APP-STORE."
      ]
    },
    {
      "id": "OBJ_character_library",
      "name": "CharacterLibrary",
      "type": "SYSTEM",
      "scope": "APP",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Holds all visual asset definitions for Avatar states, Coach characters, holiday overlays, gear models, and XP level threshold table. Lives in Coach app bundle.",
      "properties": [
        {
          "name": "avatarStates",
          "type": "array",
          "note": "live \u2014 visual state definitions keyed by XP threshold. RuneScape curve shape \u2014 D43"
        },
        {
          "name": "levelThresholds",
          "type": "array",
          "note": "live \u2014 XP threshold table for level derivation. Level 99 approx halfway to 100 \u2014 D43. Exact values BUILD-time task"
        },
        {
          "name": "talentTreeDefinitions",
          "type": "object",
          "note": "live \u2014 6 trees x 5 tiers. WoW-style enhancement catalogue per tier node \u2014 D43. BUILD-time task"
        },
        {
          "name": "coachCharacters",
          "type": "array",
          "note": "live \u2014 default Coach visual. [APP-STORE] additional characters"
        },
        {
          "name": "holidayOverlays",
          "type": "array",
          "note": "live \u2014 seasonal overlays applied to default Coach character"
        },
        {
          "name": "gearModels",
          "type": "array",
          "note": "live \u2014 gear visual asset refs keyed by gear id"
        },
        {
          "name": "version",
          "type": "string",
          "note": "app bundle version"
        }
      ],
      "methods": [
        {
          "name": "getAvatarState",
          "params": "xp: number",
          "returns": "string"
        },
        {
          "name": "getLevelFromXP",
          "params": "xp: number",
          "returns": "number",
          "note": "derives level from XP using threshold table \u2014 called by UserStats.checkLevelUp()"
        },
        {
          "name": "getGearModel",
          "params": "gearId: string",
          "returns": "string"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "UserStats",
          "note": "provides XP threshold table for level derivation \u2014 D43"
        },
        {
          "type": "references",
          "target": "Coach",
          "note": "lives inside Coach app bundle \u2014 D30"
        }
      ],
      "open_questions": [
        "XP threshold table exact values are a BUILD-time task.",
        "Talent tree enhancement catalogue per tier is a BUILD-time task.",
        "Prestige arc visual assets deferred to APP-STORE.",
        "Paid Coach characters deferred to APP-STORE."
      ]
    },
    {
      "id": "OBJ_act",
      "name": "Act",
      "type": "CORE",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Top of the 4-level quest hierarchy. Owns Chains, distinguishes habitats from adventures via owner ref, and is the only level shared externally per D22.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid \u2014 D27, only Act gets uuid in quest hierarchy"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "icon",
          "type": "string",
          "note": "ref to icon asset"
        },
        {
          "name": "owner",
          "type": "string",
          "note": "user ref | coach ref \u2014 distinguishes habitat (user-created) from adventure (Coach-created)"
        },
        {
          "name": "chains",
          "type": "array",
          "note": "array of Chain objects \u2014 array-indexed per D27"
        },
        {
          "name": "accountability",
          "type": "object",
          "note": "live \u2014 stub shape in LOCAL. shared[] contact feed updates, contract enabling. Expands in MULTI-USER"
        },
        {
          "name": "commitment",
          "type": "object",
          "note": "live \u2014 routine review tied to Act. BUILD-time task"
        },
        {
          "name": "toggle",
          "type": "object",
          "note": "live \u2014 action on chain completion, gating logic for next Act. BUILD-time task"
        },
        {
          "name": "completionState",
          "type": "string",
          "note": "active | complete"
        },
        {
          "name": "sharedContacts",
          "type": "array",
          "note": "[MULTI-USER] stub null \u2014 accountability sharing, Act state visible to contacts, contract events enabled"
        }
      ],
      "methods": [
        {
          "name": "addChain",
          "params": "chain: Chain",
          "returns": "void"
        },
        {
          "name": "complete",
          "returns": "void"
        },
        {
          "name": "share",
          "returns": "void",
          "note": "[MULTI-USER] stub in LOCAL"
        }
      ],
      "relationships": [
        {
          "type": "contains",
          "target": "Chain"
        },
        {
          "type": "references",
          "target": "User",
          "note": "owner ref distinguishes habitat from adventure"
        }
      ],
      "open_questions": [
        "accountability{} stub shape detail \u2014 deferred to MULTI-USER.",
        "toggle{} gating logic is a BUILD-time task.",
        "commitment{} routine review tie-in is a BUILD-time task."
      ]
    },
    {
      "id": "OBJ_chain",
      "name": "Chain",
      "type": "CORE",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "WOOP framework level of quest hierarchy. Groups related Quests, defines goal framing using wish/outcome/obstacle/plan, and holds chain reward.",
      "properties": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "icon",
          "type": "string",
          "note": "ref to icon asset"
        },
        {
          "name": "wish",
          "type": "string",
          "note": "WOOP \u2014 gameboard UI encourages exaggerated intention"
        },
        {
          "name": "outcome",
          "type": "string",
          "note": "WOOP \u2014 gameboard UI encourages mental imagery"
        },
        {
          "name": "obstacle",
          "type": "string",
          "note": "WOOP \u2014 dashboard for identifying blockers"
        },
        {
          "name": "plan",
          "type": "object",
          "note": "WOOP \u2014 stages Quests, feeds into SMARTER fields on each Quest"
        },
        {
          "name": "chainReward",
          "type": "string",
          "note": "XP or item ref \u2014 granted on completion"
        },
        {
          "name": "quests",
          "type": "array",
          "note": "array of Quest objects \u2014 array-indexed per D27"
        },
        {
          "name": "completionState",
          "type": "string",
          "note": "active | complete \u2014 cached derived state"
        }
      ],
      "methods": [
        {
          "name": "addQuest",
          "params": "quest: Quest",
          "returns": "void"
        },
        {
          "name": "complete",
          "returns": "void"
        },
        {
          "name": "getProgress",
          "returns": "number"
        }
      ],
      "relationships": [
        {
          "type": "contains",
          "target": "Quest"
        },
        {
          "type": "references",
          "target": "TaskTemplate",
          "note": "plan{} stages quests that reference TaskTemplates"
        }
      ],
      "open_questions": []
    },
    {
      "id": "OBJ_quest",
      "name": "Quest",
      "type": "CORE",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "SMARTER framework execution unit. Owns Milestones and drives Marker generation via timely field. Can fail. Array-indexed per D27.",
      "properties": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "icon",
          "type": "string",
          "note": "ref to icon asset"
        },
        {
          "name": "completionState",
          "type": "string",
          "note": "active | complete | failed"
        },
        {
          "name": "specific",
          "type": "object",
          "note": "SMARTER \u2014 target count, end state, or resource value"
        },
        {
          "name": "measurable",
          "type": "object",
          "note": "SMARTER \u2014 relevant task types that apply progress"
        },
        {
          "name": "attainable",
          "type": "object",
          "note": "SMARTER \u2014 prereq quests, 91-day feasibility check, inventory considerations"
        },
        {
          "name": "relevant",
          "type": "object",
          "note": "SMARTER \u2014 stat group, resource, or custom tag with optional rating"
        },
        {
          "name": "timely",
          "type": "object",
          "note": "SMARTER \u2014 Marker generation rules, holds Marker objects"
        },
        {
          "name": "exigency",
          "type": "object",
          "note": "SMARTER \u2014 how missed Markers are handled. BUILD-time task"
        },
        {
          "name": "result",
          "type": "object",
          "note": "SMARTER \u2014 reward grant and completion state handler"
        },
        {
          "name": "milestones",
          "type": "array",
          "note": "logged Milestone results \u2014 array-indexed"
        },
        {
          "name": "questReward",
          "type": "string",
          "note": "XP or item ref \u2014 granted on completion"
        }
      ],
      "methods": [
        {
          "name": "addMilestone",
          "params": "milestone: Milestone",
          "returns": "void"
        },
        {
          "name": "complete",
          "returns": "void"
        },
        {
          "name": "fail",
          "returns": "void"
        },
        {
          "name": "getProgress",
          "returns": "number"
        }
      ],
      "relationships": [
        {
          "type": "contains",
          "target": "Milestone"
        },
        {
          "type": "contains",
          "target": "Marker"
        }
      ],
      "open_questions": [
        "91-day feasibility check algorithm is a BUILD-time task.",
        "exigency{} missed Marker handling detail is a BUILD-time task."
      ]
    },
    {
      "id": "OBJ_milestone",
      "name": "Milestone",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "TaskTemplate-shaped logged result node on Quest. Inherits TaskTemplate shape. Links completion back to parent Quest.",
      "properties": [
        {
          "name": "questRef",
          "type": "string",
          "note": "links completion log back to parent Quest"
        },
        {
          "name": "taskTemplateShape",
          "type": "object",
          "note": "inherits full TaskTemplate property shape. Specific Milestone inputFields shape is a BUILD-time task"
        }
      ],
      "methods": [
        {
          "name": "complete",
          "returns": "void"
        },
        {
          "name": "reset",
          "returns": "void"
        }
      ],
      "relationships": [
        {
          "type": "extends",
          "target": "TaskTemplate"
        },
        {
          "type": "references",
          "target": "Quest",
          "note": "logs result back to parent Quest \u2014 questRef"
        }
      ],
      "open_questions": [
        "Milestone inputFields specific shape is a BUILD-time task."
      ]
    },
    {
      "id": "OBJ_marker",
      "name": "Marker",
      "type": "CORE",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Recurring check-in trigger living inside Quest.timely. Virtual \u2014 evaluated at rollover. Fires to create Task instances pushed to User.gtdList[]. Completed task logs result as Milestone on Quest.",
      "properties": [
        {
          "name": "questRef",
          "type": "string",
          "note": "parent Quest ref"
        },
        {
          "name": "interval",
          "type": "RecurrenceRule",
          "note": "recurrence shape \u2014 D37. Anchor is Marker.lastFired not a seedDate"
        },
        {
          "name": "taskTemplateRef",
          "type": "string",
          "note": "Milestone TaskTemplate ref \u2014 instantiated when Marker fires"
        },
        {
          "name": "lastFired",
          "type": "date",
          "note": "timestamp of last fire \u2014 serves as RecurrenceRule anchor"
        },
        {
          "name": "nextFire",
          "type": "date",
          "note": "computed from lastFired and interval"
        },
        {
          "name": "activeState",
          "type": "boolean",
          "note": "fires for life of Quest unless Quest completes or is paused"
        }
      ],
      "methods": [
        {
          "name": "evaluate",
          "returns": "boolean",
          "note": "checks if nextFire threshold is met \u2014 called by Rollover Engine"
        },
        {
          "name": "fire",
          "returns": "Task",
          "note": "instantiates TaskTemplate, pushes Task to User.gtdList[]"
        }
      ],
      "relationships": [
        {
          "type": "creates",
          "target": "Task"
        },
        {
          "type": "references",
          "target": "TaskTemplate"
        }
      ],
      "open_questions": []
    },
    {
      "id": "OBJ_task_template",
      "name": "TaskTemplate",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Universal task blueprint. Instanced into Tasks by Markers, FavouritesList, and RecommendationsLibrary. No UUID \u2014 lives inside parent objects. User custom templates in taskLibrary only \u2014 D34.",
      "properties": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "icon",
          "type": "string",
          "note": "ref to icon asset"
        },
        {
          "name": "taskType",
          "type": "string",
          "note": "enum \u2014 CHECK | COUNTER | SETS_REPS | CIRCUIT | DURATION | TIMER | RATING | TEXT | FORM | CHOICE | CHECKLIST | SCAN | LOG | LOCATION_POINT | LOCATION_TRAIL \u2014 D38"
        },
        {
          "name": "inputFields",
          "type": "object",
          "note": "typed input shape per taskType \u2014 D41. CHECK: note?. COUNTER: target, increment, unit?. SETS_REPS: sets[{reps, weight?, unit, restAfter?}], dropSet, restTimer?. CIRCUIT: rounds, steps[{name, taskType, inputFields, media?, restAfter?}], restBetweenRounds?. DURATION: duration, note?. TIMER: targetDuration, actualDuration. RATING: scale, value, label?. TEXT: prompt?, value. FORM: fields[{id, label, fieldType, required, options?}], courseRef?, responses{}. CHOICE: options[], emojiMode, multiSelect, selected[]. CHECKLIST: items[{id, label, checked}], requireAll. SCAN: scanType (barcode|qr|receipt), value, resourceRef?. LOG: prompt?, value, resourceRef?, amount?, unit?. LOCATION_POINT: coordinates{lat,lng}, placeName?, note?. LOCATION_TRAIL: polyline[{lat,lng,timestamp}], distance, duration, elevationGain?, startPoint, endPoint"
        },
        {
          "name": "xpAward",
          "type": "object",
          "note": "partial StatGroup record \u2014 health, strength, agility, defense, charisma, wisdom point values. Sum of all values = total XP. Custom template default: +5 to assigned stat group \u2014 D43"
        },
        {
          "name": "cooldown",
          "type": "number",
          "note": "minutes | null. null = no cooldown. Enables repeat-check patterns e.g. drink water every 4 hours. Future: fires notification in APP-STORE \u2014 D41"
        },
        {
          "name": "media",
          "type": "string",
          "note": "optional instructional content ref \u2014 video or image shown before completion. Not a capture type."
        },
        {
          "name": "items",
          "type": "array",
          "note": "optional Useable refs \u2014 items required for task completion, enables inventory check"
        }
      ],
      "methods": [
        {
          "name": "instantiate",
          "returns": "Task"
        },
        {
          "name": "update",
          "params": "fields: object",
          "returns": "void"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "Useable",
          "note": "optional inventory check on required items"
        },
        {
          "type": "references",
          "target": "User",
          "note": "custom TaskTemplates live in User.lists.taskLibrary \u2014 D34"
        }
      ],
      "open_questions": [
        "taskType enum taxonomy confirmed at 15 types \u2014 D38.",
        "inputFields shapes confirmed per type \u2014 D41.",
        "Full prebuilt template set is a BUILD-time task."
      ]
    },
    {
      "id": "OBJ_recurrence_rule",
      "name": "RecurrenceRule",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Custom lightweight recurrence definition used by PlannedEvent, Marker, and Resource Account bills and paydays. No RRULE dependency \u2014 D28, D37.",
      "properties": [
        {
          "name": "frequency",
          "type": "string",
          "note": "daily | weekly | monthly | custom. daily = shorthand for every day, days[] ignored. monthly uses parent seedDate or Marker.lastFired to resolve nth-weekday implicitly \u2014 D37"
        },
        {
          "name": "days",
          "type": "array",
          "note": "weekday strings \u2014 mon, tue, wed, thu, fri, sat, sun. Defines which weekdays fire within the period. Ignored for daily and monthly \u2014 D37"
        },
        {
          "name": "interval",
          "type": "number",
          "note": "every N periods \u2014 default 1. e.g. weekly + interval:2 = fortnightly"
        },
        {
          "name": "endsOn",
          "type": "date",
          "note": "null = indefinite"
        },
        {
          "name": "customCondition",
          "type": "string",
          "note": "optional expression for unusual patterns e.g. friday-13th"
        }
      ],
      "methods": [
        {
          "name": "resolve",
          "params": "fromDate: date",
          "returns": "date[]"
        },
        {
          "name": "next",
          "params": "fromDate: date",
          "returns": "date"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "Task",
          "note": "recurrence drives Task creation via Marker.fire()"
        },
        {
          "type": "references",
          "target": "Event",
          "note": "recurrence drives Event materialisation via PlannedEvent"
        }
      ],
      "open_questions": []
    },
    {
      "id": "OBJ_task",
      "name": "Task",
      "type": "CORE",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Live instance of a TaskTemplate. Execution unit \u2014 lives in User.gtdList[] or inside an Event. UUID needed for undo and quest logging.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid \u2014 needed for undo and quest logging"
        },
        {
          "name": "templateRef",
          "type": "string",
          "note": "ref to originating TaskTemplate"
        },
        {
          "name": "completionState",
          "type": "string",
          "note": "pending | complete | skipped"
        },
        {
          "name": "completedAt",
          "type": "date"
        },
        {
          "name": "resultFields",
          "type": "object",
          "note": "recorded values matching inputFields shape of originating TaskTemplate \u2014 D41"
        },
        {
          "name": "attachmentRef",
          "type": "string",
          "note": "optional Attachment ref \u2014 user evidence on completion"
        },
        {
          "name": "resourceRef",
          "type": "string",
          "note": "optional \u2014 ref to Resource that contextualised completion. Enables +2 defense bonus routing and links task history back to resource log \u2014 D40"
        },
        {
          "name": "location",
          "type": "object",
          "note": "optional coordinates recorded during completion"
        },
        {
          "name": "sharedWith",
          "type": "string",
          "note": "[MULTI-USER] stub null \u2014 push completion to contact QuickActionsEvent"
        }
      ],
      "methods": [
        {
          "name": "complete",
          "returns": "void",
          "note": "applies base XP + context bonuses (QuickActions +2 agility, Resource +2 defense) + multipliers \u2014 D39, D43"
        },
        {
          "name": "skip",
          "returns": "void"
        },
        {
          "name": "reschedule",
          "params": "date: date",
          "returns": "void"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "TaskTemplate"
        },
        {
          "type": "references",
          "target": "Attachment",
          "note": "optional user evidence on completion"
        }
      ],
      "open_questions": []
    },
    {
      "id": "OBJ_planned_event",
      "name": "PlannedEvent",
      "type": "CORE",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Self-contained schedule and task pool. Materialises into Events via midnight rollover per D14. Serves as both planned event and routine \u2014 D36. Same-day creation triggers immediate materialisation.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "icon",
          "type": "string",
          "note": "ref to icon asset"
        },
        {
          "name": "color",
          "type": "string",
          "note": "for calendar display"
        },
        {
          "name": "seedDate",
          "type": "date",
          "note": "first occurrence \u2014 serves as RecurrenceRule anchor for nth-weekday monthly resolution \u2014 D37"
        },
        {
          "name": "dieDate",
          "type": "date",
          "note": "optional end date for multi-day or one-off events"
        },
        {
          "name": "recurrenceInterval",
          "type": "RecurrenceRule",
          "note": "D37 \u2014 RecurrenceRule ref. seedDate is the anchor."
        },
        {
          "name": "activeState",
          "type": "string",
          "note": "active | sleep"
        },
        {
          "name": "taskPool",
          "type": "array",
          "note": "D07 \u2014 full set of interchangeable TaskTemplate refs"
        },
        {
          "name": "taskList",
          "type": "array",
          "note": "current rotation pulled from pool \u2014 cursor tracking BUILD-time task"
        },
        {
          "name": "conflictMode",
          "type": "string",
          "note": "D08 \u2014 override | shift | truncate | concurrent"
        },
        {
          "name": "startTime",
          "type": "string",
          "note": "HH:MM format"
        },
        {
          "name": "endTime",
          "type": "string",
          "note": "HH:MM format"
        },
        {
          "name": "location",
          "type": "object",
          "note": "optional coordinates and place name \u2014 D20"
        },
        {
          "name": "sharedWith",
          "type": "array",
          "note": "[MULTI-USER] stub null"
        },
        {
          "name": "pushReminder",
          "type": "boolean",
          "note": "[APP-STORE] stub null \u2014 push notification on startTime"
        }
      ],
      "methods": [
        {
          "name": "materialise",
          "returns": "Event"
        },
        {
          "name": "resolveConflict",
          "params": "existing: Event",
          "returns": "void"
        },
        {
          "name": "sleep",
          "returns": "void"
        },
        {
          "name": "wake",
          "returns": "void"
        }
      ],
      "relationships": [
        {
          "type": "creates",
          "target": "Event"
        },
        {
          "type": "references",
          "target": "RecurrenceRule"
        },
        {
          "type": "references",
          "target": "TaskTemplate"
        }
      ],
      "open_questions": [
        "taskPool cursor tracking logic is a BUILD-time task."
      ]
    },
    {
      "id": "OBJ_event",
      "name": "Event",
      "type": "CORE",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Concrete execution record materialised from PlannedEvent or created manually. System log per D02 and D03. User can convert past Event with location to an Experience post.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid"
        },
        {
          "name": "eventType",
          "type": "string",
          "note": "standard | quickActions | planned. Discriminator for UI rendering and history filtering \u2014 D44"
        },
        {
          "name": "plannedEventRef",
          "type": "string",
          "note": "optional \u2014 null for manually created events"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "startDate",
          "type": "date"
        },
        {
          "name": "startTime",
          "type": "string",
          "note": "HH:MM format"
        },
        {
          "name": "endDate",
          "type": "date",
          "note": "for multi-day events"
        },
        {
          "name": "endTime",
          "type": "string",
          "note": "HH:MM format"
        },
        {
          "name": "tasks",
          "type": "array",
          "note": "Task instance refs"
        },
        {
          "name": "completionState",
          "type": "string",
          "note": "pending | complete | skipped"
        },
        {
          "name": "xpAwarded",
          "type": "number",
          "note": "sum of completed task XP"
        },
        {
          "name": "attachments",
          "type": "array",
          "note": "Attachment refs \u2014 max 5, max 200KB each per D09"
        },
        {
          "name": "location",
          "type": "object",
          "note": "optional coordinates and place name \u2014 D20"
        },
        {
          "name": "note",
          "type": "string",
          "note": "optional freetext"
        },
        {
          "name": "sharedWith",
          "type": "array",
          "note": "[MULTI-USER] stub null"
        },
        {
          "name": "coAttendees",
          "type": "array",
          "note": "[MULTI-USER] stub null"
        }
      ],
      "methods": [
        {
          "name": "addTask",
          "params": "task: Task",
          "returns": "void"
        },
        {
          "name": "complete",
          "returns": "void"
        },
        {
          "name": "convertToExperience",
          "returns": "Experience",
          "note": "user can convert any past Event with location to an Experience post"
        }
      ],
      "relationships": [
        {
          "type": "contains",
          "target": "Task"
        },
        {
          "type": "contains",
          "target": "Attachment"
        },
        {
          "type": "creates",
          "target": "Experience",
          "note": "optional \u2014 user-initiated conversion"
        }
      ],
      "open_questions": [
        "Shared events (contact-scoped) and EventCenter posts (public) are distinct concepts per D24."
      ]
    },
    {
      "id": "OBJ_quick_actions_event",
      "name": "QuickActionsEvent",
      "type": "DATA",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Daily singleton receiving quick-fire completions from favouritesList and gtdList. Date-keyed per D12. Lives in User.events.active[] during the day, moves to history[] at rollover.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "qa-{YYYY-MM-DD} format per D12"
        },
        {
          "name": "eventType",
          "type": "string",
          "note": "quickActions \u2014 matches Event.eventType discriminator \u2014 D44"
        },
        {
          "name": "date",
          "type": "date"
        },
        {
          "name": "completions",
          "type": "array",
          "note": "each: Task ref, completedAt timestamp. User-editable and deletable. QuickActions completions award +2 agility bonus \u2014 D39"
        },
        {
          "name": "xpAwarded",
          "type": "number",
          "note": "running daily total"
        },
        {
          "name": "sharedCompletions",
          "type": "array",
          "note": "[MULTI-USER] stub null"
        }
      ],
      "methods": [
        {
          "name": "addCompletion",
          "params": "task: Task",
          "returns": "void"
        },
        {
          "name": "removeCompletion",
          "params": "taskId: string",
          "returns": "void"
        },
        {
          "name": "getTotalXP",
          "returns": "number"
        },
        {
          "name": "getSummary",
          "returns": "object"
        }
      ],
      "relationships": [
        {
          "type": "aggregates",
          "target": "Task"
        },
        {
          "type": "references",
          "target": "User",
          "note": "lives in User.events.active[] during day, moves to history[] at rollover"
        },
        {
          "type": "extends",
          "target": "Event",
          "note": "QAE is an Event type \u2014 eventType: quickActions \u2014 D44"
        }
      ],
      "open_questions": []
    },
    {
      "id": "OBJ_resource",
      "name": "Resource",
      "type": "CORE",
      "scope": "LOCAL",
      "lifecycle": "DESIGNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "Parent object for all real-world resources. Type-specific data lives in meta{}. Each resource type generates a specific task category via prebuilt templates \u2014 D42.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "icon",
          "type": "string",
          "note": "ref to icon asset \u2014 CharacterLibrary"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "type",
          "type": "string",
          "note": "contact | home | vehicle | account | inventory | doc"
        },
        {
          "name": "attachments",
          "type": "array",
          "note": "Attachment refs \u2014 optional"
        },
        {
          "name": "log",
          "type": "array",
          "note": "each entry: note (string), timestamp (date), taskRef (optional Task ref)"
        },
        {
          "name": "meta",
          "type": "object",
          "note": "type-specific shape \u2014 D42. CONTACT: info{} (flexible data bag \u2014 birthday, phone, email, address, customFields. Designed for MULTI-USER extension where fields pull from shared user state), customTag, groups[], notes. Generates: birthday task. HOME: memberContactRefs[], rooms[{id, name, icon, assignedTo (string[]|all), linkedDocs[], linkedLayoutRef?}], linkedInventoryRef (layout Doc is bridge between inventory and space), recurringTasksStub null [MULTI-USER], linkedDocs[]. Generates: chore tasks. VEHICLE: make, model, year, mileage?, memberContactRefs[], linkedDocs[], recurringTasksStub null [MULTI-USER]. Generates: maintenance tasks. ACCOUNT: kind (bank|bill|income|debt|subscription|allowance), linkedAccountRef (points bill/income/allowance at bank account), linkedResourceRef (Home/Vehicle/Contact context), linkedDocs[], balance (number \u2014 user can override), balanceOverriddenAt (date|null), recurrenceRuleRef (for bill/income/allowance), amount?, pendingTransactions[{id, date, amount?, description, sourceRef?, assignedAccountRef?, status (pending|assigned|posted)}], transactionTaskRef. Generates: transaction tasks. INVENTORY: containers[{id, name, icon, linkedResourceRef (any Resource \u2014 Home/Vehicle/Contact for lending), notes?}], items[{useableRef, containerId (null=uncontained), quantity}]. Generates: replenish tasks. DOC: docType (text|pdf|contract|manual|layout|course|walkthrough), content (rich text \u2014 text type), linkedResourceRef?, courseRef?, progression{} null [BUILD-time], tags[], createdAt, updatedAt. No task generation."
        }
      ],
      "methods": [
        {
          "name": "update",
          "params": "fields: object",
          "returns": "void"
        },
        {
          "name": "addLog",
          "params": "entry: object",
          "returns": "void"
        },
        {
          "name": "generateTask",
          "params": "templateRef: string",
          "returns": "Task",
          "note": "creates task from prebuilt template in context of this resource. Completion awards +2 defense bonus \u2014 D39, D42"
        }
      ],
      "relationships": [
        {
          "type": "contains",
          "target": "Attachment"
        },
        {
          "type": "references",
          "target": "Useable",
          "note": "inventory items tracked via meta.items[]"
        },
        {
          "type": "references",
          "target": "RecurrenceRule",
          "note": "Account bills and paydays reference RecurrenceRule \u2014 D42"
        },
        {
          "type": "creates",
          "target": "Task",
          "note": "resource-generates-task pattern \u2014 D42"
        }
      ],
      "open_questions": [
        "Home and Vehicle recurring task generation via TaskTemplate refs \u2014 full implementation deferred to MULTI-USER.",
        "Doc course progression shape is a BUILD-time task.",
        "External account integrations deferred to APP-STORE.",
        "Shopping list \u2192 pendingTransactions flow: item checked off list \u2192 pushed to pendingTransactions[] as pending \u2192 user assigns to account \u2192 task completion posts it."
      ]
    },
    {
      "id": "OBJ_event_center",
      "name": "EventCenter",
      "type": "SYSTEM",
      "scope": "LOCAL",
      "lifecycle": "PLANNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "STUB \u2014 public-facing Experience post hub. Hosts user-authored Experience content only. Distinct from Leaderboard \u2014 D45. Null in LOCAL per D25. Activated in APP-STORE.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid \u2014 stub"
        },
        {
          "name": "activeState",
          "type": "boolean",
          "note": "[APP-STORE] stub null"
        },
        {
          "name": "experienceBoard",
          "type": "string",
          "note": "[APP-STORE] stub null \u2014 ExperienceBoard ref"
        }
      ],
      "methods": [
        {
          "name": "stub",
          "returns": "null",
          "note": "not wired in LOCAL \u2014 D25"
        },
        {
          "name": "postExperience",
          "params": "experience: Experience",
          "returns": "void",
          "note": "[APP-STORE] stub"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "ExperienceBoard",
          "note": "[APP-STORE] stub"
        },
        {
          "type": "references",
          "target": "Experience",
          "note": "hosts Experience posts only \u2014 not challenge or leaderboard data"
        }
      ],
      "open_questions": [
        "EventCenter hosts Experience posts only. Challenge data lives in Leaderboard \u2014 D45.",
        "Full design deferred to APP-STORE chapter."
      ]
    },
    {
      "id": "OBJ_experience_board",
      "name": "ExperienceBoard",
      "type": "SYSTEM",
      "scope": "LOCAL",
      "lifecycle": "PLANNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "STUB \u2014 holds and sorts Experience posts by relevance. Null in LOCAL per D25. Activated in APP-STORE.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid \u2014 stub"
        },
        {
          "name": "experiences",
          "type": "array",
          "note": "[APP-STORE] stub null \u2014 Experience ItemTemplate refs"
        },
        {
          "name": "sortRule",
          "type": "object",
          "note": "[APP-STORE] stub null \u2014 relevance sort algorithm, BUILD-time task"
        }
      ],
      "methods": [
        {
          "name": "stub",
          "returns": "null",
          "note": "not wired in LOCAL \u2014 D25"
        },
        {
          "name": "sort",
          "params": "rule: object",
          "returns": "Experience[]",
          "note": "[APP-STORE] stub"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "Experience"
        },
        {
          "type": "references",
          "target": "User",
          "note": "surfaces user-authored Experience content"
        }
      ],
      "open_questions": [
        "Relevance sort algorithm is a BUILD-time task.",
        "Full design deferred to APP-STORE chapter."
      ]
    },
    {
      "id": "OBJ_leaderboard",
      "name": "Leaderboard",
      "type": "SYSTEM",
      "scope": "LOCAL",
      "lifecycle": "PLANNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "STUB \u2014 competitive task completion ranking system. Distinct from EventCenter which hosts Experience posts. Opt-in data reporting. Level gated. Activated in MULTI-USER (friends) and APP-STORE (global + challenge) \u2014 D45.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid \u2014 stub"
        },
        {
          "name": "type",
          "type": "string",
          "note": "[MULTI-USER / APP-STORE] global | friends | challenge"
        },
        {
          "name": "entries",
          "type": "array",
          "note": "[MULTI-USER / APP-STORE] each: userRef, value, timestamp, anonymised (boolean). Non-opted users appear as anonymous figures on global board \u2014 D45"
        },
        {
          "name": "levelGate",
          "type": "number",
          "note": "[APP-STORE] minimum user level to access leaderboard UI. Threshold is BUILD-time task \u2014 D45"
        },
        {
          "name": "activeChallenge",
          "type": "object",
          "note": "[APP-STORE] stub null \u2014 current Challenge ref"
        }
      ],
      "methods": [
        {
          "name": "stub",
          "returns": "null",
          "note": "not wired in LOCAL"
        },
        {
          "name": "getRanking",
          "params": "userRef: string",
          "returns": "number",
          "note": "[APP-STORE] stub"
        },
        {
          "name": "submitEntry",
          "params": "entry: object",
          "returns": "void",
          "note": "[MULTI-USER] opt-in submission"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "Challenge",
          "note": "[APP-STORE] active challenge ref"
        },
        {
          "type": "references",
          "target": "User",
          "note": "opt-in XP and completion data \u2014 D45"
        }
      ],
      "open_questions": [
        "Friends leaderboard activated in MULTI-USER. Global and challenge activated in APP-STORE.",
        "Level gate threshold is a BUILD-time task.",
        "Anonymous figure rendering for non-opted global board users \u2014 BUILD-time task.",
        "Server holds leaderboard snapshots only \u2014 not full user profiles \u2014 D45."
      ]
    },
    {
      "id": "OBJ_challenge",
      "name": "Challenge",
      "type": "SYSTEM",
      "scope": "LOCAL",
      "lifecycle": "PLANNED",
      "version": "0.2",
      "stage_ref": "MVP05",
      "purpose": "STUB \u2014 weekly rotating competitive event preset and curated by the developer. Users opt in to share task completion data. Placement grants bonus XP. Lives in Leaderboard \u2014 distinct from EventCenter \u2014 D45.",
      "properties": [
        {
          "name": "id",
          "type": "string",
          "note": "uuid \u2014 stub"
        },
        {
          "name": "startDate",
          "type": "date",
          "note": "[APP-STORE] challenge window open"
        },
        {
          "name": "endDate",
          "type": "date",
          "note": "[APP-STORE] challenge window close"
        },
        {
          "name": "taskTemplateRefs",
          "type": "array",
          "note": "[APP-STORE] 2-3 prebuilt TaskTemplate refs per week e.g. most km walked, most meals logged, most agility XP earned"
        },
        {
          "name": "metric",
          "type": "string",
          "note": "[APP-STORE] measured value \u2014 distance | count | xp | duration"
        },
        {
          "name": "entries",
          "type": "array",
          "note": "[APP-STORE] each: userRef, value, timestamp"
        },
        {
          "name": "placementRewards",
          "type": "array",
          "note": "[APP-STORE] XP or item rewards granted by placement \u2014 ties into D43 XP model"
        }
      ],
      "methods": [
        {
          "name": "stub",
          "returns": "null",
          "note": "not wired in LOCAL"
        },
        {
          "name": "submit",
          "params": "userRef: string, value: number",
          "returns": "void",
          "note": "[APP-STORE] opt-in completion data push"
        },
        {
          "name": "resolveRewards",
          "returns": "void",
          "note": "[APP-STORE] grants placement XP on endDate"
        }
      ],
      "relationships": [
        {
          "type": "references",
          "target": "TaskTemplate",
          "note": "weekly rotation references prebuilt templates"
        },
        {
          "type": "references",
          "target": "User",
          "note": "opt-in user completion data submitted to challenge entries"
        }
      ],
      "open_questions": [
        "Weekly rotation preset schedule is a BUILD-time task.",
        "Placement reward values are a BUILD-time task.",
        "Full design deferred to APP-STORE chapter."
      ]
    }
  ]
}
``` that turns personal ambitions and habits into a quest-driven progression system. The LOCAL chapter defines the complete single-user object model stored in flat-keyed localStorage. All 36 objects are defined here; MULTI-USER and APP STORE chapters are delta documents from this baseline.

---

## DEVELOPMENT PLAN

**Use case progression:**
```
LOCAL SINGLE USER → SHARED MULTI USER → PUBLIC PLATFORM
```
Current target: LOCAL SINGLE USER — MVP05 STORAGE + CORE OBJECTS

**Platform:** React + Vite + TypeScript + Zustand + Capacitor (D13)

**Storage:** localStorage, flat-keyed dictionary (D01)

---

## ZUSTAND STORE TOPOLOGY

Five stores. Coach is a pure function engine — no store. D44.

```
useSystemStore        Settings, session metadata, rollover timestamp
                      Device only — never syncs to cloud
                      MULTI-USER exception: syncs lastRollover timestamp
                      for multi-device coordination — D45

useUserStore          User, UserStats, Avatar, BadgeBoard, Equipment
                      Feed — user mailbox, belongs here not Coach
                      DEVICE → cloud sync in MULTI-USER

useProgressionStore   Acts (nested Chains, Quests, Milestones, Markers)
                      DEVICE → cloud sync in MULTI-USER

useScheduleStore      PlannedEvents
                      Events — active[] and history[]
                      QuickActionsEvent — lives in active[] during day,
                        moves to history[] at rollover
                      Tasks, TaskTemplates (user custom only — D34)
                      DEVICE → cloud sync in MULTI-USER

useResourceStore      Resources (all 6 types)
                      Useables, Attachments, Badges, Gear
                      DEVICE → cloud sync in MULTI-USER

Coach                 Pure function engine — reads from stores, returns results
                      Never owns state. No Zustand store.
                      App bundle object only.
```

**LOCAL → MULTI-USER scaling pattern:**
```
useSystemStore        keeps localStorage adapter
                      adds cloud sync for session timestamps only
all other stores      localStorage adapter unchanged
                      dual-write cloud middleware added per store
server                auth + user index for contact discovery
                      leaderboard snapshots (opt-in, APP-STORE)
                      no game data stored server-side
user data ownership   preserved throughout all chapters
```

---

## DATA FLOW

```
USER ACTION (complete task / create event / equip gear)
  → OBJECT METHOD (Task.complete / Marker.fire / Avatar.equipGear)
  → XP PIPELINE (base + context bonus + multiplier — D39, D43)
  → STATE UPDATE (Zustand store)
  → PERSISTENCE (localStorage flat-keyed write)
  → SIDE EFFECTS (QuickActionsEvent.addCompletion / Feed.push / Coach.checkAchievements)
  → RENDER (React component re-render via Zustand subscription)

MIDNIGHT ROLLOVER (9-step sequence — D14)
  → PlannedEvent.materialise → Event created in useScheduleStore
  → RecurrenceRule.next → next PlannedEvent scheduled
  → Marker.evaluate → Tasks fired to User.gtdList[]
  → QuickActionsEvent moves active[] → history[]
  → Coach.review → ribbet messages queued → Feed.push

RESOURCE TASK COMPLETION
  → Task.complete with resourceRef set
  → +2 defense bonus applied — D39
  → Resource.log entry created
  → Account pendingTransactions updated if Account context

SHOPPING LIST → PENDING TRANSACTION FLOW
  → User checks item off shoppingList
  → item pushed to Account.meta.pendingTransactions[] status:pending
  → user assigns to account → status:assigned
  → transaction task completion → status:posted
```

---

## RESOURCE-GENERATES-TASK PATTERN

Each resource type has a corresponding prebuilt TaskTemplate in RecommendationsLibrary. Tasks completed in resource context award +2 defense bonus per D39.

```
Contact      → birthday task       (CHECK with annual recurrence)
Home         → chore tasks         (CHECK / CHECKLIST — trash, deep clean etc)
Vehicle      → maintenance tasks   (CHECKLIST / LOG — oil change, tyre check etc)
Account      → transaction tasks   (LOG — records to account transaction log)
Inventory    → replenish tasks     (COUNTER — triggers when Useable below minQuantity)
Doc          → no task generation
```

---

## XP MODEL SUMMARY

D43 — Full XP model:

```
Base XP        sum of TaskTemplate.xpAward stat group values
               set on template creation
               custom template default: +5 to assigned stat group

Context bonuses (additive, applied at Task.complete())
               +2 agility — QuickActions completion
               +2 defense — Resource completion
               talent tree tier rewards — specific enhancements per node

Multipliers    ×3 on 3-day streak
               ×2 early bird mode (time window BUILD-time task)
               stacking: additive by default
               multiplicative stacking: talent tree unlock reward

Talent tree    WoW-style 6 trees × 5 tiers
               spend points to unlock tier, each tier grants named enhancement
               enhancement catalogue in Coach bundle — BUILD-time task
               UserStats.talentTree{} stores unlocked state only
               1 talentPoint per 100 statPoints earned

Level curve    RuneScape exponential shape
               level 99 ≈ halfway to level 100 in XP
               threshold table in CharacterLibrary Coach bundle
               UserStats.level cached — derived at runtime, never source of truth
```

---

## FUTURE CONSIDERATIONS

- MULTI-USER: Cloud storage (D23), Act sharing (D22), friends leaderboard, contact discovery
- APP-STORE: EventCenter (Experience posts), Leaderboard global + challenge, weekly challenge rotation preset by developer, level gate on leaderboard access, anonymous figures for non-opted global board users
- Biometric task types (heart rate, sleep) — APP-STORE with watch integration
- TaskTemplate.cooldown notification firing — APP-STORE push notifications
- EventTemplate dropped (D19) — PlannedEvent covers all scheduled event needs
- XP Log dropped (D02) — Events serve as the activity log
- Task Log dropped (D03) — Event archive is scanned for task history
- Routine dropped (D36) — PlannedEvent is universal schedule object

---

## CHANGE LOG

**2026-03-18 v0.1** — Initial object model defined. 33 objects. Decisions D26–D28 resolved. LOCAL chapter baseline established.

**2026-03-18 v0.2** — MVP05 design session. 36 objects (+Leaderboard, +Challenge, EventCenter and ExperienceBoard scoped). Decisions D37–D45 resolved.

Additions and changes:
- D37: RecurrenceRule shape confirmed — anchor inherited from parent context, daily shorthand, monthly uses seedDate for nth-weekday resolution
- D38: TaskType enum confirmed — 15 types. CHECK COUNTER SETS_REPS CIRCUIT DURATION TIMER RATING TEXT FORM CHOICE CHECKLIST SCAN LOG LOCATION_POINT LOCATION_TRAIL
- D39: XP bonus model — +2 agility QuickActions, +2 defense Resource, talent tree enhancements
- D40: Task.resourceRef added — optional resource context field
- D41: inputFields shapes defined for all 15 TaskTypes. TaskTemplate.cooldown added. CIRCUIT gets rounds + restBetweenRounds. SETS_REPS gets dropSet + restAfter.
- D42: ResourceMeta shapes confirmed — Contact info{} replaces birthday field. Home rooms get icon/assignedTo/linkedDocs/linkedLayoutRef. Vehicle gets make/model/year/mileage/linkedDocs. Account redesigned with kind discriminator, linkedAccountRef, pendingTransactions[]. Inventory containers support any Resource as linkedResourceRef. Doc gets walkthrough type. Resource-generates-task pattern documented.
- D43: XP model confirmed — RuneScape level curve, WoW talent tree, additive multipliers by default, multiplicative stacking as talent unlock. No cap.
- D44: Zustand store topology confirmed — 5 stores, Coach as pure function engine with no store. Event.eventType discriminator added. QuickActionsEvent confirmed in active[] during day.
- D45: Storage scaling confirmed — localStorage default, optional cloud sync in MULTI-USER, user owns data throughout. Leaderboard and EventCenter scoped as distinct objects. Challenge object defined. Weekly rotation preset by developer. Level gate on leaderboard. Anonymous figures for non-opted global board users.
