import { useState, useEffect, useMemo } from 'react';
import { GitPullRequest, ExternalLink, Search, Filter, GitMerge, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { fetchPullRequests, fetchRepositories, getPRUrl, type PRFilters } from '@/services/github';
import type { GitHubPR, Repository } from '@/data/mockData';
import PRActivityChart from '@/components/charts/PRActivityChart';

const statusIcon = (status: GitHubPR['status']) => {
  switch (status) {
    case 'Open':
      return <GitPullRequest className="w-4 h-4 text-airbnb-success" />;
    case 'Merged':
      return <GitMerge className="w-4 h-4 text-purple-500" />;
    case 'Closed':
      return <XCircle className="w-4 h-4 text-destructive" />;
  }
};

const statusBadgeClass = (status: GitHubPR['status']) => {
  switch (status) {
    case 'Open':
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    case 'Merged':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    case 'Closed':
      return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
  }
};

const PullRequests = () => {
  const [prs, setPrs] = useState<GitHubPR[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [filters, setFilters] = useState<PRFilters>({ status: 'all' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRepositories().then(setRepos);
  }, []);

  useEffect(() => {
    fetchPullRequests({ ...filters, search }).then(setPrs);
  }, [filters, search]);

  const summary = useMemo(() => {
    const open = prs.filter((p) => p.status === 'Open').length;
    const merged = prs.filter((p) => p.status === 'Merged').length;
    const closed = prs.filter((p) => p.status === 'Closed').length;
    return { open, merged, closed, total: prs.length };
  }, [prs]);

  return (
    <div className="px-4 py-4 md:px-8 md:py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Pull Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and manage pull requests across all repositories
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[
          { label: 'Open', count: summary.open, color: 'text-airbnb-success' },
          { label: 'Merged', count: summary.merged, color: 'text-purple-500' },
          { label: 'Closed', count: summary.closed, color: 'text-destructive' },
        ].map((s) => (
          <div key={s.label} className="airbnb-card p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="airbnb-card p-5">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          PR Activity This Week
        </div>
        <PRActivityChart />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search PRs by title, number, or repo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => setFilters((f) => ({ ...f, status: v as PRFilters['status'] }))}
        >
          <SelectTrigger className="w-[140px]">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Merged">Merged</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.repo || 'all'}
          onValueChange={(v) => setFilters((f) => ({ ...f, repo: v === 'all' ? undefined : v }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Repository" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Repos</SelectItem>
            {repos.map((r) => (
              <SelectItem key={r.id} value={r.name}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* PR list */}
      <div className="space-y-2">
        {prs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No pull requests match the current filters.
          </div>
        )}
        {prs.map((pr) => (
          <a
            key={pr.id}
            href={getPRUrl(pr)}
            target="_blank"
            rel="noopener noreferrer"
            className="airbnb-card p-4 flex items-start gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="mt-0.5">{statusIcon(pr.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {pr.title}
                </span>
                <Badge variant="outline" className={`text-[10px] ${statusBadgeClass(pr.status)}`}>
                  {pr.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span>#{pr.number}</span>
                <span className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded-full text-[8px] text-white flex items-center justify-center font-medium"
                    style={{ backgroundColor: pr.author.avatarColor }}
                  >
                    {pr.author.initials}
                  </div>
                  {pr.author.name}
                </span>
                <span>{pr.repo}</span>
                <span className="text-airbnb-success">+{pr.additions}</span>
                <span className="text-destructive">-{pr.deletions}</span>
              </div>
              {pr.reviewers.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-muted-foreground">Reviewers:</span>
                  <div className="flex -space-x-1">
                    {pr.reviewers.map((r) => (
                      <div
                        key={r.id}
                        className="w-5 h-5 rounded-full text-[7px] text-white border-2 border-card flex items-center justify-center font-medium"
                        style={{ backgroundColor: r.avatarColor }}
                        title={r.name}
                      >
                        {r.initials}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default PullRequests;
