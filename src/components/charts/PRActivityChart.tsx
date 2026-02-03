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

// Mock data for weekly PR activity
const prActivityData = [
  { day: 'Mon', opened: 4, merged: 2 },
  { day: 'Tue', opened: 6, merged: 5 },
  { day: 'Wed', opened: 3, merged: 4 },
  { day: 'Thu', opened: 7, merged: 3 },
  { day: 'Fri', opened: 5, merged: 6 },
  { day: 'Sat', opened: 1, merged: 2 },
  { day: 'Sun', opened: 2, merged: 1 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="notion-card p-[12px] shadow-lg">
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

const PRActivityChart = () => {
  // Calculate weekly totals
  const totalOpened = prActivityData.reduce((sum, day) => sum + day.opened, 0);
  const totalMerged = prActivityData.reduce((sum, day) => sum + day.merged, 0);
  const mergeRate = Math.round((totalMerged / totalOpened) * 100);

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
        <div className="text-[12px] text-notion-text-secondary">
          Last 7 days
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={prActivityData}
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
