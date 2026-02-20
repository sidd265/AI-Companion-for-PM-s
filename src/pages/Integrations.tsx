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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-card border-l border-border shadow-2xl sm:rounded-l-3xl"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground capitalize">
              {type} Settings
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {type === 'github' && integration.connected && (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Connected Account
                </h3>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center">
                      <Github className="w-6 h-6 text-background" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        @{integrations.github.username}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Connected
                      </div>
                    </div>
                  </div>
                  <button className="text-sm text-destructive hover:underline font-medium">
                    Disconnect
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Repositories ({repositories.length})
                </h3>
                <div className="space-y-2">
                  {repositories.map(repo => (
                    <label 
                      key={repo.id}
                      className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="text-sm text-foreground">{repo.name}</div>
                        <div className="text-xs text-muted-foreground">{repo.description}</div>
                      </div>
                      <span className="airbnb-tag">{repo.language}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Sync Settings
                </h3>
                <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <div className="text-sm text-foreground">Last Synced</div>
                    <div className="text-xs text-muted-foreground">
                      {integrations.github.lastSync}
                    </div>
                  </div>
                  <button className="airbnb-btn-secondary flex items-center gap-2 py-2 px-4 rounded-full">
                    <RefreshCw className="w-4 h-4" />
                    Sync Now
                  </button>
                </div>
              </div>
            </>
          )}

          {type === 'jira' && integration.connected && (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Connected Site
                </h3>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Trello className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {integrations.jira.site}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {integrations.jira.projects} projects synced
                      </div>
                    </div>
                  </div>
                  <button className="text-sm text-destructive hover:underline font-medium">
                    Disconnect
                  </button>
                </div>
              </div>
            </>
          )}

          {type === 'slack' && !integration.connected && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Connect Slack
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Get notifications and updates directly in your Slack workspace
              </p>
              <button className="airbnb-btn-pill">
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
      iconBg: 'bg-gray-900 dark:bg-gray-100',
      iconColor: 'text-white dark:text-gray-900',
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
      iconBg: 'bg-blue-600',
      iconColor: 'text-white',
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
      iconBg: 'bg-purple-600',
      iconColor: 'text-white',
      connected: integrations.slack.connected,
      info: null,
    },
  ];

  return (
    <div className="px-4 py-6 md:px-12 md:py-10">
      {/* Page Header */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Integrations</h1>
        <p className="text-base text-muted-foreground">
          Connect your tools to unlock the full power of AM PM
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrationCards.map((integration) => (
          <div key={integration.id} className="airbnb-card p-6">
            <div 
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${integration.iconBg}`}
            >
              <integration.icon className={`w-7 h-7 ${integration.iconColor}`} />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {integration.name}
            </h3>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {integration.description}
            </p>

            {integration.connected ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950 text-airbnb-success">
                    <Check className="w-3 h-3" />
                    Connected
                  </span>
                </div>
                {integration.info && (
                  <p className="text-xs text-muted-foreground mb-5">
                    {integration.info}
                  </p>
                )}
                <button 
                  onClick={() => setActiveDrawer(integration.id)}
                  className="airbnb-btn-secondary flex items-center gap-2 py-2 px-4 rounded-full text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Manage
                </button>
              </>
            ) : (
              <button 
                onClick={() => setActiveDrawer(integration.id)}
                className="airbnb-btn-pill flex items-center gap-2 py-2.5 px-5 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Connect
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { name: 'Linear', description: 'Track issues and projects' },
            { name: 'Notion', description: 'Sync with your Notion workspace' },
            { name: 'Figma', description: 'View designs and prototypes' },
          ].map((item) => (
            <div key={item.name} className="airbnb-card-static p-6 opacity-60">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-5">
                <span className="text-lg text-muted-foreground">?</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
              <span className="airbnb-badge mt-5">Coming Soon</span>
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
