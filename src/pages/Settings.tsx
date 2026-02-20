import { useState } from 'react';
import { useTheme } from 'next-themes';
import { 
  User, 
  Bell, 
  Palette, 
  Link2, 
  Shield, 
  Check,
  Github,
  Trello,
  MessageCircle
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
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );

  return (
    <div className="px-4 py-6 md:px-12 md:py-10">
      {/* Page Header */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-base text-muted-foreground">
          Manage your account preferences and integrations
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-12">
        {/* Sidebar Navigation */}
        <div className="md:w-[220px] flex-shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-accent text-primary font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-[640px]">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Profile</h2>
              
              <div className="flex items-start gap-6 mb-8">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-semibold text-white"
                  style={{ backgroundColor: currentUser.avatarColor }}
                >
                  {currentUser.initials}
                </div>
                <div>
                  <button className="airbnb-btn-secondary rounded-full py-2.5 px-5 text-sm mb-2">
                    Upload Photo
                  </button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="airbnb-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={currentUser.email}
                    className="airbnb-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser.role}
                    className="airbnb-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Timezone
                  </label>
                  <select className="airbnb-input w-full">
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
              </div>

              <button className="airbnb-btn-pill mt-8">
                Save Changes
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Notifications</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 border border-border rounded-2xl">
                  <div>
                    <div className="text-sm font-medium text-foreground">Email Notifications</div>
                    <div className="text-xs text-muted-foreground">
                      Receive updates via email
                    </div>
                  </div>
                  <Toggle checked={emailNotifications} onChange={setEmailNotifications} />
                </div>

                <div className="flex items-center justify-between p-5 border border-border rounded-2xl">
                  <div>
                    <div className="text-sm font-medium text-foreground">Slack Notifications</div>
                    <div className="text-xs text-muted-foreground">
                      Get notified in Slack channels
                    </div>
                  </div>
                  <Toggle checked={slackNotifications} onChange={setSlackNotifications} />
                </div>

                <div className="flex items-center justify-between p-5 border border-border rounded-2xl">
                  <div>
                    <div className="text-sm font-medium text-foreground">Desktop Notifications</div>
                    <div className="text-xs text-muted-foreground">
                      Browser push notifications
                    </div>
                  </div>
                  <Toggle checked={desktopNotifications} onChange={setDesktopNotifications} />
                </div>
              </div>

              <h3 className="text-sm font-medium text-foreground mt-10 mb-4">
                Notification Events
              </h3>
              <div className="space-y-2">
                {[
                  'New PR opened',
                  'Ticket assigned to you',
                  'AI suggestion made',
                  'Code review requested',
                  'Deployment completed',
                ].map((event) => (
                  <label
                    key={event}
                    className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">{event}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Appearance</h2>
              
              <div className="mb-10">
                <h3 className="text-sm font-medium text-foreground mb-4">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`p-5 border-2 rounded-2xl text-center bg-card transition-all ${
                      theme === 'light' ? 'border-primary' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="w-full h-12 bg-white border border-border rounded-xl mb-3" />
                    <span className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
                      Light
                      {theme === 'light' && <Check className="w-4 h-4 text-primary" />}
                    </span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`p-5 border-2 rounded-2xl text-center bg-card transition-all ${
                      theme === 'dark' ? 'border-primary' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="w-full h-12 bg-gray-900 border border-gray-700 rounded-xl mb-3" />
                    <span className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
                      Dark
                      {theme === 'dark' && <Check className="w-4 h-4 text-primary" />}
                    </span>
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`p-5 border-2 rounded-2xl text-center bg-card transition-all ${
                      theme === 'system' ? 'border-primary' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="w-full h-12 bg-gradient-to-b from-white to-gray-900 rounded-xl mb-3" />
                    <span className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
                      System
                      {theme === 'system' && <Check className="w-4 h-4 text-primary" />}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">Font Size</h3>
                <div className="flex gap-3">
                  {['Small', 'Default', 'Large'].map((size, i) => (
                    <button
                      key={size}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                        i === 1
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border text-foreground hover:bg-secondary'
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
              <h2 className="text-xl font-semibold text-foreground mb-6">Integrations Status</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-5 border border-border rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center">
                      <Github className="w-6 h-6 text-white dark:text-gray-900" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">GitHub</div>
                      <div className="text-xs text-muted-foreground">
                        {integrations.github.connected 
                          ? `Last synced ${integrations.github.lastSync}`
                          : 'Not connected'
                        }
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    integrations.github.connected 
                      ? 'bg-green-50 dark:bg-green-950 text-airbnb-success' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {integrations.github.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-5 border border-border rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Trello className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Jira</div>
                      <div className="text-xs text-muted-foreground">
                        {integrations.jira.connected 
                          ? `Last synced ${integrations.jira.lastSync}`
                          : 'Not connected'
                        }
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    integrations.jira.connected 
                      ? 'bg-green-50 dark:bg-green-950 text-airbnb-success' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {integrations.jira.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-5 border border-border rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Slack</div>
                      <div className="text-xs text-muted-foreground">
                        {integrations.slack.connected 
                          ? `Last synced ${integrations.slack.lastSync}`
                          : 'Not connected'
                        }
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    integrations.slack.connected 
                      ? 'bg-green-50 dark:bg-green-950 text-airbnb-success' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {integrations.slack.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">Data & Privacy</h2>
              
              <div className="space-y-4">
                <div className="p-5 border border-border rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">Export Data</div>
                      <div className="text-xs text-muted-foreground">
                        Download all your data in JSON format
                      </div>
                    </div>
                    <button className="airbnb-btn-secondary rounded-full py-2 px-4 text-sm">Export</button>
                  </div>
                </div>

                <div className="p-5 border border-border rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">Clear Cache</div>
                      <div className="text-xs text-muted-foreground">
                        Clear locally cached data
                      </div>
                    </div>
                    <button className="airbnb-btn-secondary rounded-full py-2 px-4 text-sm">Clear</button>
                  </div>
                </div>

                <div className="p-5 border border-destructive/30 rounded-2xl bg-destructive/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-destructive">Delete Account</div>
                      <div className="text-xs text-muted-foreground">
                        Permanently delete your account and all data
                      </div>
                    </div>
                    <button className="bg-destructive text-destructive-foreground rounded-full py-2 px-4 text-sm font-medium hover:bg-destructive/90 transition-colors">
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
