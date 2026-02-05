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

const Dashboard = () => {
  const navigate = useNavigate();
  
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
    'To Do': 'bg-notion-text-secondary',
    'In Progress': 'bg-notion-blue',
    'In Review': 'bg-notion-purple',
    'Done': 'bg-notion-green',
    'Blocked': 'bg-notion-red',
  };

  const priorityColors: Record<string, string> = {
    'Critical': 'bg-notion-red',
    'High': 'bg-notion-orange',
    'Medium': 'bg-notion-yellow',
    'Low': 'bg-notion-green',
  };

  return (
    <div className="px-[24px] py-[16px]">
      {/* Compact Header with Quick Actions */}
      <div className="flex items-center justify-between mb-[16px]">
        <div>
          <h1 className="text-[24px] font-bold text-notion-text">
            {getGreeting()}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-[13px] text-notion-text-secondary">
            Here's what's happening today
          </p>
        </div>
        <div className="flex gap-[8px]">
          <button 
            onClick={() => navigate('/chat')}
            className="notion-btn-primary flex items-center gap-2 text-[13px] py-[5px]"
          >
            <MessageSquare className="w-[14px] h-[14px]" />
            AI Assistant
          </button>
          <button className="notion-btn-secondary flex items-center gap-2 text-[13px] py-[5px]">
            <Plus className="w-[14px] h-[14px]" />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Row 1: Key Metrics (simplified - alerts moved to sidebar) */}
      <div className="grid grid-cols-4 gap-[12px] mb-[16px]">
        {/* Active Tickets */}
        <div 
          className="notion-card p-[14px] cursor-pointer transition-all hover:shadow-md hover:border-notion-blue/30"
          onClick={() => navigate('/integrations')}
        >
          <div className="flex items-center justify-between mb-[6px]">
            <FileText className="w-[18px] h-[18px] text-notion-text opacity-50" />
            <div className={`flex items-center gap-1 text-[12px] ${
              dashboardStats.activeTickets.trend > 0 ? 'text-notion-green' : 'text-notion-red'
            }`}>
              {dashboardStats.activeTickets.trend > 0 ? <TrendingUp className="w-[12px] h-[12px]" /> : <TrendingDown className="w-[12px] h-[12px]" />}
              {Math.abs(dashboardStats.activeTickets.trend)}%
            </div>
          </div>
          <div className="text-[12px] text-notion-text-secondary">Active Tickets</div>
          <div className="text-[28px] font-bold text-notion-text">{dashboardStats.activeTickets.count}</div>
          <div className="h-[4px] bg-notion-border rounded-full overflow-hidden mt-[6px]">
            <div className="h-full bg-notion-blue rounded-full" style={{ width: `${(dashboardStats.activeTickets.completedThisSprint / dashboardStats.activeTickets.totalThisSprint) * 100}%` }} />
          </div>
          <div className="text-[11px] text-notion-text-tertiary mt-[4px]">{dashboardStats.activeTickets.completedThisSprint}/{dashboardStats.activeTickets.totalThisSprint} sprint progress</div>
        </div>

        {/* Open PRs */}
        <div 
          className="notion-card p-[14px] cursor-pointer transition-all hover:shadow-md hover:border-notion-blue/30"
          onClick={() => navigate('/integrations')}
        >
          <div className="flex items-center justify-between mb-[6px]">
            <GitPullRequest className="w-[18px] h-[18px] text-notion-text opacity-50" />
            <div className={`flex items-center gap-1 text-[12px] ${dashboardStats.openPRs.trend < 0 ? 'text-notion-green' : 'text-notion-red'}`}>
              {dashboardStats.openPRs.trend < 0 ? <TrendingDown className="w-[12px] h-[12px]" /> : <TrendingUp className="w-[12px] h-[12px]" />}
              {Math.abs(dashboardStats.openPRs.trend)}%
            </div>
          </div>
          <div className="text-[12px] text-notion-text-secondary">Open PRs</div>
          <div className="text-[28px] font-bold text-notion-text">{dashboardStats.openPRs.count}</div>
          <div className="flex -space-x-1 mt-[6px]">
            {dashboardStats.openPRs.reviewers.slice(0, 4).map((r) => (
              <div key={r.id} className="notion-avatar w-[20px] h-[20px] text-[8px] text-white border-2 border-white" style={{ backgroundColor: r.avatarColor }}>{r.initials}</div>
            ))}
            <span className="text-[11px] text-notion-text-tertiary ml-[6px] self-center">reviewers</span>
          </div>
        </div>

        {/* Team Capacity */}
        <div 
          className="notion-card p-[14px] cursor-pointer transition-all hover:shadow-md hover:border-notion-blue/30"
          onClick={() => navigate('/team')}
        >
          <div className="flex items-center justify-between mb-[6px]">
            <UsersIcon className="w-[18px] h-[18px] text-notion-text opacity-50" />
            <div className="flex items-center gap-1 text-[12px] text-notion-green">
              <TrendingUp className="w-[12px] h-[12px]" />
              {dashboardStats.teamCapacity.trend}%
            </div>
          </div>
          <div className="text-[12px] text-notion-text-secondary">Team Capacity</div>
          <div className="text-[28px] font-bold text-notion-text">{dashboardStats.teamCapacity.average}%</div>
          <div className="text-[11px] text-notion-text-tertiary mt-[6px]">{dashboardStats.teamCapacity.available} members available</div>
        </div>

        {/* Commits Today */}
        <div 
          className="notion-card p-[14px] cursor-pointer transition-all hover:shadow-md hover:border-notion-blue/30"
          onClick={() => navigate('/integrations')}
        >
          <div className="flex items-center justify-between mb-[6px]">
            <GitCommit className="w-[18px] h-[18px] text-notion-text opacity-50" />
            <div className="flex items-center gap-1 text-[12px] text-notion-green">
              <TrendingUp className="w-[12px] h-[12px]" />18%
            </div>
          </div>
          <div className="text-[12px] text-notion-text-secondary">Commits Today</div>
          <div className="text-[28px] font-bold text-notion-text">47</div>
          <div className="text-[11px] text-notion-text-tertiary mt-[6px]">Across {repositories.length} repositories</div>
        </div>
      </div>

      {/* Row 2: Charts (3 columns) */}
      <div className="grid grid-cols-3 gap-[12px] mb-[16px]">
        <div className="notion-card p-[12px]">
          <div className="text-[11px] text-notion-text-secondary uppercase tracking-wide mb-[8px]">Ticket Trends</div>
          <div className="h-[180px]">
            <TicketTrendChart compact />
          </div>
        </div>
        <div className="notion-card p-[12px]">
          <div className="text-[11px] text-notion-text-secondary uppercase tracking-wide mb-[8px]">Sprint Burndown</div>
          <div className="h-[180px]">
            <SprintBurndownChart compact />
          </div>
        </div>
        <div className="notion-card p-[12px]">
          <div className="text-[11px] text-notion-text-secondary uppercase tracking-wide mb-[8px]">PR Activity</div>
          <div className="h-[180px]">
            <PRActivityChart compact />
          </div>
        </div>
      </div>

      {/* Row 3: Activity, PRs, Status/Priority (4 columns) */}
      <div className="grid grid-cols-4 gap-[12px] mb-[16px]">
        {/* Recent Activity */}
        <div className="notion-card overflow-hidden">
          <div className="px-[12px] py-[8px] border-b border-notion-border">
            <span className="text-[11px] text-notion-text-secondary uppercase tracking-wide">Recent Activity</span>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={activity.id} className={`flex items-center gap-[8px] px-[12px] py-[8px] hover:bg-[#FAFAF9] ${index < 4 ? 'border-b border-notion-border' : ''}`}>
                <div className="notion-avatar w-[20px] h-[20px] text-[8px] text-white flex-shrink-0" style={{ backgroundColor: activity.actor.avatarColor }}>{activity.actor.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-notion-text truncate">
                    <span className="font-medium">{activity.actor.name.split(' ')[0]}</span>
                    {' '}<span className="text-notion-text-secondary">{activity.action}</span>
                  </p>
                </div>
                <span className="text-[10px] text-notion-text-tertiary">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Open PRs List */}
        <div className="notion-card overflow-hidden">
          <div className="px-[12px] py-[8px] border-b border-notion-border">
            <span className="text-[11px] text-notion-text-secondary uppercase tracking-wide">Open Pull Requests</span>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {pullRequests.slice(0, 4).map((pr, index) => (
              <div key={pr.id} className={`px-[12px] py-[8px] hover:bg-[#FAFAF9] ${index < 3 ? 'border-b border-notion-border' : ''}`}>
                <div className="flex items-center gap-[6px] mb-[2px]">
                  <GitPullRequest className="w-[12px] h-[12px] text-notion-green flex-shrink-0" />
                  <span className="text-[11px] font-medium text-notion-text truncate">{pr.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-notion-text-secondary">#{pr.number} · {pr.repo}</span>
                  <div className="flex items-center gap-[4px]">
                    <span className="text-[10px] text-notion-green">+{pr.additions}</span>
                    <span className="text-[10px] text-notion-red">-{pr.deletions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Status */}
        <div className="notion-card p-[12px]">
          <div className="text-[11px] text-notion-text-secondary uppercase tracking-wide mb-[8px]">Ticket Status</div>
          <div className="space-y-[6px]">
            {Object.entries(ticketsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-[8px]">
                <div className={`w-[6px] h-[6px] rounded-full ${statusColors[status]}`} />
                <span className="text-[11px] text-notion-text flex-1">{status}</span>
                <span className="text-[11px] font-medium text-notion-text">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-[8px] pt-[8px] border-t border-notion-border text-[10px] text-notion-text-tertiary">
            Total: {jiraTickets.length} tickets
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="notion-card p-[12px]">
          <div className="text-[11px] text-notion-text-secondary uppercase tracking-wide mb-[8px]">Priority</div>
          <div className="space-y-[6px]">
            {Object.entries(ticketsByPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center gap-[8px]">
                <div className={`w-[6px] h-[6px] rounded-full ${priorityColors[priority]}`} />
                <span className="text-[11px] text-notion-text flex-1">{priority}</span>
                <span className="text-[11px] font-medium text-notion-text">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-[8px] pt-[8px] border-t border-notion-border flex items-center gap-[4px]">
            <AlertCircle className="w-[10px] h-[10px] text-notion-red" />
            <span className="text-[10px] text-notion-text-tertiary">{ticketsByPriority.Critical + ticketsByPriority.High} high priority</span>
          </div>
        </div>
      </div>

      {/* Row 4: Team Workload + Repositories */}
      <div className="grid grid-cols-2 gap-[12px]">
        {/* Team Workload */}
        <div className="notion-card p-[12px]">
          <div className="text-[11px] text-notion-text-secondary uppercase tracking-wide mb-[8px]">Team Workload</div>
          <div className="grid grid-cols-6 gap-[8px]">
            {teamWorkload.map((member) => (
              <div key={member.id} className="text-center">
                <div className="notion-avatar w-[28px] h-[28px] text-[10px] text-white mx-auto mb-[4px]" style={{ backgroundColor: member.avatarColor }}>{member.initials}</div>
                <div className="text-[10px] font-medium text-notion-text truncate">{member.name.split(' ')[0]}</div>
                <div className="w-full h-[3px] bg-notion-border rounded-full overflow-hidden my-[2px]">
                  <div className={`h-full rounded-full ${member.workloadPercent > 80 ? 'bg-notion-red' : member.workloadPercent > 60 ? 'bg-notion-orange' : 'bg-notion-green'}`} style={{ width: `${member.workloadPercent}%` }} />
                </div>
                <div className="text-[9px] text-notion-text-tertiary">{member.workloadPercent}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Repositories - Compact */}
        <div className="notion-card p-[12px]">
          <div className="text-[11px] text-notion-text-secondary uppercase tracking-wide mb-[8px]">Repositories</div>
          <div className="grid grid-cols-3 gap-[8px]">
            {repositories.slice(0, 6).map((repo) => (
              <div key={repo.id} className="flex items-center gap-[6px] p-[6px] rounded-[4px] hover:bg-[#FAFAF9] cursor-pointer">
                <div className="w-[6px] h-[6px] rounded-full bg-notion-blue flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-notion-text truncate">{repo.name}</div>
                  <div className="flex items-center gap-[6px] text-[9px] text-notion-text-tertiary">
                    <span>{repo.language}</span>
                    <span className="flex items-center gap-[2px]">
                      <GitPullRequest className="w-[8px] h-[8px]" />{repo.openPRs}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
