// Mock Data for AM PM App

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
  recentActivity: {
    commits: number;
    reviews: number;
    prsOpened: number;
  };
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
  component?: {
    type: 'repo_summary' | 'assignment_suggestion' | 'ticket_list';
    data: Record<string, unknown>;
  };
  attachments?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
}

// Team Members
export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    initials: 'SC',
    role: 'Senior Backend Engineer',
    email: 'sarah@company.com',
    github: '@sarachen',
    slack: '@sarah',
    expertise: ['Python', 'AWS', 'Docker', 'PostgreSQL', 'Redis', 'Node.js'],
    capacity: 0.75,
    currentTasks: [],
    recentActivity: { commits: 23, reviews: 12, prsOpened: 5 },
    avatarColor: '#E255A1',
  },
  {
    id: '2',
    name: 'Michael Torres',
    initials: 'MT',
    role: 'Frontend Lead',
    email: 'michael@company.com',
    github: '@mtorres',
    slack: '@michael',
    expertise: ['React', 'TypeScript', 'CSS', 'Tailwind', 'Next.js'],
    capacity: 0.60,
    currentTasks: [],
    recentActivity: { commits: 31, reviews: 18, prsOpened: 8 },
    avatarColor: '#2383E2',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    initials: 'ER',
    role: 'Full Stack Developer',
    email: 'emily@company.com',
    github: '@emilyr',
    slack: '@emily',
    expertise: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'GraphQL'],
    capacity: 0.85,
    currentTasks: [],
    recentActivity: { commits: 19, reviews: 7, prsOpened: 3 },
    avatarColor: '#0F7B6C',
  },
  {
    id: '4',
    name: 'David Kim',
    initials: 'DK',
    role: 'DevOps Engineer',
    email: 'david@company.com',
    github: '@davidkim',
    slack: '@david',
    expertise: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Linux'],
    capacity: 0.45,
    currentTasks: [],
    recentActivity: { commits: 15, reviews: 9, prsOpened: 4 },
    avatarColor: '#D9730D',
  },
  {
    id: '5',
    name: 'Lisa Wang',
    initials: 'LW',
    role: 'QA Engineer',
    email: 'lisa@company.com',
    github: '@lisawang',
    slack: '@lisa',
    expertise: ['Selenium', 'Jest', 'Cypress', 'Python', 'Test Automation'],
    capacity: 0.55,
    currentTasks: [],
    recentActivity: { commits: 8, reviews: 22, prsOpened: 2 },
    avatarColor: '#9065B0',
  },
  {
    id: '6',
    name: 'James Park',
    initials: 'JP',
    role: 'Backend Developer',
    email: 'james@company.com',
    github: '@jamespark',
    slack: '@james',
    expertise: ['Go', 'gRPC', 'Microservices', 'Redis', 'Kafka'],
    capacity: 0.70,
    currentTasks: [],
    recentActivity: { commits: 27, reviews: 14, prsOpened: 6 },
    avatarColor: '#DFAB01',
  },
];

// Repositories
export const repositories: Repository[] = [
  {
    id: '1',
    name: 'payment-service',
    fullName: 'company/payment-service',
    description: 'Handles all payment processing with Stripe integration',
    language: 'TypeScript',
    languages: ['TypeScript', 'JavaScript'],
    stars: 234,
    contributors: 12,
    lastUpdated: '2 days ago',
    openPRs: 3,
    url: 'https://github.com/company/payment-service',
  },
  {
    id: '2',
    name: 'user-auth',
    fullName: 'company/user-auth',
    description: 'Authentication and authorization microservice',
    language: 'Python',
    languages: ['Python', 'SQL'],
    stars: 156,
    contributors: 8,
    lastUpdated: '1 day ago',
    openPRs: 2,
    url: 'https://github.com/company/user-auth',
  },
  {
    id: '3',
    name: 'web-frontend',
    fullName: 'company/web-frontend',
    description: 'Main web application frontend built with React',
    language: 'TypeScript',
    languages: ['TypeScript', 'CSS', 'HTML'],
    stars: 89,
    contributors: 6,
    lastUpdated: '5 hours ago',
    openPRs: 5,
    url: 'https://github.com/company/web-frontend',
  },
  {
    id: '4',
    name: 'api-gateway',
    fullName: 'company/api-gateway',
    description: 'Central API gateway for all microservices',
    language: 'Go',
    languages: ['Go'],
    stars: 67,
    contributors: 4,
    lastUpdated: '3 days ago',
    openPRs: 1,
    url: 'https://github.com/company/api-gateway',
  },
  {
    id: '5',
    name: 'notification-service',
    fullName: 'company/notification-service',
    description: 'Email, SMS, and push notification service',
    language: 'Node.js',
    languages: ['JavaScript', 'TypeScript'],
    stars: 45,
    contributors: 5,
    lastUpdated: '1 week ago',
    openPRs: 0,
    url: 'https://github.com/company/notification-service',
  },
];

// Pull Requests
export const pullRequests: GitHubPR[] = [
  {
    id: '1',
    number: 142,
    title: 'Add payment refund feature',
    repo: 'payment-service',
    author: teamMembers[0],
    reviewers: [teamMembers[1], teamMembers[2]],
    status: 'Open',
    createdAt: '2024-02-01T14:20:00Z',
    updatedAt: '2024-02-02T09:15:00Z',
    additions: 234,
    deletions: 45,
  },
  {
    id: '2',
    number: 89,
    title: 'Fix authentication token refresh',
    repo: 'user-auth',
    author: teamMembers[2],
    reviewers: [teamMembers[0]],
    status: 'Open',
    createdAt: '2024-02-02T10:30:00Z',
    updatedAt: '2024-02-02T11:00:00Z',
    additions: 56,
    deletions: 12,
  },
  {
    id: '3',
    number: 203,
    title: 'Update dashboard charts component',
    repo: 'web-frontend',
    author: teamMembers[1],
    reviewers: [teamMembers[2], teamMembers[4]],
    status: 'Open',
    createdAt: '2024-02-01T16:45:00Z',
    updatedAt: '2024-02-02T08:20:00Z',
    additions: 189,
    deletions: 67,
  },
  {
    id: '4',
    number: 34,
    title: 'Add rate limiting middleware',
    repo: 'api-gateway',
    author: teamMembers[5],
    reviewers: [teamMembers[3]],
    status: 'Open',
    createdAt: '2024-02-02T09:00:00Z',
    updatedAt: '2024-02-02T10:30:00Z',
    additions: 145,
    deletions: 23,
  },
];

// Jira Tickets
export const jiraTickets: JiraTicket[] = [
  {
    id: '1',
    key: 'PROJ-1234',
    title: 'Payment API refactor for v2 endpoints',
    status: 'In Progress',
    priority: 'High',
    project: 'Payment Gateway',
    type: 'Story',
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-02-02T09:00:00Z',
  },
  {
    id: '2',
    key: 'PROJ-1235',
    title: 'Fix user session timeout bug',
    status: 'In Review',
    priority: 'Critical',
    project: 'User Auth',
    type: 'Bug',
    createdAt: '2024-02-01T14:00:00Z',
    updatedAt: '2024-02-02T11:00:00Z',
  },
  {
    id: '3',
    key: 'PROJ-1236',
    title: 'Add dark mode support',
    status: 'To Do',
    priority: 'Medium',
    project: 'Web Frontend',
    type: 'Story',
    createdAt: '2024-02-02T08:00:00Z',
    updatedAt: '2024-02-02T08:00:00Z',
  },
  {
    id: '4',
    key: 'PROJ-1237',
    title: 'Database optimization for search queries',
    status: 'Blocked',
    priority: 'High',
    project: 'Backend Services',
    type: 'Task',
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-02-01T16:00:00Z',
  },
  {
    id: '5',
    key: 'PROJ-1238',
    title: 'Implement notification preferences',
    status: 'In Progress',
    priority: 'Medium',
    project: 'Notification Service',
    type: 'Story',
    createdAt: '2024-01-30T09:00:00Z',
    updatedAt: '2024-02-02T10:00:00Z',
  },
];

// Recent Activity
export const recentActivity: Activity[] = [
  {
    id: '1',
    type: 'commit',
    actor: teamMembers[0],
    action: 'pushed 3 commits to',
    target: 'payment-service',
    targetUrl: 'https://github.com/company/payment-service',
    timestamp: '5m ago',
    source: 'github',
  },
  {
    id: '2',
    type: 'pr',
    actor: teamMembers[1],
    action: 'opened pull request',
    target: '#203 Update dashboard charts',
    targetUrl: 'https://github.com/company/web-frontend/pull/203',
    timestamp: '23m ago',
    source: 'github',
  },
  {
    id: '3',
    type: 'review',
    actor: teamMembers[2],
    action: 'approved pull request',
    target: '#142 Add payment refund feature',
    targetUrl: 'https://github.com/company/payment-service/pull/142',
    timestamp: '1h ago',
    source: 'github',
  },
  {
    id: '4',
    type: 'ticket',
    actor: teamMembers[3],
    action: 'moved ticket to In Progress',
    target: 'PROJ-1234',
    targetUrl: 'https://jira.company.com/browse/PROJ-1234',
    timestamp: '2h ago',
    source: 'jira',
  },
  {
    id: '5',
    type: 'assignment',
    actor: teamMembers[4],
    action: 'was assigned to',
    target: 'PROJ-1235 Fix user session timeout bug',
    targetUrl: 'https://jira.company.com/browse/PROJ-1235',
    timestamp: '3h ago',
    source: 'jira',
  },
  {
    id: '6',
    type: 'ai',
    actor: teamMembers[0],
    action: 'AI suggested assignment for',
    target: 'PROJ-1236 based on expertise match',
    timestamp: '4h ago',
    source: 'ai',
  },
  {
    id: '7',
    type: 'commit',
    actor: teamMembers[5],
    action: 'pushed 1 commit to',
    target: 'api-gateway',
    targetUrl: 'https://github.com/company/api-gateway',
    timestamp: '5h ago',
    source: 'github',
  },
  {
    id: '8',
    type: 'pr',
    actor: teamMembers[2],
    action: 'merged pull request',
    target: '#87 Fix login redirect issue',
    targetUrl: 'https://github.com/company/user-auth/pull/87',
    timestamp: 'Yesterday',
    source: 'github',
  },
];

// Conversations
export const conversations: Conversation[] = [
  {
    id: '1',
    title: 'Payment Service Questions',
    preview: 'Can you explain how the payment refund flow works?',
    createdAt: '2024-02-02T10:30:00Z',
    updatedAt: '2024-02-02T11:45:00Z',
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'Can you explain how the payment refund flow works?',
        timestamp: '2024-02-02T10:30:00Z',
      },
      {
        id: '2',
        role: 'assistant',
        content: 'The payment refund flow in the payment-service repository works in three main steps:\n\n1. **Request Validation**: When a refund is requested, the system first validates the original transaction and checks if it\'s eligible for refund.\n\n2. **Stripe Integration**: The service communicates with Stripe\'s Refund API to process the actual refund.\n\n3. **Database Update**: After successful processing, the transaction status is updated in our database.\n\nWould you like me to show you who has worked on this feature recently?',
        timestamp: '2024-02-02T10:31:00Z',
      },
    ],
  },
  {
    id: '2',
    title: 'Team Assignment Help',
    preview: 'Who should I assign the new authentication task to?',
    createdAt: '2024-02-01T14:00:00Z',
    updatedAt: '2024-02-01T14:30:00Z',
    messages: [],
  },
  {
    id: '3',
    title: 'Sprint Progress Review',
    preview: 'What\'s the current status of our sprint?',
    createdAt: '2024-01-31T09:00:00Z',
    updatedAt: '2024-01-31T10:00:00Z',
    messages: [],
  },
];

// Dashboard Stats
export const dashboardStats = {
  activeTickets: {
    count: 24,
    trend: 12,
    completedThisSprint: 18,
    totalThisSprint: 32,
  },
  openPRs: {
    count: 11,
    trend: -5,
    reviewers: teamMembers.slice(0, 3),
  },
  teamCapacity: {
    average: 65,
    available: 3,
    trend: 8,
  },
  needsAttention: {
    pendingReviews: 4,
    unassignedTickets: 7,
    blockedTasks: 2,
  },
};

// Integration Status
export const integrations = {
  github: {
    connected: true,
    username: 'johndoe',
    repos: 5,
    lastSync: '2 minutes ago',
  },
  jira: {
    connected: true,
    site: 'company.atlassian.net',
    projects: 3,
    lastSync: '5 minutes ago',
  },
  slack: {
    connected: false,
    workspace: null,
    channels: 0,
    lastSync: null,
  },
};

// User Profile
export const currentUser = {
  id: '0',
  name: 'John Miller',
  initials: 'JM',
  role: 'Product Manager',
  email: 'john@company.com',
  timezone: 'America/New_York',
  avatarColor: '#2383E2',
};
