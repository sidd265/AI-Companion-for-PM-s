import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchRepositories } from '@/services/github';
import type { Repository } from '@/data/mockData';
import { usePRActivity } from '@/hooks/useChartData';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="notion-card p-[12px] shadow-lg z-50">
        <p className="text-[13px] font-medium text-notion-text mb-[8px]">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-[8px] text-[12px]">
            <div 
              className="w-[8px] h-[8px] rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-notion-text-secondary capitalize">{entry.name}:</span>
            <span className="font-medium text-notion-text">{entry.value} PRs</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface PRActivityChartProps {
  compact?: boolean;
}

const PRActivityChart = ({ compact = false }: PRActivityChartProps) => {
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const { data: chartData = [], isLoading } = usePRActivity(selectedRepo);

  useEffect(() => {
    fetchRepositories().then(setRepositories);
  }, []);

  // Calculate weekly totals
  const totalOpened = chartData.reduce((sum, day) => sum + day.opened, 0);
  const totalMerged = chartData.reduce((sum, day) => sum + day.merged, 0);
  const mergeRate = totalOpened > 0 ? Math.round((totalMerged / totalOpened) * 100) : 0;

  if (isLoading) return <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Loading...</div>;

  if (compact) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex items-center justify-between mb-[8px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[10px] text-notion-blue font-medium">{totalOpened} opened</span>
            <span className="text-[10px] text-notion-green font-medium">{totalMerged} merged</span>
          </div>
          <span className="text-[10px] text-notion-text-tertiary">{mergeRate}% rate</span>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 17% 91%)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'hsl(37 4% 46%)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'hsl(37 4% 46%)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="opened" fill="hsl(210 79% 51%)" radius={[2, 2, 0, 0]} maxBarSize={16} />
              <Bar dataKey="merged" fill="hsl(169 78% 27%)" radius={[2, 2, 0, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Header */}
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex items-center gap-[16px]">
          <div>
            <span className="text-[11px] text-notion-text-secondary uppercase tracking-wide">Opened</span>
            <div className="text-[20px] font-bold text-notion-blue">{totalOpened}</div>
          </div>
          <div className="h-[32px] w-[1px] bg-notion-border" />
          <div>
            <span className="text-[11px] text-notion-text-secondary uppercase tracking-wide">Merged</span>
            <div className="text-[20px] font-bold text-notion-green">{totalMerged}</div>
          </div>
          <div className="h-[32px] w-[1px] bg-notion-border" />
          <div>
            <span className="text-[11px] text-notion-text-secondary uppercase tracking-wide">Merge Rate</span>
            <div className="text-[20px] font-bold text-notion-text">{mergeRate}%</div>
          </div>
        </div>
        
        <div className="flex items-center gap-[12px]">
          {/* Repository Filter Dropdown */}
          <Select value={selectedRepo} onValueChange={setSelectedRepo}>
            <SelectTrigger className="w-[180px] h-[32px] text-[13px] bg-white border-notion-border">
              <SelectValue placeholder="Select repository" />
            </SelectTrigger>
            <SelectContent className="bg-white border-notion-border shadow-lg z-50">
              <SelectItem value="all" className="text-[13px]">
                All Repositories
              </SelectItem>
              {repositories.map((repo) => (
                <SelectItem key={repo.id} value={repo.name} className="text-[13px]">
                  {repo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="text-[12px] text-notion-text-secondary">
            Last 7 days
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 17% 91%)" vertical={false} />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(37 4% 46%)' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(37 4% 46%)' }}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(40 17% 91% / 0.5)' }} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar 
              dataKey="opened" 
              name="Opened"
              fill="hsl(210 79% 51%)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar 
              dataKey="merged" 
              name="Merged"
              fill="hsl(169 78% 27%)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PRActivityChart;
