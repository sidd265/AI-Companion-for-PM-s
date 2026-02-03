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

// Mock sprint burndown data - 2 week sprint
const sprintData = [
  { day: 'Day 1', remaining: 32, ideal: 32, completed: 0 },
  { day: 'Day 2', remaining: 30, ideal: 29.1, completed: 2 },
  { day: 'Day 3', remaining: 27, ideal: 26.2, completed: 5 },
  { day: 'Day 4', remaining: 25, ideal: 23.3, completed: 7 },
  { day: 'Day 5', remaining: 22, ideal: 20.4, completed: 10 },
  { day: 'Day 6', remaining: 20, ideal: 17.5, completed: 12 },
  { day: 'Day 7', remaining: 18, ideal: 14.5, completed: 14 },
  { day: 'Day 8', remaining: 16, ideal: 11.6, completed: 16 },
  { day: 'Day 9', remaining: 14, ideal: 8.7, completed: 18 },
  { day: 'Day 10', remaining: null, ideal: 5.8, completed: null }, // Future
  { day: 'Day 11', remaining: null, ideal: 2.9, completed: null },
  { day: 'Day 12', remaining: null, ideal: 0, completed: null },
];

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

const SprintBurndownChart = () => {
  // Calculate sprint progress
  const currentDay = 9;
  const totalPoints = 32;
  const completedPoints = 18;
  const percentComplete = Math.round((completedPoints / totalPoints) * 100);

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
            <div className="text-[20px] font-bold text-notion-text">{currentDay}/12</div>
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
