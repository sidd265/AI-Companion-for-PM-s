import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Puzzle, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { currentUser } from '@/data/mockData';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'Chat Assistant' },
  { to: '/integrations', icon: Puzzle, label: 'Integrations' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      <nav className="flex-1 py-[4px]">
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
