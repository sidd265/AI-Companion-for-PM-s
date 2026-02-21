

## Add Service Layer for All Remaining Pages

All chart components and the Tickets/PullRequests pages already use a clean service layer. The remaining pages and components still import mock data directly. This plan adds service files and React Query hooks so every data access goes through a swappable service function.

### New Service Files to Create

**1. `src/services/dashboard.ts`**
- `fetchDashboardStats()` -- returns dashboard stat cards data (active tickets, open PRs, team capacity, commits)
- `fetchRecentActivity()` -- returns recent activity feed
- `fetchTicketsByStatus()` -- returns ticket counts grouped by status
- `fetchTicketsByPriority()` -- returns ticket counts grouped by priority
- `fetchTeamWorkload()` -- returns team members with workload percentages
- `fetchRepositorySummaries()` -- returns repo list with language and open PR count

**2. `src/services/team.ts`**
- `fetchTeamMembers(filters?)` -- returns team members with optional search/expertise filters
- `fetchTeamStats()` -- returns aggregate team stats (total members, avg velocity, active tasks, coverage)
- `addTeamMember(member)` -- placeholder for creating a member (currently just returns success)

**3. `src/services/chat.ts`**
- `fetchConversations()` -- returns conversation list
- `sendMessage(conversationId, message)` -- sends a user message
- `generateAIResponse(conversationId, query)` -- returns AI response
- `createConversation()` -- creates new conversation
- `deleteConversation(id)` -- deletes a conversation

**4. `src/services/integrations.ts`**
- `fetchIntegrationStatuses()` -- returns GitHub/Jira/Slack connection status
- `connectIntegration(type)` -- placeholder for connecting
- `disconnectIntegration(type)` -- placeholder for disconnecting
- `syncIntegration(type)` -- placeholder for triggering sync

**5. `src/services/settings.ts`**
- `fetchUserProfile()` -- returns current user profile
- `updateUserProfile(data)` -- placeholder for saving profile changes
- `updateNotificationPreferences(prefs)` -- placeholder
- `exportUserData()` -- placeholder
- `deleteAccount()` -- placeholder

**6. `src/services/tickets.ts` (extend existing)**
- `createTicket(data)` -- placeholder for ticket creation (used by CreateTicketModal)

### New React Query Hooks

**`src/hooks/useDashboardData.ts`**
- `useDashboardStats()`, `useRecentActivity()`, `useTeamWorkload()`, `useRepositorySummaries()`

**`src/hooks/useTeamData.ts`**
- `useTeamMembers(filters?)`, `useTeamStats()`

**`src/hooks/useChatData.ts`**
- `useConversations()`, plus mutation hooks for send/create/delete

**`src/hooks/useIntegrations.ts`**
- `useIntegrationStatuses()`

**`src/hooks/useUserProfile.ts`**
- `useUserProfile()`

### Page Updates

Each page will be updated to import from the new hooks instead of directly from `mockData.ts`:

- **Dashboard.tsx**: Use `useDashboardStats()`, `useRecentActivity()`, etc. instead of direct mock imports
- **Sidebar.tsx**: Use `useDashboardStats()` and `useUserProfile()` hooks
- **Team.tsx**: Use `useTeamMembers()` and `useTeamStats()`
- **ChatAssistant.tsx**: Use `useConversations()` and mutation hooks
- **Integrations.tsx**: Use `useIntegrationStatuses()`
- **Settings.tsx**: Use `useUserProfile()` and `useIntegrationStatuses()`
- **CreateTicketModal.tsx**: Use `useTeamMembers()` for assignee list, call `createTicket()` on submit
- **AddMemberModal.tsx**: Call `addTeamMember()` on submit

### Summary of Scope

- 5 new service files + 1 extension
- 5 new hook files
- 8 component/page updates
- All mock data stays in `mockData.ts` but is only accessed through service functions
- Every service function has a TODO comment indicating what API call to replace it with

