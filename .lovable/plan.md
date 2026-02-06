
# Airbnb Style Redesign Plan

## Overview
This plan transforms the current Jira/Atlassian-styled application into an Airbnb-inspired design with clean aesthetics, warm coral accents, rounded elements, and generous whitespace.

## Airbnb Design Principles to Apply
- **Colors**: White backgrounds, coral/pink accent (#FF385C), soft grays
- **Typography**: Clean, modern Inter font with generous line-height
- **Corners**: Rounded elements (12-16px border radius)
- **Spacing**: Generous whitespace and breathing room
- **Shadows**: Subtle, soft shadows for depth
- **Cards**: Clean cards with hover animations and rounded corners
- **Buttons**: Pill-shaped buttons, gradient accents

---

## Phase 1: Design System Foundation

### 1.1 Update Global Styles (src/index.css)
- Replace Jira color variables with Airbnb palette:
  - Primary: `#FF385C` (Airbnb coral/pink)
  - Background: `#FFFFFF` (pure white)
  - Secondary backgrounds: `#F7F7F7`
  - Text primary: `#222222`
  - Text secondary: `#717171`
  - Border: `#DDDDDD`
  - Success: `#008A05`
  - Warning: `#C13515`
- Update global component classes for Airbnb styling
- Add new shadow definitions for soft, diffused shadows
- Update scrollbar styling to be minimal

### 1.2 Update Tailwind Config (tailwind.config.ts)
- Add Airbnb color palette as custom colors
- Update border-radius defaults to larger values (12px, 16px)
- Add new spacing tokens for generous padding
- Define Airbnb-style shadows
- Add custom font-size scale

---

## Phase 2: Sidebar Redesign

### 2.1 Transform Sidebar (src/components/layout/Sidebar.tsx)
**Current**: Dark navy (#172B4D) with white text
**New**: Light sidebar with clean white/gray background

Changes:
- Background: White with subtle gray border
- Navigation items: Dark text with coral hover/active states
- Logo area: Clean with coral accent
- Quick Stats section: Cards with soft backgrounds
- User profile: Clean avatar with simple layout
- Toggle button: Subtle gray with coral hover
- Remove uppercase labels, use natural case

---

## Phase 3: Dashboard Redesign

### 3.1 Dashboard Page (src/pages/Dashboard.tsx)
**Current**: Dense grid with dark cards and Jira-style stats
**New**: Open layout with card-based sections

Changes:
- **Header**: Simple greeting with rounded buttons
  - Primary button: Coral gradient with pill shape
  - Secondary button: Gray outline with rounded corners
- **Stat Cards**: 
  - White background with subtle shadow
  - Large rounded corners (16px)
  - Coral accents for trends
  - Clean typography hierarchy
- **Charts Section**: 
  - Clean white cards with rounded corners
  - Minimal chart headers
  - Soft grid lines
- **Activity/PR Lists**: 
  - Card-based layout with hover animations
  - Avatar circles with subtle borders
  - Clean time stamps
- **Team Workload**: 
  - Horizontal card layout
  - Progress bars with coral gradient
  - Clean avatar presentation
- **Repositories**: 
  - Grid of cards with subtle hover
  - Language indicators as colored dots
  - Clean metadata display

---

## Phase 4: Chat Assistant Redesign

### 4.1 Chat Page (src/pages/ChatAssistant.tsx)
**Current**: Dark theme (#1a1a2e, #0f0f1a) with purple gradients
**New**: Clean white interface with coral accents

Changes:
- **Chat Sidebar**:
  - White/light gray background
  - Clean conversation list with subtle dividers
  - Coral "New Chat" button with rounded shape
  - Active conversation: Coral left border accent
- **Chat Header**:
  - White background with clean bottom border
  - Coral gradient icon
  - Clean typography
- **Messages Area**:
  - User messages: Right-aligned, coral background bubbles
  - AI messages: Left-aligned, white/gray background cards
  - Clean rounded corners on message bubbles
  - Soft shadows
- **Input Area**:
  - White background with rounded input field
  - Coral send button (circular)
  - Clean attachment previews
  - Subtle border styling

---

## Phase 5: Integrations Page Redesign

### 5.1 Integrations Page (src/pages/Integrations.tsx)
**Current**: Notion-style cards with Jira coloring
**New**: Airbnb-style clean cards

Changes:
- **Page Header**: Clean typography with generous spacing
- **Integration Cards**:
  - White background with 16px border radius
  - Soft hover shadow animation
  - Clean icon containers
  - Coral "Connect" buttons (pill-shaped)
  - Green "Connected" badges
- **Coming Soon Section**:
  - Gray/disabled appearance
  - Clean "Coming Soon" badges
- **Drawer/Modal**:
  - Rounded corners (24px top)
  - Clean close button
  - Coral accent buttons

---

## Phase 6: Team Page Redesign

### 6.1 Team Page (src/pages/Team.tsx)
**Current**: Grid cards with notion styling
**New**: Clean profile cards with Airbnb aesthetics

Changes:
- **Stats Bar**:
  - Horizontal cards with soft backgrounds
  - Large typography for numbers
  - Clean labels
- **Search/Filters**:
  - Rounded search input with icon
  - Pill-shaped filter buttons
  - Coral active state
- **Team Cards**:
  - White cards with generous padding
  - Circular avatars (not rounded squares)
  - Coral capacity progress bars
  - Hover scale/shadow animation
  - Clean "View Profile" button
- **Profile Modal**:
  - Large rounded corners
  - Clean header layout
  - Coral accent buttons
  - Skill tags with rounded pills

---

## Phase 7: Settings Page Redesign

### 7.1 Settings Page (src/pages/Settings.tsx)
**Current**: Jira-style with notion inputs
**New**: Clean Airbnb-style settings

Changes:
- **Navigation Tabs**:
  - Vertical list with coral active indicator
  - Clean hover states
  - Rounded selection background
- **Profile Section**:
  - Circular avatar upload
  - Clean form inputs with rounded corners
  - Coral primary button
- **Notifications**:
  - Clean toggle switches (coral when active)
  - Rounded section cards
  - Checkbox list with clean styling
- **Appearance**:
  - Theme cards with clean borders
  - Coral checkmark for selected
  - Clean font size buttons
- **Integrations Status**:
  - Clean status cards
  - Green/gray status indicators
- **Privacy**:
  - Clean action cards
  - Coral warning for delete

---

## Implementation Order

1. **Foundation** (Phase 1): CSS variables and Tailwind config
2. **Sidebar** (Phase 2): Core navigation transformation
3. **Dashboard** (Phase 3): Main page redesign
4. **Chat** (Phase 4): Chat interface overhaul
5. **Supporting Pages** (Phases 5-7): Integrations, Team, Settings

---

## Technical Details

### New CSS Variables
```text
--airbnb-coral: #FF385C
--airbnb-coral-dark: #E31C5F
--airbnb-coral-light: #FFEBEF
--airbnb-black: #222222
--airbnb-gray-dark: #484848
--airbnb-gray: #717171
--airbnb-gray-light: #B0B0B0
--airbnb-gray-lighter: #DDDDDD
--airbnb-background: #FFFFFF
--airbnb-background-alt: #F7F7F7
--airbnb-success: #008A05
--airbnb-warning: #C13515
```

### Component Style Updates
- Border radius: 12px (default), 16px (cards), 24px (modals), 50px (pills)
- Shadows: `0 6px 16px rgba(0,0,0,0.12)` (hover), `0 2px 8px rgba(0,0,0,0.08)` (default)
- Transitions: 200ms ease for all interactive elements
- Font weights: 400 (body), 500 (medium), 600 (semibold), 800 (bold)

### Files to Modify
1. `src/index.css` - Global styles and CSS variables
2. `tailwind.config.ts` - Theme configuration
3. `src/components/layout/Sidebar.tsx` - Navigation redesign
4. `src/components/layout/AppLayout.tsx` - Layout adjustments
5. `src/pages/Dashboard.tsx` - Main dashboard
6. `src/pages/ChatAssistant.tsx` - Chat interface
7. `src/pages/Integrations.tsx` - Integrations page
8. `src/pages/Team.tsx` - Team directory
9. `src/pages/Settings.tsx` - Settings page
