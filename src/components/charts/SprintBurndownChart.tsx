import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { useSprintBurndown } from '@/hooks/useChartData';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number | null; color: string; dataKey: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="notion-card p-[12px] shadow-lg">
        <p className="text-[13px] font-medium text-notion-text mb-[8px]">{label}</p>
        {payload.map((entry, index) => (
          entry.value !== null && (
            <div key={index} className="flex items-center gap-[8px] text-[12px]">
              <div 
                className="w-[8px] h-[8px] rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-notion-text-secondary">{entry.name}:</span>
              <span className="font-medium text-notion-text">
                {entry.dataKey === 'ideal' ? entry.value.toFixed(1) : entry.value} pts
              </span>
            </div>
          )
        ))}
      </div>
    );
  }
  return null;
};

interface SprintBurndownChartProps {
  compact?: boolean;
}

const SprintBurndownChart = ({ compact = false }: SprintBurndownChartProps) => {
  const { data: burndown, isLoading } = useSprintBurndown();
  const sprintData = burndown?.data ?? [];
  const { currentDay = 9, totalDays = 12, totalPoints = 32, completedPoints = 18 } = burndown?.meta ?? {};
  const percentComplete = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  if (isLoading) return <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Loading...</div>;

  if (compact) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex items-center justify-between mb-[8px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[16px] font-bold text-notion-text">{percentComplete}%</span>
            <span className="text-[10px] text-notion-text-tertiary">Day {currentDay}/{totalDays}</span>
          </div>
          <div className={`px-[6px] py-[2px] rounded-[3px] text-[10px] font-medium ${
            percentComplete >= 75 ? 'bg-notion-green/10 text-notion-green' : 
            percentComplete >= 50 ? 'bg-notion-orange/10 text-notion-orange' : 
            'bg-notion-red/10 text-notion-red'
          }`}>
            {percentComplete >= 75 ? 'On Track' : percentComplete >= 50 ? 'At Risk' : 'Behind'}
          </div>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sprintData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 17% 91%)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'hsl(37 4% 46%)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'hsl(37 4% 46%)' }} domain={[0, 35]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ideal" stroke="hsl(37 4% 46%)" strokeWidth={1} strokeDasharray="3 3" dot={false} connectNulls />
              <Line type="monotone" dataKey="remaining" stroke="hsl(210 79% 51%)" strokeWidth={2} dot={{ fill: 'hsl(210 79% 51%)', strokeWidth: 0, r: 2 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sprint Stats Header */}
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex items-center gap-[16px]">
          <div>
            <span className="text-[11px] text-notion-text-secondary uppercase tracking-wide">Sprint Progress</span>
            <div className="text-[20px] font-bold text-notion-text">{percentComplete}%</div>
          </div>
          <div className="h-[32px] w-[1px] bg-notion-border" />
          <div>
            <span className="text-[11px] text-notion-text-secondary uppercase tracking-wide">Day</span>
            <div className="text-[20px] font-bold text-notion-text">{currentDay}/{totalDays}</div>
          </div>
          <div className="h-[32px] w-[1px] bg-notion-border" />
          <div>
            <span className="text-[11px] text-notion-text-secondary uppercase tracking-wide">Remaining</span>
            <div className="text-[20px] font-bold text-notion-text">{totalPoints - completedPoints} pts</div>
          </div>
        </div>
        <div className={`px-[10px] py-[4px] rounded-[4px] text-[12px] font-medium ${
          percentComplete >= 75 ? 'bg-notion-green/10 text-notion-green' : 
          percentComplete >= 50 ? 'bg-notion-orange/10 text-notion-orange' : 
          'bg-notion-red/10 text-notion-red'
        }`}>
          {percentComplete >= 75 ? 'On Track' : percentComplete >= 50 ? 'At Risk' : 'Behind'}
        </div>
      </div>

      {/* Burndown Chart */}
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sprintData}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
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
              domain={[0, 35]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px' }}
            />
            {/* Reference line for current day */}
            <ReferenceLine 
              x={`Day ${currentDay}`} 
              stroke="hsl(37 4% 46%)" 
              strokeDasharray="5 5"
              label={{ value: 'Today', position: 'top', fontSize: 10, fill: 'hsl(37 4% 46%)' }}
            />
            {/* Ideal burndown line */}
            <Line 
              type="monotone" 
              dataKey="ideal" 
              name="Ideal"
              stroke="hsl(37 4% 46%)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
            {/* Actual remaining line */}
            <Line 
              type="monotone" 
              dataKey="remaining" 
              name="Remaining"
              stroke="hsl(210 79% 51%)" 
              strokeWidth={3}
              dot={{ fill: 'hsl(210 79% 51%)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SprintBurndownChart;
