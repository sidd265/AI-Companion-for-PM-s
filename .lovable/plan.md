
# Tickets Page Redesign -- Clean, Approachable, Non-Technical

## Problem
The current page stacks too many elements vertically: header, 5 summary cards, a filter card, a results count line, then the ticket list. For non-technical users, this feels dense and overwhelming before they even see a ticket.

## Design Philosophy
- **Breathe**: Reduce visual noise, remove unnecessary borders and cards-within-cards
- **Hierarchy**: One clear focal point (the ticket list/board), with filters and stats as supporting elements
- **Warmth**: Lean into the Airbnb aesthetic -- soft colors, generous spacing, friendly language
- **Glanceable**: Key stats should be scannable in under 2 seconds

---

## Layout Changes

### 1. Simplified Header Bar
Combine the title, view toggle, and "Open Jira" into a single clean row. Move the sync indicator into a subtle tooltip or tiny inline badge rather than a separate subtitle line.

### 2. Inline Stats Strip (replaces 5 summary cards)
Replace the 5 separate summary cards with a compact **horizontal stats strip** -- a single row of pill-shaped stat indicators showing counts with colored dots. This saves significant vertical space while keeping the same info glanceable.

```text
[ * To Do: 1 ] [ * In Progress: 2 ] [ * In Review: 1 ] [ * Done: 0 ] [ * Blocked: 1 ]
```

Each pill is clickable to filter by that status. The active filter gets a highlighted ring. This merges the summary cards and status filter into one element.

### 3. Streamlined Filter Bar
- Remove the "FILTERS" card wrapper -- filters sit directly on the page as inline controls
- Search input + priority dropdown + project dropdown in a single clean row
- Status filter is now handled by the stats strip above (clicking a status pill filters)
- "Clear all" appears inline only when filters are active
- Remove the separate "Showing X of Y tickets" line -- integrate the count into the search placeholder or a subtle label

### 4. Refined Ticket Cards
- Slightly more padding and breathing room
- Assignee avatar on the right side for visual balance
- Cleaner metadata row with less visual clutter (fewer dots/separators)
- Subtle left-border color accent based on priority (Critical=red, High=orange, Medium=amber, Low=gray)

### 5. Improved Empty State
- Friendlier illustration and copy
- Contextual: if filters are active, suggest clearing them; if no tickets at all, show a "connect Jira" prompt

### 6. Board View Polish
- Keep the existing Kanban board mostly as-is, it works well
- Add the same inline stats strip at the top for consistency

---

## Technical Plan

### Files to Modify

**`src/pages/Tickets.tsx`**
- Restructure the layout into 3 clear zones: Header row, Stats + Filters row, Content area
- Replace `TicketSummaryCards` with new `TicketStatusFilter` inline component
- Merge the results count into the filter area
- Add status filtering via clickable stat pills (clicking a pill sets `filters.status`)

**`src/components/tickets/TicketStatusFilter.tsx`** (new file)
- Horizontal row of clickable status pills
- Each pill shows a colored dot, label, and count
- Active pill gets a ring/highlight
- "All" pill at the start to clear the status filter
- Compact, single-line design

**`src/components/tickets/TicketCard.tsx`**
- Add a left-border accent color based on priority
- Move assignee avatar to the right side
- Simplify the metadata separators
- Slightly increase vertical padding

**`src/components/tickets/TicketSummaryCards.tsx`**
- Remove this file (replaced by TicketStatusFilter)

**`src/components/tickets/KanbanBoard.tsx`**
- Minor refinements: slightly more card padding, consistent with list view cards

### No Changes To
- `src/services/tickets.ts` -- service layer stays the same
- `src/data/mockData.ts` -- mock data stays the same
- Badge/status components -- reused as-is

---

## Visual Before vs After

**Before**: Title -> Subtitle -> 5 cards grid -> Filter card (with header + 4 inputs) -> "Showing X of Y" -> Ticket list

**After**: Title + toggle + action (1 row) -> Status pills + Search + 2 dropdowns (1 row) -> Ticket list

This reduces the "chrome" above the actual ticket content from approximately 280px to approximately 120px, letting users see tickets immediately.
