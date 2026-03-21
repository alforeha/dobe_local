# CAN-DO-BE · LOCAL CHAPTER
## MVP10 UI SHELL — CONCEPT DECISIONS PART 3
**Menu Overlay + Room Layouts · 2026-03-20**

---

## Global Rules

### Scroll Containment
Scroll regions are contained within their defined content area only. Headers and footers within any section, room, or overlay are always fixed in place. Scroll never bleeds outside its intended container. Applies to:
- Main app body time views
- Overlay content areas
- Room content areas within overlays
- Expanded blocks within rooms

---

## Menu Overlay

**Layout:**
- Region left: content area
- Region right: collapsible nav panel
- Nav panel auto-collapses on room selection — user can re-expand
- EXIT MENU button closes overlay and returns to body time view

**Nav buttons:** WORLD / GOAL / TASK / SCHEDULE / RESOURCE / QUICK ACTION / EXIT MENU

**Default room on open:** QUICK ACTION

---

### WORLD Room

- Placeholder for LOCAL v1
- Content: centred "coming soon" text
- Background: map graphic
- No data reads

---

### GOAL Room

**2 sections: header + body**

**Header — fixed:**
- Left: title
- Right: nav tabs — Habitats / Adventures
- Add Act button — available in Habitats tab only

**Body — vertical scroll, contained:**
- Act blocks for existing records
- Shared layout between Habitats and Adventures tabs

**Act block — 2 states:**

Collapsed:
- Icon + name + status indicator (active / pending / inactive — distinct visual per state)

Expanded (tap to expand inline):
- Displays Chain list within the block
- Tapping a Chain opens Chain popup
- Coach-generated Acts: read-only, no edit capability
- User-created Acts: edit button available

**Chain popup:**
- Opens on Chain tap from expanded Act block
- Contains Quest and Milestone management
- Close/back returns to expanded Act block in content area
- Internal layout — BUILD-time

**Habitats tab:** user-created Acts
**Adventures tab:**
- Active committed Coach quest
- Daily Coach-generated adventure (user must commit to get into record)
- Virtual instances of available Coach library Acts (uncommitted)
- Inactive Acts/chains have distinct visual state from active or pending
- One Act chain commitment gate enforced (per D57)
- All Coach-generated content: read-only

**Stores reads/writes:** useProgressionStore

---

### TASK Room

**2 sections: header + body**

**Header — fixed:**
- Left: title
- Right: 3 buttons — Stat Tasks / Resource Tasks / Add Task (opens popup)

**Body — vertical scroll, contained:**
- Task blocks in table layout

**Task block components:**
- Task name
- Task info
- Quick complete button
- Edit button (stat tasks only — resource tasks show jump-to-resource instead)
- Favourite button

**Stat Tasks tab:**
- All tasks NOT created by resources
- Filter by stat group
- Filter by secondary tag (fixed enum — values BUILD-time e.g. workouts, cook meals)

**Resource Tasks tab:**
- All tasks created by user resources
- Filter by resource type or specific resource
- No edit button — jump to resource instead

**Data model addition — secondary tag on TaskTemplate:**
- Fixed enum to start
- Enables grouping/filtering by category
- User-defined tags deferred to future chapter
- Enum values: BUILD-time decision

**Stores reads/writes:** useScheduleStore (taskLibrary), useResourceStore (resource tasks)

---

### SCHEDULE Room

**2 sections: header + body**

**Header — fixed:**
- Left: title
- Right: nav tabs — Routines / Leagues

**Body — vertical scroll, contained:**

Fixed sub-header (both tabs):
- Filter controls
- Add button (opens popup)

**PlannedEvent block components:**
- Name
- Info
- Edit button

**Routines tab:**
- List of existing PlannedEvents
- Filter by type
- Add routine button (popup)

**Leagues tab:**
- Stub in LOCAL — tab visible but locked state
- Filter by type + filter by contacts
- Add league button (popup — assumes shared state)
- Leagues = shared PlannedEvents between contacts
- Full activation: MULTI-USER

**Stores reads/writes:** useScheduleStore (plannedEvents)

---

### RESOURCE Room

**2 sections: header + body**

**Header — fixed:**
- Resource type nav buttons: Contacts / Homes / Vehicles / Accounts / Inventory / Docs

**Body — consistent layout per resource type:**

Fixed sub-header:
- Left: title
- Right: filters + add button

Content area — vertical scroll, contained:
- Resource blocks for existing records

**Resource block — 2 states:**

Collapsed:
- Icon + name

Expanded (tap to expand):
- Top row: icon / name / close button
- Middle: resource type-specific info — BUILD-time per type
- Bottom: edit button

**Notes:**
- One vs multiple blocks expanded simultaneously — BUILD-time decision
- Expanded view detail per resource type — BUILD-time

**Stores reads/writes:** useResourceStore (all 6 types)

---

### QUICK ACTION Room

**2 sections: header + body**

**Header — fixed:**
- Left: title
- Right: nav tabs — Action / Shopping + schedule one-off event button (opens popup)

**Action tab — vertical scroll, contained, 4 rows:**
- Row 1: GTD title left / add button right (opens popup)
- Row 2: GTD task blocks — execute button + popup confirm
- Row 3: Favourite Tasks title
- Row 4: Favourite task blocks — execute button + popup confirm

**Shopping tab — vertical scroll, contained:**
- Row 1: Shopping title left / add button right (opens popup)
- Row 2: Shopping item blocks — check off and log

**Stores reads/writes:** useScheduleStore (gtdList, favouritesList, shoppingLists), useResourceStore (resource context)

---

## Profile Room Detail — Deferred from Part 2

### BADGE ROOM

- Free-form placement board
- User drags and positions badges freely
- No fixed grid constraint
- Earned badges awaiting placement surface from BadgeBoard.earned[]
- Placed badges write to BadgeBoard.pinned[]

**Stores reads/writes:** useResourceStore (badges), useUserStore (BadgeBoard)

---

### EQUIPMENT Room

Internal nav tabs — 2 tabs:

**Tab 1 (default): Avatar Equip**
- Region left: avatar slot display — all available slots with current equipped state
- Region right: vertical scroll gear list with filter — user selects gear to assign to slot
- Equip/unequip writes to Avatar.equippedGear{}

**Tab 2: Inventory List**
- All owned items with current location/container displayed
- Vertical scroll

**Stores reads/writes:** useUserStore (Avatar, Equipment), useResourceStore (Gear, Useables)

---

### TALENT TREE Room

**Layout:**
- Top row: stat group nav buttons — one per tree (health / strength / agility / defense / charisma / wisdom)
- Default tree on open: user's highest stat group
- Below nav: vertical scroll with tier slots for active tree — contained
- Switching stat nav button swaps tree content in scroll area

**Interactions:**
- Spend talent point — applies immediately, no confirm
- Reset entire tree — reclaims all points immediately, reverses all enhancements immediately
- Single point reclaim — reclaims one tier point immediately, reverses that tier's enhancement
- Gear dropped from reclaimed/reset tier — auto-unequips from avatar and becomes unavailable immediately
- No session grace period — all changes immediate

**Stores reads/writes:** useUserStore (UserStats.talentTree, talentPoints), useResourceStore (Gear — for auto-unequip)

---

## Open Items — Deferred to BUILD

| Item | Notes |
|---|---|
| Chain popup internal layout | Quest/Milestone management detail |
| Resource block expanded view detail per type | Per all 6 resource types |
| One vs multiple resource blocks expanded simultaneously | UX decision |
| Secondary task tag fixed enum values | BUILD-time content decision |
| Schedule filter type options | BUILD-time |
| Add Task popup layout | BUILD-time |
| Add Routine popup layout | BUILD-time |
| Schedule one-off event popup layout | BUILD-time |
| GTD add popup layout | BUILD-time |
| Shopping add popup layout | BUILD-time |
| Task block quick complete behaviour (inline or confirm) | BUILD-time |
| Equipment room gear list filter options | BUILD-time |
| Talent tree tier slot visual design | BUILD-time |
| Act block status visual states (active/pending/inactive) | BUILD-time |

---

## Data Model Additions Flagged in This Session

| Addition | Notes |
|---|---|
| Secondary tag on TaskTemplate | Fixed enum, grouping/filtering in TASK room. Enum values BUILD-time. User-defined tags future chapter. |

---

*CAN-DO-BE · LOCAL · MVP10 UI SHELL · CONCEPT PART 3 · 2026-03-20*
