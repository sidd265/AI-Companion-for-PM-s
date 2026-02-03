import { useState } from 'react';
import { Github, Trello, MessageCircle, Check, X, Settings, RefreshCw, ExternalLink } from 'lucide-react';
import { integrations, repositories } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

interface IntegrationDrawerProps {
  type: 'github' | 'jira' | 'slack';
  onClose: () => void;
}

const IntegrationDrawer = ({ type, onClose }: IntegrationDrawerProps) => {
  const integration = integrations[type];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[5px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="absolute right-0 top-0 h-full w-notion-drawer bg-white border-l border-notion-border shadow-notion-drawer"
      >
        <div className="p-[32px]">
          <div className="flex items-center justify-between mb-[24px]">
            <h2 className="text-[24px] font-semibold text-notion-text capitalize">
              {type} Settings
            </h2>
            <button 
              onClick={onClose}
              className="p-[8px] hover:bg-notion-hover rounded-[4px] transition-colors duration-150"
            >
              <X className="w-[20px] h-[20px] text-notion-text-secondary" />
            </button>
          </div>

          {type === 'github' && integration.connected && (
            <>
              <div className="mb-[24px]">
                <h3 className="text-[14px] font-medium text-notion-text mb-[12px]">
                  Connected Account
                </h3>
                <div className="flex items-center justify-between p-[12px] bg-notion-sidebar rounded-[6px] border border-notion-border">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] bg-notion-text rounded-full flex items-center justify-center">
                      <Github className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-notion-text">
                        @{integrations.github.username}
                      </div>
                      <div className="text-[12px] text-notion-text-secondary">
                        Connected
                      </div>
                    </div>
                  </div>
                  <button className="text-[14px] text-notion-red hover:underline">
                    Disconnect
                  </button>
                </div>
              </div>

              <div className="mb-[24px]">
                <h3 className="text-[14px] font-medium text-notion-text mb-[12px]">
                  Repositories ({repositories.length})
                </h3>
                <div className="space-y-[8px]">
                  {repositories.map(repo => (
                    <label 
                      key={repo.id}
                      className="flex items-center gap-[12px] p-[12px] border border-notion-border rounded-[6px] cursor-pointer hover:bg-notion-hover transition-colors duration-150"
                    >
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="w-[16px] h-[16px] rounded-[4px] border-notion-border text-notion-blue focus:ring-notion-blue"
                      />
                      <div className="flex-1">
                        <div className="text-[14px] text-notion-text">{repo.name}</div>
                        <div className="text-[12px] text-notion-text-secondary">{repo.description}</div>
                      </div>
                      <span className="notion-tag">{repo.language}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-[24px]">
                <h3 className="text-[14px] font-medium text-notion-text mb-[12px]">
                  Sync Settings
                </h3>
                <div className="flex items-center justify-between p-[12px] border border-notion-border rounded-[6px]">
                  <div>
                    <div className="text-[14px] text-notion-text">Last Synced</div>
                    <div className="text-[12px] text-notion-text-secondary">
                      {integrations.github.lastSync}
                    </div>
                  </div>
                  <button className="notion-btn-secondary flex items-center gap-2">
                    <RefreshCw className="w-[14px] h-[14px]" />
                    Sync Now
                  </button>
                </div>
              </div>
            </>
          )}

          {type === 'jira' && integration.connected && (
            <>
              <div className="mb-[24px]">
                <h3 className="text-[14px] font-medium text-notion-text mb-[12px]">
                  Connected Site
                </h3>
                <div className="flex items-center justify-between p-[12px] bg-notion-sidebar rounded-[6px] border border-notion-border">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] bg-notion-blue rounded-[6px] flex items-center justify-center">
                      <Trello className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-notion-text">
                        {integrations.jira.site}
                      </div>
                      <div className="text-[12px] text-notion-text-secondary">
                        {integrations.jira.projects} projects synced
                      </div>
                    </div>
                  </div>
                  <button className="text-[14px] text-notion-red hover:underline">
                    Disconnect
                  </button>
                </div>
              </div>
            </>
          )}

          {type === 'slack' && !integration.connected && (
            <div className="text-center py-[48px]">
              <div className="w-[64px] h-[64px] bg-notion-sidebar rounded-[12px] flex items-center justify-center mx-auto mb-[16px]">
                <MessageCircle className="w-[32px] h-[32px] text-notion-text-secondary" />
              </div>
              <h3 className="text-[18px] font-medium text-notion-text mb-[8px]">
                Connect Slack
              </h3>
              <p className="text-[14px] text-notion-text-secondary mb-[24px]">
                Get notifications and updates directly in your Slack workspace
              </p>
              <button className="notion-btn-primary">
                Connect Slack
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Integrations = () => {
  const [activeDrawer, setActiveDrawer] = useState<'github' | 'jira' | 'slack' | null>(null);

  const integrationCards = [
    {
      id: 'github' as const,
      name: 'GitHub',
      description: 'Connect repositories to analyze code and pull requests',
      icon: Github,
      iconBg: '#24292e',
      connected: integrations.github.connected,
      info: integrations.github.connected 
        ? `Connected as @${integrations.github.username} · Syncing ${integrations.github.repos} repositories`
        : null,
    },
    {
      id: 'jira' as const,
      name: 'Jira',
      description: 'Connect projects to track tickets and assignments',
      icon: Trello,
      iconBg: '#0052CC',
      connected: integrations.jira.connected,
      info: integrations.jira.connected
        ? `Connected to ${integrations.jira.site} · ${integrations.jira.projects} projects`
        : null,
    },
    {
      id: 'slack' as const,
      name: 'Slack',
      description: 'Get notifications and updates in Slack channels',
      icon: MessageCircle,
      iconBg: '#E01E5A',
      connected: integrations.slack.connected,
      info: null,
    },
  ];

  return (
    <div className="px-notion-massive py-notion-xxl">
      {/* Page Header */}
      <div className="mb-[32px]">
        <h1 className="notion-title mb-[4px]">Integrations</h1>
        <p className="text-[16px] text-notion-text-secondary">
          Connect your tools to unlock the full power of AM PM
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        {integrationCards.map((integration) => (
          <div key={integration.id} className="notion-card p-[20px]">
            <div 
              className="w-[48px] h-[48px] rounded-[8px] flex items-center justify-center mb-[16px]"
              style={{ backgroundColor: integration.iconBg }}
            >
              <integration.icon className="w-[24px] h-[24px] text-white" />
            </div>
            
            <h3 className="text-[18px] font-semibold text-notion-text mb-[8px]">
              {integration.name}
            </h3>
            
            <p className="text-[14px] text-notion-text-secondary leading-[1.5] mb-[16px]">
              {integration.description}
            </p>

            {integration.connected ? (
              <>
                <div className="flex items-center gap-[6px] mb-[12px]">
                  <span className="inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-[3px] text-[12px] font-medium bg-notion-green/10 text-notion-green">
                    <Check className="w-[12px] h-[12px]" />
                    Connected
                  </span>
                </div>
                {integration.info && (
                  <p className="text-[13px] text-notion-text-secondary mb-[16px]">
                    {integration.info}
                  </p>
                )}
                <button 
                  onClick={() => setActiveDrawer(integration.id)}
                  className="notion-btn-secondary flex items-center gap-2"
                >
                  <Settings className="w-[14px] h-[14px]" />
                  Manage
                </button>
              </>
            ) : (
              <button 
                onClick={() => setActiveDrawer(integration.id)}
                className="notion-btn-primary flex items-center gap-2"
              >
                <ExternalLink className="w-[14px] h-[14px]" />
                Connect
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="mt-notion-xxl">
        <h2 className="notion-section-header mb-[12px]">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          {[
            { name: 'Linear', description: 'Track issues and projects' },
            { name: 'Notion', description: 'Sync with your Notion workspace' },
            { name: 'Figma', description: 'View designs and prototypes' },
          ].map((item) => (
            <div key={item.name} className="notion-card p-[20px] opacity-60">
              <div className="w-[48px] h-[48px] rounded-[8px] bg-notion-border flex items-center justify-center mb-[16px]">
                <span className="text-[16px] text-notion-text-secondary">?</span>
              </div>
              <h3 className="text-[18px] font-semibold text-notion-text mb-[8px]">
                {item.name}
              </h3>
              <p className="text-[14px] text-notion-text-secondary">
                {item.description}
              </p>
              <span className="notion-badge mt-[16px]">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {activeDrawer && (
          <IntegrationDrawer
            type={activeDrawer}
            onClose={() => setActiveDrawer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Integrations;
