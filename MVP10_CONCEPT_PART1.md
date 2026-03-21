# CAN-DO-BE · LOCAL CHAPTER
## MVP10 UI SHELL — CONCEPT DECISIONS PART 1
**Main App Layout + Time View Features · 2026-03-20**

---

## Terminology

| Term | Definition |
|---|---|
| **Section** | Major layout division — header, body, footer |
| **Region** | Part of a section — top, bottom, left, right, grid |
| **Component** | Part of a region — button, display info, label |
| **Feature** | Reusable UI section — time views, menu rooms etc. |
| **Overlay** | Popups, modals, full-screen panels |
| **Floating delta** | Brief auto-dismissing indicator showing a value change (e.g. +100 XP) |

---

## Main App Layout

Three fixed sections. Footer does not persist into overlays — overlays have their own layout considerations.

---

### Section 1 — Header

Fixed at top.

**Region left**
- Component: profile nav button
  - Displays userIcon (app icon by default)
  - Opens profile overlay on tap

**Region right — 3 rows**
- Row 1: level progression bar
  - Left: displayName
  - Right: next level number
  - Visual XP bar underneath
- Row 2: stat level row
  - All 6 stat icons (health, strength, agility, defense, charisma, wisdom) with current values
- Row 3:
  - Left: active boosts icons + streak icon
  - Right: gold value

**Live updates**
- All header values (XP bar, stat values, gold, streak) update reactively on state change
- Floating delta indicator appears on change (e.g. +100, +2 agility) and auto-dismisses

---

### Section 2 — Body

Content area. Renders the active time view feature. No side panel.

- Feature: DAY view
- Feature: WEEK view
- Feature: 57 WEEK EXPLORER
- Active feature controlled by footer time view nav buttons

---

### Section 3 — Footer

Fixed at bottom. Does not persist into overlays.

**Region top row — time view nav buttons**
- D button — loads Day view
- W button — loads Week view
- M button — loads 57 Week Explorer
- Tapping the active view's button jumps to today / current seed (see time view nav rules below)

**Region bottom row**
- Left: coach nav button
  - Displays coachIcon (varies by coachCharacter — future)
  - Opens coach overlay on tap
- Centre: coach comments
  - Passive ambient text display
  - Occasional actionable link (e.g. "claim your badge" — taps jump to relevant location)
  - Not a full interactive surface
- Right: menu nav button
  - Opens menu overlay on tap

---

## Time View Features

All three time views live in the body section. All share:
- Conditional display logic based on date state (past / present / future)
- Persistent filter settings saved to user preferences (Settings)
- Event block colour pulled from PlannedEvent.color
- Past + present dates: event data from User.events.active[] and history[]
- Future dates: event data from User.schedule.planned[] (PlannedEvents)

**Store reads:** useScheduleStore, useUserStore, useResourceStore

---

### Feature — DAY View

**Header — 4 regions**

| Region | Contents |
|---|---|
| Left | Back nav button — previous day |
| Centre-left | Row 1: date (DDD MMM DD format) / Row 2: conditional — current+future: scheduled GTD item icons / past: completed quick action icons |
| Centre-right | Weather display — icon left, high/low temps stacked right. **Placeholder in LOCAL. Implement in MULTI-USER.** |
| Right | Forward nav button — next day |

**Body — vertical scroll**
- Row per hour: 2 columns — hour time label / content
- User can set time range filter — default 24hr, adjustable. Persistent.
- Event blocks placed by scheduled start time
- Minimum block height defined — rows expand height when multiple events occupy the same hour
- Multi-hour events stretch across rows
- Current day: time indicator line showing current time position

**Event blocks**
- Colour from PlannedEvent.color
- Overlapping events (same scheduled time): offset horizontally within the hour row
- Display: eventName, time range (##:## → ##:##), task completion count (## / ##)

**Event block interactions — conditional**
- Past + present: tap opens event overlay for that event
- Future — PlannedEvent from resource: tap navigates to generating resource
- Future — scheduled GTD item: tap opens popup showing options, user can nav to generating resource

**Today jump** — tapping D nav button while in day view reloads to today's date

---

### Feature — WEEK View

**Header — 3 regions**

| Region | Contents |
|---|---|
| Left | Back nav button — previous week |
| Centre | Date range display — 2 rows stacked |
| Right | Forward nav button — next week |

**Body — horizontal scroll**
- One day block per day, Monday through Sunday (default)
- Day blocks have minimum fixed width — overflow handled by horizontal scroll, no compression below min width
- Tapping a day block opens that date in day view

**Day block — 2 sections**

Block header — 2 regions:
- Left: date
- Right: weather icon + day high temp + GTD icons (future/present) or completed quick action icons (past)

Block content:
- Event cards — name only, centred in card, truncated
- Colour from PlannedEvent.color
- Same conditional past/present/future logic as day view
- No hour column

**Filters — persistent**
- Day filter: user selects which days display as blocks. Default M-Su.
- Time range filter: controls time range shown in day block content. Default BUILD-time decision.

**Today jump** — tapping W nav button while in week view jumps to week containing today

---

### Feature — 57 WEEK EXPLORER (Month View)

**Header — 2 regions**

| Region | Contents |
|---|---|
| Left | Row 1: "57 WEEK EXPLORER" / Row 2: SEED: [date] |
| Right | Row 1: -13 weeks → YYYY/MMM/DD / Row 2: +44 weeks → YYYY/MMM/DD |

**Seed date**
- Default: today (runtime calculated)
- User can manually change seed date to shift the entire window to a different anchor
- Changing seed updates the calculated range display and repositions scroll

**Body — 2 sections**

Fixed sub-header: day of week labels — M T W TH F S SU

Vertical scroll content — week rows:
- View automatically finds the previous Monday from seed date to keep weeks complete
- Each week row contains day blocks M-Su
- Tapping a week row opens that week in week view

**Day block — 2 sections**

Block header — 2 regions:
- Left: date
- Right: weather icon + GTD icons (future/present) or completed quick action icons (past)

Block content:
- Event cards — colour only, no name, visual density reference
- On the 1st of each month: MMM label displayed on left side of that day's block

**Filters — persistent**
- Day filter: user selects which days display. Default M-Su.
- Time range filter: controls time range shown in day block content.

**Today jump** — tapping M nav button while in 57 Week Explorer scrolls to seed date position

---

## Event Overlay

Triggered from day view on tap of past or present event block.

Border colour from PlannedEvent.color. Three sections.

**Section 1 — Header**
- Region left: Row 1 — eventName / Row 2 — date + time range (MM/DD hh:mm → MM/DD hh:mm)
- Region right: close (X) button

**Section 2 — Task Block**
- Live representation of selected task
- Renders dynamically by TaskType — shape changes per type (CHECK, SETS_REPS, CIRCUIT etc.)
- Displays TaskTemplate.media before input when present
- Input capture inline — no nested overlay
- Changes apply as user interacts — no explicit save step
- Completion state determined by TaskType end state
- Editable after completion — user can correct values directly
- Default/empty state when no task selected

**Section 3 — Event Task Table**
- Region top — action bar:
  - Play button — toggles auto-advance mode (auto-selects next task on completion, auto-surfaces media)
  - Attachment button — opens popup: view/add/remove attachments at event or task level
  - Link button — opens popup: view/link/unlink resources
  - Shared button — stub in LOCAL, visible inactive
  - Location button — opens popup: view/set event location
  - Task completion count (## / ##) + completion state display
- Region mid — table header: task / type / state columns
- Region bottom — vertical scroll task list. Selecting a task loads it into task block above.

**Store reads/writes:**
- useScheduleStore — event, tasks, completion state
- useUserStore — XP awards via award pipeline
- useResourceStore — attachments, resource context

---

## Open Items — Deferred

| Item | Deferred To |
|---|---|
| Weather implementation | MULTI-USER |
| Gear shop location | TBD |
| Theme override entry point | Profile overlay (probable) |
| GTD popup spec for future event taps | Overlays session |
| Task block input shapes per TaskType | Overlays / BUILD session |
| Time range filter default values | BUILD-time |
| Floating delta animation spec | BUILD-time |
| Play mode media auto-advance behaviour edge cases | BUILD-time |

---

*CAN-DO-BE · LOCAL · MVP10 UI SHELL · CONCEPT PART 1 · 2026-03-20*
