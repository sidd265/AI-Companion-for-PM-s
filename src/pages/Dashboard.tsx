import { useState } from 'react';
import { 
  FileText, 
  GitPullRequest, 
  Users as UsersIcon,
  MessageSquare,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  GitCommit
} from 'lucide-react';
import { 
  dashboardStats, 
  recentActivity, 
  teamMembers,
  pullRequests,
  jiraTickets,
  repositories
} from '@/data/mockData';
import { currentUser } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import TicketTrendChart from '@/components/charts/TicketTrendChart';
import SprintBurndownChart from '@/components/charts/SprintBurndownChart';
import PRActivityChart from '@/components/charts/PRActivityChart';
import CreateTicketModal from '@/components/CreateTicketModal';
import { AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const ticketsByStatus = {
    'To Do': jiraTickets.filter(t => t.status === 'To Do').length,
    'In Progress': jiraTickets.filter(t => t.status === 'In Progress').length,
    'In Review': jiraTickets.filter(t => t.status === 'In Review').length,
    'Done': jiraTickets.filter(t => t.status === 'Done').length,
    'Blocked': jiraTickets.filter(t => t.status === 'Blocked').length,
  };

  const teamWorkload = teamMembers.map(member => ({
    ...member,
    workloadPercent: Math.round(member.capacity * 100),
  })).sort((a, b) => b.workloadPercent - a.workloadPercent);

  const ticketsByPriority = {
    'Critical': jiraTickets.filter(t => t.priority === 'Critical').length,
    'High': jiraTickets.filter(t => t.priority === 'High').length,
    'Medium': jiraTickets.filter(t => t.priority === 'Medium').length,
    'Low': jiraTickets.filter(t => t.priority === 'Low').length,
  };

  const statusColors: Record<string, string> = {
    'To Do': 'bg-muted-foreground',
    'In Progress': 'bg-primary',
    'In Review': 'bg-purple-500',
    'Done': 'bg-airbnb-success',
    'Blocked': 'bg-destructive',
  };

  const priorityColors: Record<string, string> = {
    'Critical': 'bg-destructive',
    'High': 'bg-orange-500',
    'Medium': 'bg-amber-500',
    'Low': 'bg-airbnb-success',
  };

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening today
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/chat')}
            className="airbnb-btn-pill flex items-center gap-2 text-sm py-2.5 px-5"
          >
            <MessageSquare className="w-4 h-4" />
            AI Assistant
          </button>
          <button 
            onClick={() => setShowCreateTicket(true)}
            className="airbnb-btn-secondary flex items-center gap-2 text-sm py-2.5 px-5 rounded-full"
          >
            <Plus className="w-4 h-4" />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Active Tickets */}
        <div 
          className="airbnb-card p-5 cursor-pointer"
          onClick={() => navigate('/integrations')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${
              dashboardStats.activeTickets.trend > 0 ? 'text-airbnb-success' : 'text-destructive'
            }`}>
              {dashboardStats.activeTickets.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(dashboardStats.activeTickets.trend)}%
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-1">Active Tickets</div>
          <div className="text-3xl font-bold text-foreground">{dashboardStats.activeTickets.count}</div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-3">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(dashboardStats.activeTickets.completedThisSprint / dashboardStats.activeTickets.totalThisSprint) * 100}%` }} />
          </div>
          <div className="text-xs text-muted-foreground mt-2">{dashboardStats.activeTickets.completedThisSprint}/{dashboardStats.activeTickets.totalThisSprint} sprint progress</div>
        </div>

        {/* Open PRs */}
        <div 
          className="airbnb-card p-5 cursor-pointer"
          onClick={() => navigate('/integrations')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-center">
              <GitPullRequest className="w-5 h-5 text-airbnb-success" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${dashboardStats.openPRs.trend < 0 ? 'text-airbnb-success' : 'text-destructive'}`}>
              {dashboardStats.openPRs.trend < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {Math.abs(dashboardStats.openPRs.trend)}%
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-1">Open PRs</div>
          <div className="text-3xl font-bold text-foreground">{dashboardStats.openPRs.count}</div>
          <div className="flex -space-x-1.5 mt-3">
            {dashboardStats.openPRs.reviewers.slice(0, 4).map((r) => (
              <div key={r.id} className="w-6 h-6 rounded-full text-[9px] text-white border-2 border-card flex items-center justify-center font-medium" style={{ backgroundColor: r.avatarColor }}>{r.initials}</div>
            ))}
            <span className="text-xs text-muted-foreground ml-2 self-center">reviewers</span>
          </div>
        </div>

        {/* Team Capacity */}
        <div 
          className="airbnb-card p-5 cursor-pointer"
          onClick={() => navigate('/team')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-purple-500" />
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-airbnb-success">
              <TrendingUp className="w-3 h-3" />
              {dashboardStats.teamCapacity.trend}%
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-1">Team Capacity</div>
          <div className="text-3xl font-bold text-foreground">{dashboardStats.teamCapacity.average}%</div>
          <div className="text-xs text-muted-foreground mt-3">{dashboardStats.teamCapacity.available} members available</div>
        </div>

        {/* Commits Today */}
        <div 
          className="airbnb-card p-5 cursor-pointer"
          onClick={() => navigate('/integrations')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <GitCommit className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-airbnb-success">
              <TrendingUp className="w-3 h-3" />18%
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-1">Commits Today</div>
          <div className="text-3xl font-bold text-foreground">47</div>
          <div className="text-xs text-muted-foreground mt-3">Across {repositories.length} repositories</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div 
          className="airbnb-card p-5 cursor-pointer"
          onClick={() => navigate('/integrations')}
        >
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Ticket Trends</div>
          <div className="h-[180px]">
            <TicketTrendChart compact />
          </div>
        </div>
        <div 
          className="airbnb-card p-5 cursor-pointer"
          onClick={() => navigate('/integrations')}
        >
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Sprint Burndown</div>
          <div className="h-[180px]">
            <SprintBurndownChart compact />
          </div>
        </div>
        <div 
          className="airbnb-card p-5 cursor-pointer"
          onClick={() => navigate('/integrations')}
        >
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">PR Activity</div>
          <div className="h-[180px]">
            <PRActivityChart compact />
          </div>
        </div>
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Recent Activity */}
        <div className="airbnb-card-static overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</span>
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={activity.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 transition-colors ${index < 4 ? 'border-b border-border' : ''}`}>
                <div className="w-7 h-7 rounded-full text-[9px] text-white flex-shrink-0 flex items-center justify-center font-medium" style={{ backgroundColor: activity.actor.avatarColor }}>{activity.actor.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">
                    <span className="font-medium">{activity.actor.name.split(' ')[0]}</span>
                    {' '}<span className="text-muted-foreground">{activity.action}</span>
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Open PRs List */}
        <div className="airbnb-card-static overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Pull Requests</span>
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            {pullRequests.slice(0, 4).map((pr, index) => (
              <div key={pr.id} className={`px-5 py-3 hover:bg-secondary/50 transition-colors ${index < 3 ? 'border-b border-border' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <GitPullRequest className="w-3 h-3 text-airbnb-success flex-shrink-0" />
                  <span className="text-xs font-medium text-foreground truncate">{pr.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">#{pr.number} · {pr.repo}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-airbnb-success">+{pr.additions}</span>
                    <span className="text-[10px] text-destructive">-{pr.deletions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Status */}
        <div className="airbnb-card-static p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Ticket Status</div>
          <div className="space-y-2">
            {Object.entries(ticketsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                <span className="text-xs text-foreground flex-1">{status}</span>
                <span className="text-xs font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            Total: {jiraTickets.length} tickets
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="airbnb-card-static p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Priority</div>
          <div className="space-y-2">
            {Object.entries(ticketsByPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${priorityColors[priority]}`} />
                <span className="text-xs text-foreground flex-1">{priority}</span>
                <span className="text-xs font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
            <AlertCircle className="w-3 h-3 text-destructive" />
            <span className="text-xs text-muted-foreground">{ticketsByPriority.Critical + ticketsByPriority.High} high priority</span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Team Workload */}
        <div className="airbnb-card-static p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Team Workload</div>
          <div className="grid grid-cols-6 gap-4">
            {teamWorkload.map((member) => (
              <div key={member.id} className="text-center">
                <div className="w-10 h-10 rounded-full text-xs text-white mx-auto mb-2 flex items-center justify-center font-medium" style={{ backgroundColor: member.avatarColor }}>{member.initials}</div>
                <div className="text-xs font-medium text-foreground truncate">{member.name.split(' ')[0]}</div>
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden my-1.5">
                  <div className={`h-full rounded-full ${member.workloadPercent > 80 ? 'bg-destructive' : member.workloadPercent > 60 ? 'bg-orange-500' : 'bg-airbnb-success'}`} style={{ width: `${member.workloadPercent}%` }} />
                </div>
                <div className="text-[10px] text-muted-foreground">{member.workloadPercent}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Repositories */}
        <div className="airbnb-card-static p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Repositories</div>
          <div className="grid grid-cols-3 gap-3">
            {repositories.slice(0, 6).map((repo) => (
              <div key={repo.id} className="flex items-center gap-2 p-3 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{repo.name}</div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{repo.language}</span>
                    <span className="flex items-center gap-1">
                      <GitPullRequest className="w-2 h-2" />{repo.openPRs}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        <CreateTicketModal open={showCreateTicket} onClose={() => setShowCreateTicket(false)} />
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
