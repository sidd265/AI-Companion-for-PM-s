import { useState, useEffect, useCallback } from 'react';
import { Github, Trello, MessageCircle, Check, X, Settings, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntegrationStatuses, useIntegrationRepositories } from '@/hooks/useIntegrations';
import { IntegrationCardSkeleton } from '@/components/skeletons/PageSkeletons';
import ErrorState from '@/components/ErrorState';
import { supabase } from '@/lib/supabase';
import { storeGitHubConnection, storeJiraConnection, disconnectIntegration } from '@/services/integrations';
import { fetchJiraProjects } from '@/lib/jira';
import { syncJiraTickets } from '@/services/jira';
import { useQueryClient } from '@tanstack/react-query';

interface IntegrationDrawerProps {
  type: 'github' | 'jira' | 'slack';
  onClose: () => void;
  onDisconnect: (type: 'github' | 'jira' | 'slack') => void;
}

const IntegrationDrawer = ({ type, onClose, onDisconnect }: IntegrationDrawerProps) => {
  const { data: integrations } = useIntegrationStatuses();
  const { data: repositories } = useIntegrationRepositories();
  const integration = integrations?.[type];
  if (!integration) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: 'easeOut' }} className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-card border-l border-border shadow-2xl sm:rounded-l-3xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground capitalize">{type} Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          {type === 'github' && integration.connected && integrations && (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Connected Account</h3>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center"><Github className="w-6 h-6 text-background" /></div>
                    <div>
                      <div className="text-sm font-medium text-foreground">@{integrations.github.username}</div>
                      <div className="text-xs text-muted-foreground">Connected</div>
                    </div>
                  </div>
                  <button onClick={() => onDisconnect('github')} className="text-sm text-destructive hover:underline font-medium">Disconnect</button>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Repositories ({repositories?.length ?? 0})</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {(repositories ?? []).map(repo => (
                    <label key={repo.id} className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                      <div className="flex-1">
                        <div className="text-sm text-foreground">{repo.name}</div>
                        <div className="text-xs text-muted-foreground">{repo.description}</div>
                      </div>
                      {repo.language && <span className="airbnb-tag">{repo.language}</span>}
                    </label>
                  ))}
                  {repositories?.length === 0 && (
                    <p className="text-sm text-muted-foreground p-4">No repositories found.</p>
                  )}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Sync Settings</h3>
                <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <div className="text-sm text-foreground">Last Synced</div>
                    <div className="text-xs text-muted-foreground">{integrations.github.lastSync}</div>
                  </div>
                  <button className="airbnb-btn-secondary flex items-center gap-2 py-2 px-4 rounded-full"><RefreshCw className="w-4 h-4" />Sync Now</button>
                </div>
              </div>
            </>
          )}
          {type === 'jira' && integration.connected && integrations && (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Connected Site</h3>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center"><Trello className="w-6 h-6 text-white" /></div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{integrations.jira.site}</div>
                      <div className="text-xs text-muted-foreground">{integrations.jira.projects} projects synced</div>
                    </div>
                  </div>
                  <button onClick={() => onDisconnect('jira')} className="text-sm text-destructive hover:underline font-medium">Disconnect</button>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Sync Settings</h3>
                <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <div className="text-sm text-foreground">Last Synced</div>
                    <div className="text-xs text-muted-foreground">{integrations.jira.lastSync ? new Date(integrations.jira.lastSync).toLocaleString() : 'Never'}</div>
                  </div>
                  <button onClick={async () => { await syncJiraTickets(); }} className="airbnb-btn-secondary flex items-center gap-2 py-2 px-4 rounded-full"><RefreshCw className="w-4 h-4" />Sync Now</button>
                </div>
              </div>
            </>
          )}
          {type === 'slack' && !integration.connected && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4"><MessageCircle className="w-8 h-8 text-muted-foreground" /></div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Connect Slack</h3>
              <p className="text-sm text-muted-foreground mb-6">Get notifications and updates directly in your Slack workspace</p>
              <button className="airbnb-btn-pill">Connect Slack</button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Integrations = () => {
  const [activeDrawer, setActiveDrawer] = useState<'github' | 'jira' | 'slack' | null>(null);
  const { data: integrations, isLoading, isError, refetch } = useIntegrationStatuses();
  const queryClient = useQueryClient();

  // Detect GitHub OAuth redirect and store the token
  const handleGitHubOAuthRedirect = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.provider_token) return;

    // Check if we already stored this token
    const currentStatus = integrations?.github;
    if (currentStatus?.connected) return;

    // Fetch GitHub username
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${session.provider_token}`, Accept: 'application/vnd.github.v3+json' },
      });
      if (!res.ok) return;
      const ghUser = await res.json() as { login: string; public_repos: number };

      await storeGitHubConnection(session.provider_token, ghUser.login, ghUser.public_repos);
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    } catch {
      // Silently fail — user can retry
    }
  }, [integrations?.github, queryClient]);

  useEffect(() => {
    handleGitHubOAuthRedirect();
  }, [handleGitHubOAuthRedirect]);

  // Detect Jira OAuth redirect
  const handleJiraOAuthRedirect = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (!code || state !== 'jira') return;

    // Clear query string to prevent double-processing
    window.history.replaceState({}, '', '/integrations');

    try {
      const { data, error } = await supabase.functions.invoke('jira-oauth', {
        body: { action: 'exchange', code, redirect_uri: `${window.location.origin}/integrations` },
      });
      if (error || !data?.access_token) return;

      // Fetch project count
      const projects = await fetchJiraProjects(data.cloud_id, data.access_token, data.refresh_token);

      await storeJiraConnection({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        cloudId: data.cloud_id,
        siteName: data.site_name,
        siteUrl: data.site_url,
        projectCount: projects.length,
      });

      // Trigger initial sync
      await syncJiraTickets();

      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['chart'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    } catch {
      // Silently fail — user can retry
    }
  }, [queryClient]);

  useEffect(() => {
    handleJiraOAuthRedirect();
  }, [handleJiraOAuthRedirect]);

  const handleConnectGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo read:org read:user',
        redirectTo: `${window.location.origin}/integrations`,
      },
    });
  };

  const handleConnectJira = () => {
    const clientId = import.meta.env.VITE_JIRA_CLIENT_ID;
    if (!clientId) return;

    const params = new URLSearchParams({
      audience: 'api.atlassian.com',
      client_id: clientId,
      scope: 'read:jira-work write:jira-work offline_access',
      redirect_uri: `${window.location.origin}/integrations`,
      state: 'jira',
      response_type: 'code',
      prompt: 'consent',
    });
    window.location.href = `https://auth.atlassian.com/authorize?${params}`;
  };

  const handleDisconnect = async (type: 'github' | 'jira' | 'slack') => {
    await disconnectIntegration(type);
    queryClient.invalidateQueries({ queryKey: ['integrations'] });
    setActiveDrawer(null);
  };

  const handleConnect = (id: 'github' | 'jira' | 'slack') => {
    if (id === 'github') {
      handleConnectGitHub();
    } else if (id === 'jira') {
      handleConnectJira();
    } else {
      setActiveDrawer(id);
    }
  };

  const integrationCards = [
    { id: 'github' as const, name: 'GitHub', description: 'Connect repositories to analyze code and pull requests', icon: Github, iconBg: 'bg-gray-900 dark:bg-gray-100', iconColor: 'text-white dark:text-gray-900', connected: integrations?.github.connected ?? false, info: integrations?.github.connected ? `Connected as @${integrations.github.username} · Syncing ${integrations.github.repos} repositories` : null },
    { id: 'jira' as const, name: 'Jira', description: 'Connect projects to track tickets and assignments', icon: Trello, iconBg: 'bg-blue-600', iconColor: 'text-white', connected: integrations?.jira.connected ?? false, info: integrations?.jira.connected ? `Connected to ${integrations.jira.site} · ${integrations.jira.projects} projects` : null },
    { id: 'slack' as const, name: 'Slack', description: 'Get notifications and updates in Slack channels', icon: MessageCircle, iconBg: 'bg-purple-600', iconColor: 'text-white', connected: integrations?.slack.connected ?? false, info: null },
  ];

  return (
    <div className="px-4 py-6 md:px-12 md:py-10">
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Integrations</h1>
        <p className="text-base text-muted-foreground">Connect your tools to unlock the full power of AM PM</p>
      </div>

      {isError ? (
        <ErrorState title="Couldn't load integrations" message="There was a problem loading your integrations. Please try again." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <IntegrationCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrationCards.map((integration) => (
            <div key={integration.id} className="airbnb-card p-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${integration.iconBg}`}>
                <integration.icon className={`w-7 h-7 ${integration.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{integration.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{integration.description}</p>
              {integration.connected ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950 text-airbnb-success"><Check className="w-3 h-3" />Connected</span>
                  </div>
                  {integration.info && (<p className="text-xs text-muted-foreground mb-5">{integration.info}</p>)}
                  <button onClick={() => setActiveDrawer(integration.id)} className="airbnb-btn-secondary flex items-center gap-2 py-2 px-4 rounded-full text-sm"><Settings className="w-4 h-4" />Manage</button>
                </>
              ) : (
                <button onClick={() => handleConnect(integration.id)} className="airbnb-btn-pill flex items-center gap-2 py-2.5 px-5 text-sm"><ExternalLink className="w-4 h-4" />Connect</button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[{ name: 'Linear', description: 'Track issues and projects' }, { name: 'Notion', description: 'Sync with your Notion workspace' }, { name: 'Figma', description: 'View designs and prototypes' }].map((item) => (
            <div key={item.name} className="airbnb-card-static p-6 opacity-60">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-5"><span className="text-lg text-muted-foreground">?</span></div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <span className="airbnb-badge mt-5">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeDrawer && (<IntegrationDrawer type={activeDrawer} onClose={() => setActiveDrawer(null)} onDisconnect={handleDisconnect} />)}
      </AnimatePresence>
    </div>
  );
};

export default Integrations;
