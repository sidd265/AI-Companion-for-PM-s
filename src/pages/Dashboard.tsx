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
  Clock
} from 'lucide-react';
import { 
  dashboardStats, 
  recentActivity, 
  teamMembers,
  pullRequests 
} from '@/data/mockData';
import { currentUser } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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

      {/* Stats Cards */}
      <div className="mb-notion-xxl">
        <h2 className="notion-section-header mb-[12px]">Overview</h2>
        <div className="grid grid-cols-3 gap-[12px]">
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
            <div className="text-[13px] text-notion-text-secondary mb-[8px]">
              Active Jira Tickets
            </div>
            <div className="text-[32px] font-bold text-notion-text mb-[12px]">
              {dashboardStats.activeTickets.count}
            </div>
            <div className="mb-[8px]">
              <div className="flex justify-between text-[12px] text-notion-text-secondary mb-[4px]">
                <span>Sprint Progress</span>
                <span>{dashboardStats.activeTickets.completedThisSprint}/{dashboardStats.activeTickets.totalThisSprint}</span>
              </div>
              <div className="h-[6px] bg-notion-border rounded-[3px] overflow-hidden">
                <div 
                  className="h-full bg-notion-blue rounded-[3px] transition-all duration-300"
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
            <div className="text-[13px] text-notion-text-secondary mb-[8px]">
              Open Pull Requests
            </div>
            <div className="text-[32px] font-bold text-notion-text mb-[12px]">
              {dashboardStats.openPRs.count}
            </div>
            <div className="flex items-center gap-[4px]">
              <span className="text-[12px] text-notion-text-secondary">Reviewers:</span>
              <div className="flex -space-x-2">
                {dashboardStats.openPRs.reviewers.map((reviewer) => (
                  <div 
                    key={reviewer.id}
                    className="notion-avatar w-[24px] h-[24px] text-[10px] text-white border-2 border-white"
                    style={{ backgroundColor: reviewer.avatarColor }}
                    title={reviewer.name}
                  >
                    {reviewer.initials}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Capacity Card */}
          <div className="notion-card p-[16px]">
            <div className="flex items-start justify-between mb-[8px]">
              <UsersIcon className="w-[20px] h-[20px] text-notion-text opacity-50" />
              <div className={`flex items-center gap-1 text-[12px] ${
                dashboardStats.teamCapacity.trend > 0 ? 'text-notion-green' : 'text-notion-red'
              }`}>
                <TrendingUp className="w-[12px] h-[12px]" />
                {dashboardStats.teamCapacity.trend}%
              </div>
            </div>
            <div className="text-[13px] text-notion-text-secondary mb-[8px]">
              Team Capacity
            </div>
            <div className="text-[32px] font-bold text-notion-text mb-[12px]">
              {dashboardStats.teamCapacity.average}%
            </div>
            <div className="text-[13px] text-notion-text-secondary">
              {dashboardStats.teamCapacity.available} members available
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
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-[24px]">
        {/* Recent Activity */}
        <div>
          <h2 className="notion-section-header mb-[12px]">Recent Activity</h2>
          <div className="notion-card overflow-hidden">
            {recentActivity.slice(0, 8).map((activity, index) => (
              <div 
                key={activity.id}
                className={`flex items-start gap-[12px] p-[12px] px-[16px] transition-colors duration-150 hover:bg-[#FAFAF9] ${
                  index < recentActivity.length - 1 ? 'border-b border-notion-border' : ''
                }`}
              >
                <div 
                  className="notion-avatar w-[32px] h-[32px] text-[12px] text-white flex-shrink-0"
                  style={{ backgroundColor: activity.actor.avatarColor }}
                >
                  {activity.actor.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-notion-text">
                    <span className="font-medium">{activity.actor.name}</span>
                    {' '}
                    <span className="text-notion-text-secondary">{activity.action}</span>
                    {' '}
                    {activity.target && (
                      <a 
                        href={activity.targetUrl || '#'} 
                        className="text-notion-blue hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {activity.target}
                      </a>
                    )}
                  </p>
                </div>
                <span className="text-[13px] text-notion-text-tertiary whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention */}
        <div>
          <h2 className="notion-section-header mb-[12px]">Needs Attention</h2>
          <div className="space-y-[12px]">
            <div className="notion-card p-[16px] flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <div className="w-[36px] h-[36px] rounded-[6px] bg-notion-orange/10 flex items-center justify-center">
                  <Clock className="w-[18px] h-[18px] text-notion-orange" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-notion-text">
                    Code Reviews Pending
                  </div>
                  <div className="text-[13px] text-notion-text-secondary">
                    {dashboardStats.needsAttention.pendingReviews} reviews waiting
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-[16px] h-[16px] text-notion-text-secondary" />
            </div>

            <div className="notion-card p-[16px] flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <div className="w-[36px] h-[36px] rounded-[6px] bg-notion-yellow/10 flex items-center justify-center">
                  <AlertCircle className="w-[18px] h-[18px] text-notion-yellow" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-notion-text">
                    Unassigned Tickets
                  </div>
                  <div className="text-[13px] text-notion-text-secondary">
                    {dashboardStats.needsAttention.unassignedTickets} tickets need owners
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-[16px] h-[16px] text-notion-text-secondary" />
            </div>

            <div className="notion-card p-[16px] flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <div className="w-[36px] h-[36px] rounded-[6px] bg-notion-red/10 flex items-center justify-center">
                  <AlertCircle className="w-[18px] h-[18px] text-notion-red" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-notion-text">
                    Blocked Tasks
                  </div>
                  <div className="text-[13px] text-notion-text-secondary">
                    {dashboardStats.needsAttention.blockedTasks} tasks blocked
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-[16px] h-[16px] text-notion-text-secondary" />
            </div>
          </div>

          {/* Open PRs List */}
          <h2 className="notion-section-header mt-[24px] mb-[12px]">Open Pull Requests</h2>
          <div className="notion-card overflow-hidden">
            {pullRequests.slice(0, 4).map((pr, index) => (
              <div 
                key={pr.id}
                className={`flex items-center gap-[12px] p-[12px] px-[16px] transition-colors duration-150 hover:bg-[#FAFAF9] ${
                  index < 3 ? 'border-b border-notion-border' : ''
                }`}
              >
                <GitPullRequest className="w-[16px] h-[16px] text-notion-green flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-notion-text truncate">
                    {pr.title}
                  </p>
                  <p className="text-[12px] text-notion-text-secondary">
                    #{pr.number} · {pr.repo} · by {pr.author.name}
                  </p>
                </div>
                <span className="notion-badge">
                  +{pr.additions} -{pr.deletions}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
