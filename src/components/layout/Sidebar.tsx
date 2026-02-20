import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Puzzle, Users, Settings, ChevronLeft, ChevronRight, ChevronDown, Eye, Target, AlertCircle, Calendar, GitPullRequest, FileText } from 'lucide-react';
import { currentUser, dashboardStats, teamMembers } from '@/data/mockData';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pull-requests', icon: GitPullRequest, label: 'Pull Requests' },
  { to: '/chat', icon: MessageSquare, label: 'Chat Assistant' },
  { to: '/integrations', icon: Puzzle, label: 'Integrations' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

const quickStats = [
  { label: 'Reviews', value: dashboardStats.needsAttention.pendingReviews, icon: Eye, color: 'text-orange-500', bgColor: 'bg-orange-50', route: '/integrations' },
  { label: 'Unassigned', value: dashboardStats.needsAttention.unassignedTickets, icon: Target, color: 'text-amber-500', bgColor: 'bg-amber-50', route: '/integrations' },
  { label: 'Blocked', value: dashboardStats.needsAttention.blockedTasks, icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50', route: '/integrations' },
  { label: 'Due Soon', value: 8, icon: Calendar, color: 'text-purple-500', bgColor: 'bg-purple-50', route: '/integrations' }
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const topMembers = teamMembers.sort((a, b) => b.capacity - a.capacity).slice(0, 4);

  return (
    <aside className={`h-screen flex flex-col bg-card border-r border-border transition-all duration-200 relative ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>
      {/* Edge Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-10 w-6 h-12 bg-card border border-border rounded-full flex items-center justify-center transition-colors duration-150 shadow-sm hover:bg-secondary"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Logo Area */}
      <div className="px-4 py-5 flex items-center justify-between border-b border-border">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-sm font-bold">A</span>
          </div>
          {!isCollapsed && (
            <span className="text-base font-semibold text-foreground">AM PM</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-2 px-3">
        {navItems.map(item => {
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-xl text-sm transition-all duration-150 ${
                isActive 
                  ? 'bg-accent text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} strokeWidth={2} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Stats Section */}
      {!isCollapsed && (
        <div className="px-3 mt-4">
          <button
            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg"
          >
            <span>Quick Stats</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isStatsExpanded ? '' : '-rotate-90'}`} />
          </button>

          {isStatsExpanded && (
            <div className="space-y-1 mt-1">
              {/* Summary Row */}
              <div onClick={() => navigate('/integrations')} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground flex-1">Tickets</span>
                <span className="text-xs font-semibold text-foreground">{dashboardStats.activeTickets.count}</span>
              </div>
              <div onClick={() => navigate('/pull-requests')} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors">
                <GitPullRequest className="w-4 h-4 text-airbnb-success" />
                <span className="text-xs text-muted-foreground flex-1">Open PRs</span>
                <span className="text-xs font-semibold text-foreground">{dashboardStats.openPRs.count}</span>
              </div>

              {/* Needs Attention */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">Needs Attention</div>
                {quickStats.map(stat => (
                  <div
                    key={stat.label}
                    onClick={() => navigate(stat.route)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className={`w-6 h-6 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-3 h-3 ${stat.color}`} />
                    </div>
                    <span className="text-xs text-muted-foreground flex-1">{stat.label}</span>
                    <span className="text-xs font-medium text-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Team Capacity Mini */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">Team</div>
                <div className="flex items-center justify-between px-3">
                  <div className="flex -space-x-1.5">
                    {topMembers.map(member => (
                      <div
                        key={member.id}
                        className="w-7 h-7 rounded-full text-[9px] text-white border-2 border-card flex items-center justify-center font-semibold"
                        style={{ backgroundColor: member.avatarColor }}
                        title={`${member.name}: ${Math.round(member.capacity * 100)}%`}
                      >
                        {member.initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{dashboardStats.teamCapacity.average}% avg</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-border">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div
            className="w-10 h-10 rounded-full text-sm text-white flex-shrink-0 flex items-center justify-center font-semibold"
            style={{ backgroundColor: currentUser.avatarColor }}
            title={isCollapsed ? currentUser.name : undefined}
          >
            {currentUser.initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {currentUser.name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {currentUser.role}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
