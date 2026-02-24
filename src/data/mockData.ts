// PMPilot shared type definitions.
// All mock data has been removed — services query Supabase and GitHub API directly.

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  github: string;
  slack: string;
  expertise: string[];
  capacity: number;
  currentTasks: JiraTicket[];
  recentActivity: { commits: number; reviews: number; prsOpened: number };
  avatarColor: string;
}

export interface JiraTicket {
  id: string;
  key: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee?: TeamMember;
  project: string;
  type: 'Bug' | 'Story' | 'Task' | 'Epic';
  createdAt: string;
  updatedAt: string;
}

export interface GitHubPR {
  id: string;
  number: number;
  title: string;
  repo: string;
  author: TeamMember;
  reviewers: TeamMember[];
  status: 'Open' | 'Merged' | 'Closed';
  createdAt: string;
  updatedAt: string;
  additions: number;
  deletions: number;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  languages: string[];
  stars: number;
  contributors: number;
  lastUpdated: string;
  openPRs: number;
  url: string;
}

export interface Activity {
  id: string;
  type: 'commit' | 'pr' | 'review' | 'ticket' | 'assignment' | 'ai';
  actor: TeamMember;
  action: string;
  target?: string;
  targetUrl?: string;
  timestamp: string;
  source: 'github' | 'jira' | 'ai';
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  component?: { type: 'repo_summary' | 'assignment_suggestion' | 'ticket_list'; data: Record<string, unknown> };
  attachments?: { name: string; type: string; size: number; url: string }[];
}
