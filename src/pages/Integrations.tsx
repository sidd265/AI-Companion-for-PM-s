import { useState } from 'react';
import {
  Github, Trello, MessageCircle, Check, X, Settings,
  RefreshCw, ExternalLink, Eye, EyeOff, Loader2, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  useIntegrationStatuses,
  useIntegrationRepositories,
  useSaveGitHubCredentials,
  useSaveJiraCredentials,
  useDisconnectIntegration,
  useSyncIntegration,
} from '@/hooks/useIntegrations';
import { IntegrationCardSkeleton } from '@/components/skeletons/PageSkeletons';
import ErrorState from '@/components/ErrorState';

// ─────────────────────────────────────────────────────────────────────────────
// Small shared form components
// ─────────────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-foreground mb-1">{children}</label>;
}

function TextInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
    />
  );
}

function SecretInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{msg}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub drawer content
// ─────────────────────────────────────────────────────────────────────────────

function GitHubDrawerContent({ onClose }: { onClose: () => void }) {
  const { data: integrations }  = useIntegrationStatuses();
  const { data: repositories }  = useIntegrationRepositories();
  const saveGitHub  = useSaveGitHubCredentials();
  const disconnect  = useDisconnectIntegration();
  const sync        = useSyncIntegration();
  const isConnected = integrations?.github.connected ?? false;

  const [token, setToken]       = useState('');
  const [username, setUsername] = useState('');
  const [org, setOrg]           = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const handleConnect = async () => {
    const e: Record<string, string> = {};
    if (!token.trim()) e.token = 'Personal Access Token is required';
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});

    const result = await saveGitHub.mutateAsync({
      token: token.trim(),
      username: username.trim() || undefined,
      org: org.trim() || undefined,
    });

    if (result.success) {
      toast.success(`GitHub connected as @${result.username ?? 'user'}`);
      onClose();
    } else {
      toast.error(result.error ?? 'Connection failed');
    }
  };

  const handleDisconnect = async () => {
    await disconnect.mutateAsync('github');
    toast.success('GitHub disconnected');
    onClose();
  };

  if (isConnected && integrations) {
    return (
      <>
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Connected Account</h3>
          <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center">
                <Github className="w-6 h-6 text-background" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  @{integrations.github.username ?? 'connected'}
                  {integrations.github.org && (
                    <span className="text-muted-foreground"> · {integrations.github.org}</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {integrations.github.lastSync
                    ? `Last synced ${integrations.github.lastSync}`
                    : 'Connected'}
                </div>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnect.isPending}
              className="text-sm text-destructive hover:underline font-medium disabled:opacity-50"
            >
              {disconnect.isPending ? 'Disconnecting…' : 'Disconnect'}
            </button>
          </div>
        </div>

        {repositories && repositories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-3">
              Repositories ({repositories.length})
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
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
        )}

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Sync</h3>
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div>
              <div className="text-sm text-foreground">Last Synced</div>
              <div className="text-xs text-muted-foreground">
                {integrations.github.lastSync ?? 'Never'}
              </div>
            </div>
            <button
              onClick={() => sync.mutate('github')}
              disabled={sync.isPending}
              className="airbnb-btn-secondary flex items-center gap-2 py-2 px-4 rounded-full"
            >
              <RefreshCw className={`w-4 h-4 ${sync.isPending ? 'animate-spin' : ''}`} />
              {sync.isPending ? 'Syncing…' : 'Sync Now'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-5">
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
        Connect GitHub so the AI can search your repositories, pull requests,
        issues, and commits to give you live engineering insights.
      </div>

      <div>
        <Label>Personal Access Token *</Label>
        <SecretInput
          value={token}
          onChange={setToken}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          disabled={saveGitHub.isPending}
        />
        <FieldError msg={errors.token} />
        <p className="text-xs text-muted-foreground mt-1.5">
          Generate at{' '}
          <a
            href="https://github.com/settings/tokens/new?scopes=repo,read:org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            github.com/settings/tokens
          </a>{' '}
          with <code className="font-mono text-[11px]">repo</code> and{' '}
          <code className="font-mono text-[11px]">read:org</code> scopes.
        </p>
      </div>

      <div>
        <Label>GitHub Username (optional)</Label>
        <TextInput
          value={username}
          onChange={setUsername}
          placeholder="your-github-username"
          disabled={saveGitHub.isPending}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Used to scope PR and repo searches to your account.
        </p>
      </div>

      <div>
        <Label>Organization Slug (optional)</Label>
        <TextInput
          value={org}
          onChange={setOrg}
          placeholder="your-org-name"
          disabled={saveGitHub.isPending}
        />
        <p className="text-xs text-muted-foreground mt-1">
          If set, repo listings will prefer your org's repositories.
        </p>
      </div>

      <button
        onClick={handleConnect}
        disabled={saveGitHub.isPending || !token.trim()}
        className="airbnb-btn-pill flex items-center gap-2 py-2.5 px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saveGitHub.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" />Connecting…</>
          : <><Github className="w-4 h-4" />Connect GitHub</>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Jira drawer content
// ─────────────────────────────────────────────────────────────────────────────

function JiraDrawerContent({ onClose }: { onClose: () => void }) {
  const { data: integrations } = useIntegrationStatuses();
  const saveJira    = useSaveJiraCredentials();
  const disconnect  = useDisconnectIntegration();
  const sync        = useSyncIntegration();
  const isConnected = integrations?.jira.connected ?? false;

  const [baseUrl, setBaseUrl]   = useState('');
  const [email, setEmail]       = useState('');
  const [apiToken, setApiToken] = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const handleConnect = async () => {
    const e: Record<string, string> = {};
    if (!baseUrl.trim())  e.baseUrl  = 'Jira base URL is required';
    if (!email.trim())    e.email    = 'Email address is required';
    if (!apiToken.trim()) e.apiToken = 'API token is required';
    if (baseUrl.trim() && !baseUrl.trim().startsWith('http')) {
      e.baseUrl = 'URL must start with https://';
    }
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});

    const result = await saveJira.mutateAsync({
      baseUrl: baseUrl.trim(),
      email: email.trim(),
      apiToken: apiToken.trim(),
    });

    if (result.success) {
      toast.success(`Jira connected to ${result.site}`);
      onClose();
    } else {
      toast.error(result.error ?? 'Connection failed');
    }
  };

  const handleDisconnect = async () => {
    await disconnect.mutateAsync('jira');
    toast.success('Jira disconnected');
    onClose();
  };

  if (isConnected && integrations) {
    return (
      <>
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Connected Site</h3>
          <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Trello className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {integrations.jira.site ?? 'Jira'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {integrations.jira.lastSync
                    ? `Last synced ${integrations.jira.lastSync}`
                    : 'Connected'}
                </div>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnect.isPending}
              className="text-sm text-destructive hover:underline font-medium disabled:opacity-50"
            >
              {disconnect.isPending ? 'Disconnecting…' : 'Disconnect'}
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Sync</h3>
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div>
              <div className="text-sm text-foreground">Last Synced</div>
              <div className="text-xs text-muted-foreground">
                {integrations.jira.lastSync ?? 'Never'}
              </div>
            </div>
            <button
              onClick={() => sync.mutate('jira')}
              disabled={sync.isPending}
              className="airbnb-btn-secondary flex items-center gap-2 py-2 px-4 rounded-full"
            >
              <RefreshCw className={`w-4 h-4 ${sync.isPending ? 'animate-spin' : ''}`} />
              {sync.isPending ? 'Syncing…' : 'Sync Now'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-5">
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
        Connect Jira so the AI can search your tickets, active sprint, blocked
        items, and project status in real time during chat.
      </div>

      <div>
        <Label>Jira Base URL *</Label>
        <TextInput
          value={baseUrl}
          onChange={setBaseUrl}
          placeholder="https://yourcompany.atlassian.net"
          disabled={saveJira.isPending}
        />
        <FieldError msg={errors.baseUrl} />
      </div>

      <div>
        <Label>Email Address *</Label>
        <TextInput
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          disabled={saveJira.isPending}
        />
        <FieldError msg={errors.email} />
      </div>

      <div>
        <Label>API Token *</Label>
        <SecretInput
          value={apiToken}
          onChange={setApiToken}
          placeholder="ATATT3xxxxxxxxxxx"
          disabled={saveJira.isPending}
        />
        <FieldError msg={errors.apiToken} />
        <p className="text-xs text-muted-foreground mt-1.5">
          Generate at{' '}
          <a
            href="https://id.atlassian.com/manage-profile/security/api-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            id.atlassian.com → Security → API tokens
          </a>
        </p>
      </div>

      <button
        onClick={handleConnect}
        disabled={saveJira.isPending || !baseUrl.trim() || !email.trim() || !apiToken.trim()}
        className="airbnb-btn-pill flex items-center gap-2 py-2.5 px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saveJira.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" />Connecting…</>
          : <><Trello className="w-4 h-4" />Connect Jira</>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Slack placeholder
// ─────────────────────────────────────────────────────────────────────────────

function SlackDrawerContent() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
        <MessageCircle className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Connect Slack</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Get notifications and updates directly in your Slack workspace.
        Slack integration is coming soon.
      </p>
      <span className="airbnb-badge">Coming Soon</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawer wrapper
// ─────────────────────────────────────────────────────────────────────────────

interface IntegrationDrawerProps {
  type: 'github' | 'jira' | 'slack';
  onClose: () => void;
}

const IntegrationDrawer = ({ type, onClose }: IntegrationDrawerProps) => {
  const titles = {
    github: 'GitHub Settings',
    jira:   'Jira Settings',
    slack:  'Slack Settings',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-card border-l border-border shadow-2xl sm:rounded-l-3xl overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">{titles[type]}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {type === 'github' && <GitHubDrawerContent onClose={onClose} />}
          {type === 'jira'   && <JiraDrawerContent   onClose={onClose} />}
          {type === 'slack'  && <SlackDrawerContent />}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

const Integrations = () => {
  const [activeDrawer, setActiveDrawer] = useState<'github' | 'jira' | 'slack' | null>(null);
  const { data: integrations, isLoading, isError, refetch } = useIntegrationStatuses();

  const integrationCards = [
    {
      id: 'github' as const,
      name: 'GitHub',
      description: 'Connect repositories so the AI can search your code, PRs, issues, and commits in real time.',
      icon: Github,
      iconBg: 'bg-gray-900 dark:bg-gray-100',
      iconColor: 'text-white dark:text-gray-900',
      connected: integrations?.github.connected ?? false,
      info: integrations?.github.connected
        ? `@${integrations.github.username ?? 'user'}${integrations.github.org ? ` · org: ${integrations.github.org}` : ''}`
        : null,
    },
    {
      id: 'jira' as const,
      name: 'Jira',
      description: 'Connect Jira so the AI can search your tickets, active sprint, and project status.',
      icon: Trello,
      iconBg: 'bg-blue-600',
      iconColor: 'text-white',
      connected: integrations?.jira.connected ?? false,
      info: integrations?.jira.connected
        ? `${integrations.jira.site}${integrations.jira.projects != null ? ` · ${integrations.jira.projects} projects` : ''}`
        : null,
    },
    {
      id: 'slack' as const,
      name: 'Slack',
      description: 'Get notifications and updates in Slack channels.',
      icon: MessageCircle,
      iconBg: 'bg-purple-600',
      iconColor: 'text-white',
      connected: integrations?.slack.connected ?? false,
      info: null,
    },
  ];

  return (
    <div className="px-4 py-6 md:px-12 md:py-10">
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Integrations</h1>
        <p className="text-base text-muted-foreground">
          Connect your tools to give the AI live access to your repositories and tickets.
        </p>
      </div>

      {isError ? (
        <ErrorState
          title="Couldn't load integrations"
          message="There was a problem loading your integrations. Please try again."
          onRetry={() => refetch()}
        />
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
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {integration.description}
              </p>
              {integration.connected ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950 text-airbnb-success">
                      <Check className="w-3 h-3" />Connected
                    </span>
                  </div>
                  {integration.info && (
                    <p className="text-xs text-muted-foreground mb-5">{integration.info}</p>
                  )}
                  <button
                    onClick={() => setActiveDrawer(integration.id)}
                    className="airbnb-btn-secondary flex items-center gap-2 py-2 px-4 rounded-full text-sm"
                  >
                    <Settings className="w-4 h-4" />Manage
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setActiveDrawer(integration.id)}
                  className="airbnb-btn-pill flex items-center gap-2 py-2.5 px-5 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />Connect
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Coming Soon
        </h2>
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
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <span className="airbnb-badge mt-5">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeDrawer && (
          <IntegrationDrawer type={activeDrawer} onClose={() => setActiveDrawer(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Integrations;
