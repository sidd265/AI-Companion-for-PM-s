import { useState } from 'react';
import { useTheme } from 'next-themes';
import { 
  User, 
  Bell, 
  Palette, 
  Link2, 
  Shield, 
  ChevronRight,
  Check,
  Github,
  Trello,
  MessageCircle,
  Monitor
} from 'lucide-react';
import { currentUser, integrations } from '@/data/mockData';

type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'integrations' | 'privacy';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const { theme, setTheme } = useTheme();

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'integrations' as const, label: 'Integrations Status', icon: Link2 },
    { id: 'privacy' as const, label: 'Data & Privacy', icon: Shield },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 ${
        checked ? 'bg-notion-blue' : 'bg-notion-border'
      }`}
    >
      <span
        className={`absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
          checked ? 'left-[22px]' : 'left-[2px]'
        }`}
      />
    </button>
  );

  return (
    <div className="px-notion-massive py-notion-xxl">
      {/* Page Header */}
      <div className="mb-[32px]">
        <h1 className="notion-title mb-[4px]">Settings</h1>
        <p className="text-[16px] text-notion-text-secondary">
          Manage your account preferences and integrations
        </p>
      </div>

      <div className="flex gap-[48px]">
        {/* Sidebar Navigation */}
        <div className="w-[200px] flex-shrink-0">
          <nav className="space-y-[2px]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-[10px] px-[12px] py-[8px] rounded-[4px] text-[14px] transition-colors duration-150 ${
                  activeTab === tab.id
                    ? 'bg-notion-active text-notion-text'
                    : 'text-notion-text-secondary hover:bg-notion-hover'
                }`}
              >
                <tab.icon className="w-[16px] h-[16px]" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-[600px]">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-[18px] font-semibold text-notion-text mb-[24px]">Profile</h2>
              
              <div className="flex items-start gap-[20px] mb-[32px]">
                <div 
                  className="w-[80px] h-[80px] rounded-[8px] flex items-center justify-center text-[24px] font-semibold text-white"
                  style={{ backgroundColor: currentUser.avatarColor }}
                >
                  {currentUser.initials}
                </div>
                <div>
                  <button className="notion-btn-secondary mb-[8px]">
                    Upload Photo
                  </button>
                  <p className="text-[12px] text-notion-text-secondary">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="space-y-[20px]">
                <div>
                  <label className="block text-[14px] font-medium text-notion-text mb-[8px]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="notion-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-notion-text mb-[8px]">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    className="notion-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-notion-text mb-[8px]">
                    Role
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser.role}
                    className="notion-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-notion-text mb-[8px]">
                    Timezone
                  </label>
                  <select className="notion-input w-full">
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
              </div>

              <button className="notion-btn-primary mt-[24px]">
                Save Changes
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-[18px] font-semibold text-notion-text mb-[24px]">Notifications</h2>
              
              <div className="space-y-[16px]">
                <div className="flex items-center justify-between p-[16px] border border-notion-border rounded-[6px]">
                  <div>
                    <div className="text-[14px] font-medium text-notion-text">Email Notifications</div>
                    <div className="text-[13px] text-notion-text-secondary">
                      Receive updates via email
                    </div>
                  </div>
                  <Toggle checked={emailNotifications} onChange={setEmailNotifications} />
                </div>

                <div className="flex items-center justify-between p-[16px] border border-notion-border rounded-[6px]">
                  <div>
                    <div className="text-[14px] font-medium text-notion-text">Slack Notifications</div>
                    <div className="text-[13px] text-notion-text-secondary">
                      Get notified in Slack channels
                    </div>
                  </div>
                  <Toggle checked={slackNotifications} onChange={setSlackNotifications} />
                </div>

                <div className="flex items-center justify-between p-[16px] border border-notion-border rounded-[6px]">
                  <div>
                    <div className="text-[14px] font-medium text-notion-text">Desktop Notifications</div>
                    <div className="text-[13px] text-notion-text-secondary">
                      Browser push notifications
                    </div>
                  </div>
                  <Toggle checked={desktopNotifications} onChange={setDesktopNotifications} />
                </div>
              </div>

              <h3 className="text-[14px] font-medium text-notion-text mt-[32px] mb-[16px]">
                Notification Events
              </h3>
              <div className="space-y-[8px]">
                {[
                  'New PR opened',
                  'Ticket assigned to you',
                  'AI suggestion made',
                  'Code review requested',
                  'Deployment completed',
                ].map((event) => (
                  <label
                    key={event}
                    className="flex items-center gap-[12px] p-[12px] border border-notion-border rounded-[6px] cursor-pointer hover:bg-notion-hover transition-colors duration-150"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-[16px] h-[16px] rounded-[4px] border-notion-border text-notion-blue focus:ring-notion-blue"
                    />
                    <span className="text-[14px] text-notion-text">{event}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-[18px] font-semibold text-foreground mb-[24px]">Appearance</h2>
              
              <div className="mb-[32px]">
                <h3 className="text-[14px] font-medium text-foreground mb-[12px]">Theme</h3>
                <div className="grid grid-cols-3 gap-[12px]">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`p-[16px] border-2 rounded-[8px] text-center bg-card transition-colors ${
                      theme === 'light' ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <div className="w-full h-[48px] bg-white border border-border rounded-[4px] mb-[8px]" />
                    <span className="text-[14px] font-medium text-foreground flex items-center justify-center gap-2">
                      Light
                      {theme === 'light' && <Check className="w-[14px] h-[14px] text-primary" />}
                    </span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`p-[16px] border-2 rounded-[8px] text-center bg-card transition-colors ${
                      theme === 'dark' ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <div className="w-full h-[48px] bg-[#191919] border border-[#373737] rounded-[4px] mb-[8px]" />
                    <span className="text-[14px] font-medium text-foreground flex items-center justify-center gap-2">
                      Dark
                      {theme === 'dark' && <Check className="w-[14px] h-[14px] text-primary" />}
                    </span>
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`p-[16px] border-2 rounded-[8px] text-center bg-card transition-colors ${
                      theme === 'system' ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <div className="w-full h-[48px] bg-gradient-to-b from-white to-[#191919] rounded-[4px] mb-[8px]" />
                    <span className="text-[14px] font-medium text-foreground flex items-center justify-center gap-2">
                      System
                      {theme === 'system' && <Check className="w-[14px] h-[14px] text-primary" />}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-medium text-notion-text mb-[12px]">Font Size</h3>
                <div className="flex gap-[8px]">
                  {['Small', 'Default', 'Large'].map((size, i) => (
                    <button
                      key={size}
                      className={`px-[16px] py-[8px] rounded-[6px] text-[14px] transition-colors duration-150 ${
                        i === 1
                          ? 'bg-notion-blue text-white'
                          : 'border border-notion-border text-notion-text hover:bg-notion-hover'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Integrations Status Tab */}
          {activeTab === 'integrations' && (
            <div>
              <h2 className="text-[18px] font-semibold text-notion-text mb-[24px]">Integrations Status</h2>
              
              <div className="space-y-[12px]">
                <div className="flex items-center justify-between p-[16px] border border-notion-border rounded-[6px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] bg-[#24292e] rounded-[6px] flex items-center justify-center">
                      <Github className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-notion-text">GitHub</div>
                      <div className="text-[12px] text-notion-text-secondary">
                        {integrations.github.connected 
                          ? `Last synced ${integrations.github.lastSync}`
                          : 'Not connected'
                        }
                      </div>
                    </div>
                  </div>
                  <span className={`notion-badge ${integrations.github.connected ? 'bg-notion-green/10 text-notion-green border-notion-green/20' : ''}`}>
                    {integrations.github.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-[16px] border border-notion-border rounded-[6px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] bg-[#0052CC] rounded-[6px] flex items-center justify-center">
                      <Trello className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-notion-text">Jira</div>
                      <div className="text-[12px] text-notion-text-secondary">
                        {integrations.jira.connected 
                          ? `Last synced ${integrations.jira.lastSync}`
                          : 'Not connected'
                        }
                      </div>
                    </div>
                  </div>
                  <span className={`notion-badge ${integrations.jira.connected ? 'bg-notion-green/10 text-notion-green border-notion-green/20' : ''}`}>
                    {integrations.jira.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-[16px] border border-notion-border rounded-[6px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] bg-[#E01E5A] rounded-[6px] flex items-center justify-center">
                      <MessageCircle className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-notion-text">Slack</div>
                      <div className="text-[12px] text-notion-text-secondary">
                        {integrations.slack.connected 
                          ? `Last synced ${integrations.slack.lastSync}`
                          : 'Not connected'
                        }
                      </div>
                    </div>
                  </div>
                  <span className="notion-badge">
                    {integrations.slack.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-[18px] font-semibold text-notion-text mb-[24px]">Data & Privacy</h2>
              
              <div className="space-y-[16px]">
                <div className="p-[16px] border border-notion-border rounded-[6px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[14px] font-medium text-notion-text">Export Data</div>
                      <div className="text-[13px] text-notion-text-secondary">
                        Download all your data in JSON format
                      </div>
                    </div>
                    <button className="notion-btn-secondary">Export</button>
                  </div>
                </div>

                <div className="p-[16px] border border-notion-border rounded-[6px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[14px] font-medium text-notion-text">Clear Cache</div>
                      <div className="text-[13px] text-notion-text-secondary">
                        Clear locally cached data
                      </div>
                    </div>
                    <button className="notion-btn-secondary">Clear</button>
                  </div>
                </div>

                <div className="p-[16px] border border-notion-red/20 rounded-[6px] bg-notion-red/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[14px] font-medium text-notion-red">Delete Account</div>
                      <div className="text-[13px] text-notion-text-secondary">
                        Permanently delete your account and all data
                      </div>
                    </div>
                    <button className="px-3 py-[6px] rounded-[6px] text-[14px] font-medium bg-notion-red text-white hover:bg-notion-red/90 transition-colors duration-150">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
