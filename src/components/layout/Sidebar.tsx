import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Puzzle, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Target,
  AlertCircle,
  Calendar,
  GitPullRequest,
  FileText
} from 'lucide-react';
import { currentUser, dashboardStats, teamMembers } from '@/data/mockData';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'Chat Assistant' },
  { to: '/integrations', icon: Puzzle, label: 'Integrations' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const quickStats = [
  { 
    label: 'Reviews', 
    value: dashboardStats.needsAttention.pendingReviews, 
    icon: Eye, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  { 
    label: 'Unassigned', 
    value: dashboardStats.needsAttention.unassignedTickets, 
    icon: Target, 
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  { 
    label: 'Blocked', 
    value: dashboardStats.needsAttention.blockedTasks, 
    icon: AlertCircle, 
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
  { 
    label: 'Due Soon', 
    value: 8, 
    icon: Calendar, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);

  const topMembers = teamMembers
    .sort((a, b) => b.capacity - a.capacity)
    .slice(0, 4);

  return (
    <aside 
      className={`h-screen flex flex-col bg-notion-sidebar border-r border-notion-border transition-all duration-200 ${
        isCollapsed ? 'w-[60px]' : 'w-notion-sidebar'
      }`}
    >
      {/* Logo Area */}
      <div className="px-[14px] py-[12px] flex items-center justify-between">
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-[22px] h-[22px] bg-notion-text rounded-[4px] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[12px] font-bold">A</span>
          </div>
          {!isCollapsed && (
            <span className="text-[14px] font-semibold text-notion-text">AM PM</span>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mx-[6px] mb-[4px] p-[6px] rounded-[4px] hover:bg-notion-hover transition-colors duration-150 flex items-center justify-center"
      >
        {isCollapsed ? (
          <ChevronRight className="w-[16px] h-[16px] text-notion-text-secondary" />
        ) : (
          <ChevronLeft className="w-[16px] h-[16px] text-notion-text-secondary" />
        )}
      </button>

      {/* Navigation */}
      <nav className="py-[4px]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`notion-sidebar-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-[6px]' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon 
                className="w-[18px] h-[18px] opacity-60 flex-shrink-0" 
                strokeWidth={2}
              />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Stats Section */}
      {!isCollapsed && (
        <div className="px-[10px] mt-[8px]">
          <button
            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
            className="flex items-center justify-between w-full px-[4px] py-[6px] text-[11px] uppercase tracking-wide text-notion-text-secondary hover:text-notion-text transition-colors"
          >
            <span>Quick Stats</span>
            <ChevronDown className={`w-[14px] h-[14px] transition-transform ${isStatsExpanded ? '' : '-rotate-90'}`} />
          </button>
          
          {isStatsExpanded && (
            <div className="space-y-[2px] mb-[8px]">
              {/* Summary Row */}
              <div className="flex items-center gap-[8px] px-[8px] py-[6px] rounded-[4px] bg-notion-hover/50">
                <FileText className="w-[14px] h-[14px] text-notion-blue" />
                <span className="text-[12px] text-notion-text flex-1">Tickets</span>
                <span className="text-[12px] font-semibold text-notion-text">{dashboardStats.activeTickets.count}</span>
              </div>
              <div className="flex items-center gap-[8px] px-[8px] py-[6px] rounded-[4px] bg-notion-hover/50">
                <GitPullRequest className="w-[14px] h-[14px] text-notion-green" />
                <span className="text-[12px] text-notion-text flex-1">Open PRs</span>
                <span className="text-[12px] font-semibold text-notion-text">{dashboardStats.openPRs.count}</span>
              </div>

              {/* Needs Attention */}
              <div className="mt-[6px] pt-[6px] border-t border-notion-border">
                <div className="text-[10px] uppercase tracking-wide text-notion-text-tertiary px-[8px] mb-[4px]">Needs Attention</div>
                {quickStats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-[8px] px-[8px] py-[4px] rounded-[4px] hover:bg-notion-hover transition-colors cursor-pointer">
                    <div className={`w-[18px] h-[18px] rounded-[4px] ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-[10px] h-[10px] ${stat.color}`} />
                    </div>
                    <span className="text-[11px] text-notion-text flex-1">{stat.label}</span>
                    <span className="text-[11px] font-medium text-notion-text">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Team Capacity Mini */}
              <div className="mt-[6px] pt-[6px] border-t border-notion-border">
                <div className="text-[10px] uppercase tracking-wide text-notion-text-tertiary px-[8px] mb-[4px]">Team</div>
                <div className="flex items-center justify-between px-[8px]">
                  <div className="flex -space-x-1">
                    {topMembers.map((member) => (
                      <div 
                        key={member.id}
                        className="notion-avatar w-[20px] h-[20px] text-[8px] text-white border-2 border-notion-sidebar"
                        style={{ backgroundColor: member.avatarColor }}
                        title={`${member.name}: ${Math.round(member.capacity * 100)}%`}
                      >
                        {member.initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] text-notion-text-secondary">{dashboardStats.teamCapacity.average}% avg</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile */}
      <div className="px-[14px] py-[8px] border-t border-notion-border">
        <div className={`flex items-center gap-[12px] px-[4px] py-[4px] ${isCollapsed ? 'justify-center' : ''}`}>
          <div 
            className="notion-avatar w-[32px] h-[32px] text-[12px] text-white flex-shrink-0"
            style={{ backgroundColor: currentUser.avatarColor }}
            title={isCollapsed ? currentUser.name : undefined}
          >
            {currentUser.initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-notion-text truncate">
                {currentUser.name}
              </div>
              <div className="text-[12px] text-notion-text-secondary truncate">
                {currentUser.role}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
