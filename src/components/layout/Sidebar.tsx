import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Puzzle, 
  Users, 
  Settings 
} from 'lucide-react';
import { currentUser } from '@/data/mockData';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'Chat Assistant' },
  { to: '/integrations', icon: Puzzle, label: 'Integrations' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-notion-sidebar h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo Area */}
      <div className="px-[14px] py-[12px]">
        <div className="flex items-center gap-2">
          <div className="w-[22px] h-[22px] bg-foreground rounded-[4px] flex items-center justify-center">
            <span className="text-background text-[12px] font-bold">A</span>
          </div>
          <span className="text-[14px] font-semibold text-foreground">AM PM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-[4px]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`notion-sidebar-item ${isActive ? 'active' : ''}`}
            >
              <item.icon 
                className="w-[18px] h-[18px] opacity-60" 
                strokeWidth={2}
              />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-[6px] py-[4px] border-t border-sidebar-border">
        <ThemeToggle />
      </div>

      {/* User Profile */}
      <div className="px-[14px] py-[8px] border-t border-sidebar-border">
        <div className="flex items-center gap-[12px] px-[4px] py-[4px]">
          <div 
            className="notion-avatar w-[32px] h-[32px] text-[12px] text-white"
            style={{ backgroundColor: currentUser.avatarColor }}
          >
            {currentUser.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-foreground truncate">
              {currentUser.name}
            </div>
            <div className="text-[12px] text-muted-foreground truncate">
              {currentUser.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
