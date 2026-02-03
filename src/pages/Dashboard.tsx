import { 
  FileText, 
  GitPullRequest, 
  Users as UsersIcon,
  MessageSquare,
  Plus,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  GitCommit,
  Eye,
  Calendar,
  Target,
  Zap
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

  // Calculate ticket stats by status
  const ticketsByStatus = {
    'To Do': jiraTickets.filter(t => t.status === 'To Do').length,
    'In Progress': jiraTickets.filter(t => t.status === 'In Progress').length,
    'In Review': jiraTickets.filter(t => t.status === 'In Review').length,
    'Done': jiraTickets.filter(t => t.status === 'Done').length,
    'Blocked': jiraTickets.filter(t => t.status === 'Blocked').length,
  };

  // Calculate team workload
  const teamWorkload = teamMembers.map(member => ({
    ...member,
    workloadPercent: Math.round(member.capacity * 100),
  })).sort((a, b) => b.workloadPercent - a.workloadPercent);

  // Priority breakdown
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
    <div className="px-notion-massive py-notion-xxl">
      {/* Page Header */}
      <div className="mb-[32px]">
        <h1 className="notion-title mb-[4px]">
          {getGreeting()}, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="text-[16px] text-notion-text-secondary">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Cards - 4 Column */}
      <div className="mb-notion-xxl">
        <h2 className="notion-section-header mb-[12px]">Overview</h2>
        <div className="grid grid-cols-4 gap-[12px]">
          {/* Active Tickets Card */}
          <div className="notion-card p-[16px]">
            <div className="flex items-start justify-between mb-[8px]">
              <FileText className="w-[20px] h-[20px] text-notion-text opacity-50" />
              <div className={`flex items-center gap-1 text-[12px] ${
                dashboardStats.activeTickets.trend > 0 ? 'text-notion-green' : 'text-notion-red'
              }`}>
                {dashboardStats.activeTickets.trend > 0 ? (
                  <TrendingUp className="w-[12px] h-[12px]" />
                ) : (
                  <TrendingDown className="w-[12px] h-[12px]" />
                )}
                {Math.abs(dashboardStats.activeTickets.trend)}%
              </div>
            </div>
            <div className="text-[13px] text-notion-text-secondary mb-[4px]">
              Active Tickets
            </div>
            <div className="text-[28px] font-bold text-notion-text mb-[8px]">
              {dashboardStats.activeTickets.count}
            </div>
            <div className="mb-[4px]">
              <div className="flex justify-between text-[11px] text-notion-text-secondary mb-[4px]">
                <span>Sprint Progress</span>
                <span>{dashboardStats.activeTickets.completedThisSprint}/{dashboardStats.activeTickets.totalThisSprint}</span>
              </div>
              <div className="h-[4px] bg-notion-border rounded-[2px] overflow-hidden">
                <div 
                  className="h-full bg-notion-blue rounded-[2px] transition-all duration-300"
                  style={{ 
                    width: `${(dashboardStats.activeTickets.completedThisSprint / dashboardStats.activeTickets.totalThisSprint) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Open PRs Card */}
          <div className="notion-card p-[16px]">
            <div className="flex items-start justify-between mb-[8px]">
              <GitPullRequest className="w-[20px] h-[20px] text-notion-text opacity-50" />
              <div className={`flex items-center gap-1 text-[12px] ${
                dashboardStats.openPRs.trend < 0 ? 'text-notion-green' : 'text-notion-red'
              }`}>
                {dashboardStats.openPRs.trend < 0 ? (
                  <TrendingDown className="w-[12px] h-[12px]" />
                ) : (
                  <TrendingUp className="w-[12px] h-[12px]" />
                )}
                {Math.abs(dashboardStats.openPRs.trend)}%
              </div>
            </div>
            <div className="text-[13px] text-notion-text-secondary mb-[4px]">
              Open PRs
            </div>
            <div className="text-[28px] font-bold text-notion-text mb-[8px]">
              {dashboardStats.openPRs.count}
            </div>
            <div className="flex items-center gap-[4px]">
              <div className="flex -space-x-2">
                {dashboardStats.openPRs.reviewers.slice(0, 4).map((reviewer) => (
                  <div 
                    key={reviewer.id}
                    className="notion-avatar w-[20px] h-[20px] text-[8px] text-white border-2 border-white"
                    style={{ backgroundColor: reviewer.avatarColor }}
                    title={reviewer.name}
                  >
                    {reviewer.initials}
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-notion-text-secondary">reviewers</span>
            </div>
          </div>

          {/* Team Capacity Card */}
          <div className="notion-card p-[16px]">
            <div className="flex items-start justify-between mb-[8px]">
              <UsersIcon className="w-[20px] h-[20px] text-notion-text opacity-50" />
              <div className="flex items-center gap-1 text-[12px] text-notion-green">
                <TrendingUp className="w-[12px] h-[12px]" />
                {dashboardStats.teamCapacity.trend}%
              </div>
            </div>
            <div className="text-[13px] text-notion-text-secondary mb-[4px]">
              Team Capacity
            </div>
            <div className="text-[28px] font-bold text-notion-text mb-[8px]">
              {dashboardStats.teamCapacity.average}%
            </div>
            <div className="text-[11px] text-notion-text-secondary">
              {dashboardStats.teamCapacity.available} available
            </div>
          </div>

          {/* Code Activity Card */}
          <div className="notion-card p-[16px]">
            <div className="flex items-start justify-between mb-[8px]">
              <GitCommit className="w-[20px] h-[20px] text-notion-text opacity-50" />
              <div className="flex items-center gap-1 text-[12px] text-notion-green">
                <TrendingUp className="w-[12px] h-[12px]" />
                18%
              </div>
            </div>
            <div className="text-[13px] text-notion-text-secondary mb-[4px]">
              Commits Today
            </div>
            <div className="text-[28px] font-bold text-notion-text mb-[8px]">
              47
            </div>
            <div className="text-[11px] text-notion-text-secondary">
              Across {repositories.length} repos
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-notion-xxl">
        <h2 className="notion-section-header mb-[12px]">Quick Actions</h2>
        <div className="flex gap-[8px]">
          <button 
            onClick={() => navigate('/chat')}
            className="notion-btn-primary flex items-center gap-2"
          >
            <MessageSquare className="w-[14px] h-[14px]" />
            Ask AI Assistant
          </button>
          <button className="notion-btn-secondary flex items-center gap-2">
            <Plus className="w-[14px] h-[14px]" />
            Create Ticket
          </button>
          <button 
            onClick={() => navigate('/team')}
            className="notion-btn-secondary flex items-center gap-2"
          >
            <UsersIcon className="w-[14px] h-[14px]" />
            View Team
          </button>
          <button 
            onClick={() => navigate('/integrations')}
            className="notion-btn-secondary flex items-center gap-2"
          >
            <Zap className="w-[14px] h-[14px]" />
            Integrations
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-[24px] mb-[24px]">
        {/* Ticket Trend Chart */}
        <div>
          <h2 className="notion-section-header mb-[12px]">Ticket Trends</h2>
          <div className="notion-card p-[16px]">
            <TicketTrendChart />
          </div>
        </div>

        {/* Sprint Burndown Chart */}
        <div>
          <h2 className="notion-section-header mb-[12px]">Sprint Burndown</h2>
          <div className="notion-card p-[16px]">
            <SprintBurndownChart />
          </div>
        </div>
      </div>

      {/* PR Activity Chart - Full Width */}
      <div className="mb-notion-xxl">
        <h2 className="notion-section-header mb-[12px]">PR Activity</h2>
        <div className="notion-card p-[16px]">
          <PRActivityChart />
        </div>
      </div>

      {/* Ticket Status & Priority Breakdown */}
      <div className="grid grid-cols-2 gap-[24px] mb-notion-xxl">
        {/* Ticket Status Breakdown */}
        <div>
          <h2 className="notion-section-header mb-[12px]">Ticket Status</h2>
          <div className="notion-card p-[16px]">
            <div className="space-y-[12px]">
              {Object.entries(ticketsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-[12px]">
                  <div className={`w-[8px] h-[8px] rounded-full ${statusColors[status]}`} />
                  <span className="text-[14px] text-notion-text flex-1">{status}</span>
                  <span className="text-[14px] font-medium text-notion-text">{count}</span>
                  <div className="w-[100px] h-[6px] bg-notion-border rounded-[3px] overflow-hidden">
                    <div 
                      className={`h-full ${statusColors[status]} rounded-[3px]`}
                      style={{ width: `${(count / jiraTickets.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-[16px] pt-[12px] border-t border-notion-border flex justify-between">
              <span className="text-[13px] text-notion-text-secondary">Total Tickets</span>
              <span className="text-[13px] font-medium text-notion-text">{jiraTickets.length}</span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div>
          <h2 className="notion-section-header mb-[12px]">Priority Breakdown</h2>
          <div className="notion-card p-[16px]">
            <div className="space-y-[12px]">
              {Object.entries(ticketsByPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center gap-[12px]">
                  <div className={`w-[8px] h-[8px] rounded-full ${priorityColors[priority]}`} />
                  <span className="text-[14px] text-notion-text flex-1">{priority}</span>
                  <span className="text-[14px] font-medium text-notion-text">{count}</span>
                  <div className="w-[100px] h-[6px] bg-notion-border rounded-[3px] overflow-hidden">
                    <div 
                      className={`h-full ${priorityColors[priority]} rounded-[3px]`}
                      style={{ width: `${(count / jiraTickets.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-[16px] pt-[12px] border-t border-notion-border flex items-center gap-[8px]">
              <AlertCircle className="w-[14px] h-[14px] text-notion-red" />
              <span className="text-[13px] text-notion-text-secondary">
                {ticketsByPriority.Critical + ticketsByPriority.High} high priority items need attention
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Workload */}
      <div className="mb-notion-xxl">
        <h2 className="notion-section-header mb-[12px]">Team Workload</h2>
        <div className="notion-card p-[16px]">
          <div className="grid grid-cols-6 gap-[16px]">
            {teamWorkload.map((member) => (
              <div key={member.id} className="text-center">
                <div 
                  className="notion-avatar w-[40px] h-[40px] text-[14px] text-white mx-auto mb-[8px]"
                  style={{ backgroundColor: member.avatarColor }}
                >
                  {member.initials}
                </div>
                <div className="text-[13px] font-medium text-notion-text truncate mb-[4px]">
                  {member.name.split(' ')[0]}
                </div>
                <div className="w-full h-[4px] bg-notion-border rounded-[2px] overflow-hidden mb-[4px]">
                  <div 
                    className={`h-full rounded-[2px] ${
                      member.workloadPercent > 80 ? 'bg-notion-red' : 
                      member.workloadPercent > 60 ? 'bg-notion-orange' : 'bg-notion-green'
                    }`}
                    style={{ width: `${member.workloadPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-notion-text-secondary">
                  {member.workloadPercent}% utilized
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-3 gap-[24px]">
        {/* Recent Activity */}
        <div>
          <h2 className="notion-section-header mb-[12px]">Recent Activity</h2>
          <div className="notion-card overflow-hidden">
            {recentActivity.slice(0, 6).map((activity, index) => (
              <div 
                key={activity.id}
                className={`flex items-start gap-[12px] p-[12px] px-[16px] transition-colors duration-150 hover:bg-[#FAFAF9] ${
                  index < 5 ? 'border-b border-notion-border' : ''
                }`}
              >
                <div 
                  className="notion-avatar w-[28px] h-[28px] text-[10px] text-white flex-shrink-0"
                  style={{ backgroundColor: activity.actor.avatarColor }}
                >
                  {activity.actor.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-notion-text truncate">
                    <span className="font-medium">{activity.actor.name.split(' ')[0]}</span>
                    {' '}
                    <span className="text-notion-text-secondary">{activity.action}</span>
                  </p>
                  {activity.target && (
                    <p className="text-[12px] text-notion-blue truncate">
                      {activity.target}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-notion-text-tertiary whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Open Pull Requests */}
        <div>
          <h2 className="notion-section-header mb-[12px]">Open Pull Requests</h2>
          <div className="notion-card overflow-hidden">
            {pullRequests.slice(0, 4).map((pr, index) => (
              <div 
                key={pr.id}
                className={`p-[12px] px-[16px] transition-colors duration-150 hover:bg-[#FAFAF9] ${
                  index < 3 ? 'border-b border-notion-border' : ''
                }`}
              >
                <div className="flex items-center gap-[8px] mb-[4px]">
                  <GitPullRequest className="w-[14px] h-[14px] text-notion-green flex-shrink-0" />
                  <span className="text-[13px] font-medium text-notion-text truncate">
                    {pr.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-notion-text-secondary">
                    #{pr.number} · {pr.repo}
                  </p>
                  <div className="flex items-center gap-[8px]">
                    <span className="text-[11px] text-notion-green">+{pr.additions}</span>
                    <span className="text-[11px] text-notion-red">-{pr.deletions}</span>
                    <div className="flex -space-x-1">
                      {pr.reviewers.slice(0, 2).map((reviewer) => (
                        <div 
                          key={reviewer.id}
                          className="notion-avatar w-[18px] h-[18px] text-[8px] text-white border border-white"
                          style={{ backgroundColor: reviewer.avatarColor }}
                        >
                          {reviewer.initials}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention */}
        <div>
          <h2 className="notion-section-header mb-[12px]">Needs Attention</h2>
          <div className="space-y-[8px]">
            <div className="notion-card p-[12px] flex items-center gap-[12px]">
              <div className="w-[32px] h-[32px] rounded-[6px] bg-notion-orange/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-[16px] h-[16px] text-notion-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-notion-text">
                  Reviews Pending
                </div>
                <div className="text-[12px] text-notion-text-secondary">
                  {dashboardStats.needsAttention.pendingReviews} waiting
                </div>
              </div>
              <ArrowUpRight className="w-[14px] h-[14px] text-notion-text-secondary flex-shrink-0" />
            </div>

            <div className="notion-card p-[12px] flex items-center gap-[12px]">
              <div className="w-[32px] h-[32px] rounded-[6px] bg-notion-yellow/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-[16px] h-[16px] text-notion-yellow" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-notion-text">
                  Unassigned
                </div>
                <div className="text-[12px] text-notion-text-secondary">
                  {dashboardStats.needsAttention.unassignedTickets} tickets
                </div>
              </div>
              <ArrowUpRight className="w-[14px] h-[14px] text-notion-text-secondary flex-shrink-0" />
            </div>

            <div className="notion-card p-[12px] flex items-center gap-[12px]">
              <div className="w-[32px] h-[32px] rounded-[6px] bg-notion-red/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-[16px] h-[16px] text-notion-red" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-notion-text">
                  Blocked Tasks
                </div>
                <div className="text-[12px] text-notion-text-secondary">
                  {dashboardStats.needsAttention.blockedTasks} blocked
                </div>
              </div>
              <ArrowUpRight className="w-[14px] h-[14px] text-notion-text-secondary flex-shrink-0" />
            </div>

            <div className="notion-card p-[12px] flex items-center gap-[12px]">
              <div className="w-[32px] h-[32px] rounded-[6px] bg-notion-purple/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-[16px] h-[16px] text-notion-purple" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-notion-text">
                  Due This Week
                </div>
                <div className="text-[12px] text-notion-text-secondary">
                  8 deadlines approaching
                </div>
              </div>
              <ArrowUpRight className="w-[14px] h-[14px] text-notion-text-secondary flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Repository Activity */}
      <div className="mt-notion-xxl">
        <h2 className="notion-section-header mb-[12px]">Repository Activity</h2>
        <div className="grid grid-cols-5 gap-[12px]">
          {repositories.map((repo) => (
            <div key={repo.id} className="notion-card p-[14px]">
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className="w-[8px] h-[8px] rounded-full bg-notion-blue" />
                <span className="text-[13px] font-medium text-notion-text truncate">
                  {repo.name}
                </span>
              </div>
              <p className="text-[12px] text-notion-text-secondary mb-[12px] line-clamp-2">
                {repo.description}
              </p>
              <div className="flex items-center justify-between text-[11px] text-notion-text-secondary">
                <span>{repo.language}</span>
                <div className="flex items-center gap-[8px]">
                  <span className="flex items-center gap-[2px]">
                    <GitPullRequest className="w-[10px] h-[10px]" />
                    {repo.openPRs}
                  </span>
                  <span>{repo.lastUpdated}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;