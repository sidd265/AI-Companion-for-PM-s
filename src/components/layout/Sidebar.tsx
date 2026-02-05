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
      className={`h-screen flex flex-col bg-[#172B4D] transition-all duration-200 ${
        isCollapsed ? 'w-[60px]' : 'w-[260px]'
      }`}
    >
      {/* Logo Area */}
      <div className="px-[16px] py-[16px] flex items-center justify-between border-b border-white/10">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-[28px] h-[28px] bg-[#0052CC] rounded-[3px] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[14px] font-bold">A</span>
          </div>
          {!isCollapsed && (
            <span className="text-[15px] font-semibold text-white">AM PM</span>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mx-[8px] mt-[8px] mb-[4px] p-[8px] rounded-[3px] hover:bg-white/10 transition-colors duration-150 flex items-center justify-center"
      >
        {isCollapsed ? (
          <ChevronRight className="w-[16px] h-[16px] text-white/60" />
        ) : (
          <ChevronLeft className="w-[16px] h-[16px] text-white/60" />
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
              className={`flex items-center gap-3 px-[16px] py-[10px] mx-[8px] my-[2px] rounded-[3px] text-[14px] transition-colors duration-150 cursor-pointer ${
                isActive 
                  ? 'bg-[#0052CC] text-white' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              } ${isCollapsed ? 'justify-center px-[8px]' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon 
                className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`}
                strokeWidth={2}
              />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Stats Section */}
      {!isCollapsed && (
        <div className="px-[12px] mt-[16px]">
          <button
            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
            className="flex items-center justify-between w-full px-[8px] py-[6px] text-[11px] uppercase tracking-wider text-white/50 hover:text-white/70 transition-colors"
          >
            <span>Quick Stats</span>
            <ChevronDown className={`w-[14px] h-[14px] transition-transform ${isStatsExpanded ? '' : '-rotate-90'}`} />
          </button>
          
          {isStatsExpanded && (
            <div className="space-y-[4px] mb-[8px]">
              {/* Summary Row */}
              <div className="flex items-center gap-[10px] px-[10px] py-[8px] rounded-[3px] bg-white/5">
                <FileText className="w-[14px] h-[14px] text-[#4C9AFF]" />
                <span className="text-[12px] text-white/80 flex-1">Tickets</span>
                <span className="text-[12px] font-semibold text-white">{dashboardStats.activeTickets.count}</span>
              </div>
              <div className="flex items-center gap-[10px] px-[10px] py-[8px] rounded-[3px] bg-white/5">
                <GitPullRequest className="w-[14px] h-[14px] text-[#36B37E]" />
                <span className="text-[12px] text-white/80 flex-1">Open PRs</span>
                <span className="text-[12px] font-semibold text-white">{dashboardStats.openPRs.count}</span>
              </div>

              {/* Needs Attention */}
              <div className="mt-[8px] pt-[8px] border-t border-white/10">
                <div className="text-[10px] uppercase tracking-wider text-white/40 px-[10px] mb-[6px]">Needs Attention</div>
                {quickStats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-[10px] px-[10px] py-[6px] rounded-[3px] hover:bg-white/5 transition-colors cursor-pointer">
                    <div className={`w-[20px] h-[20px] rounded-[3px] ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-[11px] h-[11px] ${stat.color}`} />
                    </div>
                    <span className="text-[12px] text-white/70 flex-1">{stat.label}</span>
                    <span className="text-[12px] font-medium text-white/90">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Team Capacity Mini */}
              <div className="mt-[8px] pt-[8px] border-t border-white/10">
                <div className="text-[10px] uppercase tracking-wider text-white/40 px-[10px] mb-[6px]">Team</div>
                <div className="flex items-center justify-between px-[10px]">
                  <div className="flex -space-x-1">
                    {topMembers.map((member) => (
                      <div 
                        key={member.id}
                        className="w-[22px] h-[22px] rounded-full text-[8px] text-white border-2 border-[#172B4D] flex items-center justify-center font-semibold"
                        style={{ backgroundColor: member.avatarColor }}
                        title={`${member.name}: ${Math.round(member.capacity * 100)}%`}
                      >
                        {member.initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] text-white/50">{dashboardStats.teamCapacity.average}% avg</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile */}
      <div className="px-[16px] py-[12px] border-t border-white/10">
        <div className={`flex items-center gap-[12px] ${isCollapsed ? 'justify-center' : ''}`}>
          <div 
            className="w-[36px] h-[36px] rounded-full text-[13px] text-white flex-shrink-0 flex items-center justify-center font-semibold"
            style={{ backgroundColor: currentUser.avatarColor }}
            title={isCollapsed ? currentUser.name : undefined}
          >
            {currentUser.initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-white truncate">
                {currentUser.name}
              </div>
              <div className="text-[12px] text-white/50 truncate">
                {currentUser.role}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
