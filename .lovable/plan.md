

## Fix Dashboard Stat Card Navigation

Currently, several stat cards on the Dashboard navigate to incorrect pages. Here are the fixes needed:

### Changes in `src/pages/Dashboard.tsx`

| Stat Card | Current Route | Correct Route |
|-----------|--------------|---------------|
| Active Tickets | `/integrations` | `/tickets` |
| Open PRs | `/pull-requests` | `/pull-requests` (already correct) |
| Team Capacity | `/team` | `/team` (already correct) |
| Commits Today | `/integrations` | `/pull-requests` |

### Also fix chart card navigation

The three chart cards (Ticket Trends, Sprint Burndown, PR Activity) all navigate to `/integrations`. These should be updated to:

- **Ticket Trends** -> `/tickets`
- **Sprint Burndown** -> `/tickets`
- **PR Activity** -> `/pull-requests`

### Technical Details

Update the `onClick` handlers in `src/pages/Dashboard.tsx`:
- Line ~101: Change Active Tickets from `navigate('/integrations')` to `navigate('/tickets')`
- Line ~149: Change Commits Today from `navigate('/integrations')` to `navigate('/pull-requests')`
- Line ~158: Change Ticket Trends chart from `navigate('/integrations')` to `navigate('/tickets')`
- Line ~166: Change Sprint Burndown chart from `navigate('/integrations')` to `navigate('/tickets')`
- Line ~174: Change PR Activity chart from `navigate('/integrations')` to `navigate('/pull-requests')`

