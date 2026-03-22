# MVP11 — W31 Manual PM Checklist

**Sprint:** MVP11 W31  
**Feature:** A01 Onboarding Journey (full browser walkthrough)  
**Tester:** PM  
**Date tested:** _____________  
**Build / commit:** _____________

---

## Instructions

1. Open the app in a browser using a **fresh localStorage** (use DevTools → Application → Storage → Clear site data).
2. Complete each step in order.
3. Mark each item `[x]` when confirmed passing.
4. If an item fails, note the issue in the "Notes" column.

---

## Checklist

| # | Step | Pass? | Notes |
|---|------|-------|-------|
| 01 | **Welcome screen on first load** — App shows Welcome screen (not Day view) after clearing localStorage | `[ ]` | |
| 02 | **"Begin" creates user and lands in Day view** — Tapping Begin completes onboarding, user is created, and Day view is displayed with at least one event visible | `[ ]` | |
| 03 | **Welcome Event visible in Day view** — "Welcome to CAN-DO-BE" (or equivalent onboarding event) appears in today's schedule on Day view | `[ ]` | |
| 04 | **Welcome Event opens in Event overlay** — Tapping the Welcome Event opens the Event overlay and the task inside renders correctly | `[ ]` | |
| 05 | **Completing the Welcome task updates the XP bar** — Marking the task complete triggers the XP bar in the header to animate and show increased XP | `[ ]` | |
| 06 | **First achievement fires** — After completing the first task, a badge notification or pop-up appears for the first-task achievement | `[ ]` | |
| 07 | **Badge visible in Profile → Badge Room** — Opening Profile overlay → Badge Room shows at least one earned badge | `[ ]` | |
| 08 | **Feed shows badge.awarded entry** — Opening Coach overlay → Feed room shows a feed entry with a badge-awarded source type | `[ ]` | |
| 09 | **Footer Coach comment shows real text** — The Coach comment in the footer shows non-placeholder, non-empty text after onboarding | `[ ]` | |
| 10 | **Lucky Dice visible in Quick Action room** — Opening Coach overlay → Quick Action room shows the Lucky Dice section | `[ ]` | |
| 11 | **Rolling dice awards XP and shows result** — Tapping the dice in Quick Action room awards XP and shows result text | `[ ]` | |
| 12 | **Day 2 loads after rollover** — Simulate advancing to the next day (set system clock to tomorrow, or trigger rollover manually). App loads Day 2: a new QA event and a new Daily Adventure chain are visible | `[ ]` | |
| 13 | **GOAL room shows Onboarding Adventure with progress** — Profile → GOAL room (or equivalent) lists the Onboarding Adventure act with at least 1 chain completed | `[ ]` | |
| 14 | **SCHEDULE room shows routine tasks (if seeded)** — Profile → SCHEDULE room (or Day view routines) shows any seeded routine templates | `[ ]` | |
| 15 | **TASK room shows prebuilt templates** — Profile → TASK room lists all seeded task templates (login check, welcome, etc.) | `[ ]` | |
| 16 | **RESOURCE room — add a Contact and confirm it saves** — Open Profile → RESOURCE room, add a new Contact resource, confirm it persists across overlay open/close | `[ ]` | |
| 17 | **Dark / light toggle in Preferences works** — Profile → Preferences → toggle dark/light mode; UI updates immediately and persists on page reload | `[ ]` | |
| 18 | **Storage room shows usage in KB (not 0, not error)** — Profile → Storage room shows a valid non-zero KB usage figure without errors | `[ ]` | |

---

## Summary

| | Count |
|---|---|
| Items tested | / 18 |
| Passed | |
| Failed | |
| Blocked / skipped | |

**Overall verdict:** `[ ] PASS`  `[ ] FAIL`  `[ ] CONDITIONAL PASS`

---

## Failure notes

_List any failing items, screenshots, or reproduction steps here._

---

*Generated for MVP11 W31 — CAN-DO-BE.*
