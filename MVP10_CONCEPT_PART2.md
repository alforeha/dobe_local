# CAN-DO-BE · LOCAL CHAPTER
## MVP10 UI SHELL — CONCEPT DECISIONS PART 2
**Coach Overlay + Profile Overlay · 2026-03-20**

---

## Coach Overlay

Opened from footer coach nav button. Self-contained layout with header, body, and footer. Footer does not persist from main app layout — coach overlay has its own footer.

---

### Section 1 — Header (fixed)

- Component: info button — left, opens about popup
- Component: feed notification button — right, only visible when user feed has content (user state messages OR coach reactive messages). Taps navigate directly to feed room.
- Component: coach character avatar — centred, decorative in LOCAL v1. State-based poses deferred to future chapter.
- Component: coach callout — possible comment bubble near avatar. Deferred to BUILD-time decision.

---

### Section 2 — Body

Renders active room content. Rooms defined below.

---

### Section 3 — Footer (nav buttons)

One button per available room. Icons determined at BUILD-time.

**Leaderboard button — hidden until level gate reached.** When hidden, other buttons expand to fill available space. When unlocked, button appears and buttons reflow.

---

### Coach Rooms

**Default room logic:**
- Feed has content (user state messages OR coach reactive messages) → FEED loads
- Feed empty AND no reactive messages → RECOMMENDATIONS loads

| Room | Contents | State |
|---|---|---|
| **FEED** | Action inbox — user state messages + coach reactive messages | Live |
| **LEADERBOARD** | Challenge mode, level-gated | Stub LOCAL |
| **RECOMMENDATIONS** | Prebuilt library — tasks, routines, gear, items (badges excluded) | Live |
| **REVIEWING** | Past events interface — Coach passive message source | Live |
| **TRACKING** | Ongoing + upcoming events — Coach passive message source | Live |

---

### FEED Room

Action-oriented inbox. Not a history archive.

**Two message types:**
- User state messages — quest completed, badge awarded, achievement unlocked etc. User can react to send response back. Messages auto-delete on a schedule (BUILD-time decision on interval).
- Coach reactive messages — session-triggered (badge awarded, level up, streak milestone etc.). Surface here when unactioned.

**Reactive message persistence:**
- If user does not action a reactive message during session, Coach picks it up as a passive reference on next login
- Passive follow-up surfaces in footer coach comments (e.g. "hey you have 3 unclaimed badges")
- Does not generate a new feed entry — footer only

---

### RECOMMENDATIONS Room

- Plugs directly into RecommendationsLibrary
- Checks user's existing taskLibrary — surfaces indicator if user already owns a recommended item
- User can remove items from their library from here
- Needs internal tabs to swap between item types: tasks / routines / gear / items
- Tab structure and card/list pattern — defined in menu overlay session (Part 3)
- **Loot drop mechanic** — level-gated batches of additional items unlock (e.g. "10 new items available"). Surfaces based on user level state. Simple to start.
- Future: coin-purchased items surface here — BUILD-time scope

---

### REVIEWING Room

- Displays past events interface
- Surfaces stats — e.g. most XP earned day. Tapping opens that date in day view.
- Coach passively tracks incomplete events in user history — surfaces them here. Tapping opens that event overlay.
- Coach passive message source — reviewing state informs ambient footer comments

---

### TRACKING Room

- Displays ongoing and upcoming events
- Enables nav to relevant menu rooms from within (e.g. tap a resource-linked event → nav to resource room)
- Coach passive message source — tracking state informs ambient footer comments

---

### LEADERBOARD Room

- Hidden entirely until level gate reached
- Nav button does not exist below gate — other footer buttons fill space
- Once unlocked: button appears, buttons reflow
- Challenge mode — stub in LOCAL, full activation APP-STORE

---

## Profile Overlay

Opened from header profile nav button (userIcon). Self-contained layout.

---

### Floating Action Buttons — 4

Persistent shortcuts to profile rooms. Float over the top section.

| Icon | Navigates To |
|---|---|
| Lock | Storage room |
| Trophy | Badge room |
| Backpack | Equipment room |
| (4th TBD) | Preferences room |

---

### Top Section — 2 regions

**Region top:**
- Component: progressive avatar — visual state driven by XP threshold via CharacterLibrary. Tapping avatar navigates to stat group room (default profile room).
- Component: floating text card — displayName + top stat icon + value
- Component: level indicator associated with avatar display

**Region bottom:**
- Component: XP bar — total accumulated XP with level displayed in/on bar
- Component: trophy shortcut — badge room
- Component: backpack shortcut — equipment room

---

### Profile Rooms — 6 total

| Room | Description |
|---|---|
| **Stat Group** | Default room. 91-day stat cube grid per stat. Talent tier popup per stat icon. |
| **Preferences** | Coach tone, character selection (future), theme overrides, time view filter settings, displayName change. Expandable for future settings. |
| **Storage** | Storage budget utility display. Read-only in LOCAL. Expandable later. |
| **Badge Room** | Full badge placement and management interface — pin, arrange badges on board. |
| **Equipment** | Avatar equip + inventory list. Internal nav tabs. |
| **Talent Trees** | 6 trees × 5 tiers. Spend, reset, reclaim talent points. Internal nav TBD — Part 3. |

---

### STAT GROUP Room (default)

**Layout:**
- One row per stat (6 rows — health, strength, agility, defense, charisma, wisdom)
- Fixed left column: stat icon + total stat points
- Horizontal scroll columns: one cube per day for past 91 days showing stat points earned that day

**Interactions:**
- Tap a cube → popup: list of relevant tasks completed that day
- Tap stat icon → popup containing:
  - Current talent tier state (e.g. +1 for health tasks)
  - Tier level affects stat icon visual appearance
  - Summary of last 91 days
  - Scrollable table of relevant tasks completed
  - Talent points available count
  - Button to open talent tree room

**Fixed bottom bar:**
- Talent points available: #
- Star button — nav to talent tree room

---

### BADGE ROOM

- Full management interface — user places, pins and arranges badges on board
- Not display only
- Internal layout (grid vs free-form board) — defined in Part 3

---

### EQUIPMENT Room

Internal nav tabs — 2 tabs:

- **Tab 1 (default): Avatar equip** — equip/unequip gear to avatar slots
- **Tab 2: Inventory list** — all owned items with current location/container displayed

Internal layout detail — defined in Part 3

---

### TALENT TREES Room

- 6 trees × 5 tiers (health, strength, agility, defense, charisma, wisdom)
- Spending a talent point applies immediately — no confirm step
- **Reset** — resets entire talent tree, reclaims all spent points to available balance. Reverses immediately.
- **Single point reclaim** — reclaims one point from an unlocked tier. Reverses immediately.
- Gear dropped from a talent tree tier: if that tier is reclaimed or reset → gear becomes unavailable and auto-unequips from avatar
- No session grace period — all changes immediate
- Internal nav between trees — defined in Part 3

---

### PREFERENCES Room

- Coach tone setting (muted / friendly / militant)
- Character selection — future chapter
- Theme overrides
- Time view filter settings (persistent day/time range filters for DAY, WEEK, 57 WEEK EXPLORER)
- Change displayName (annual gate via User.system.wrappedAnchor per D31)
- Expandable for future settings

---

### STORAGE Room

- Storage budget utility display
- Shows current localStorage usage
- Read-only in LOCAL
- Expandable in MULTI-USER/APP-STORE

---

## Open Items — Deferred to Part 3

| Item | Notes |
|---|---|
| Recommendations room tab structure and card pattern | Covered in menu overlay session |
| Badge room board layout — grid vs free-form | Part 3 |
| Equipment room avatar equip tab layout | Part 3 |
| Talent tree internal nav between 6 trees | Part 3 |
| Goal room Habitats/Adventures split and drill-down nav | Part 3 |
| Resource room type switching and drill-down | Part 3 |
| 4th floating action button icon for preferences | BUILD-time |
| Coach callout bubble near avatar | BUILD-time |
| Feed message auto-delete interval | BUILD-time |

---

*CAN-DO-BE · LOCAL · MVP10 UI SHELL · CONCEPT PART 2 · 2026-03-20*
