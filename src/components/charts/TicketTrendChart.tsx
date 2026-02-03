import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

// Mock data for ticket trends over the past 14 days
const ticketTrendData = [
  { date: 'Jan 20', created: 5, completed: 3, inProgress: 8 },
  { date: 'Jan 21', created: 3, completed: 4, inProgress: 7 },
  { date: 'Jan 22', created: 7, completed: 2, inProgress: 12 },
  { date: 'Jan 23', created: 4, completed: 6, inProgress: 10 },
  { date: 'Jan 24', created: 2, completed: 5, inProgress: 7 },
  { date: 'Jan 25', created: 6, completed: 3, inProgress: 10 },
  { date: 'Jan 26', created: 3, completed: 4, inProgress: 9 },
  { date: 'Jan 27', created: 8, completed: 5, inProgress: 12 },
  { date: 'Jan 28', created: 4, completed: 7, inProgress: 9 },
  { date: 'Jan 29', created: 5, completed: 4, inProgress: 10 },
  { date: 'Jan 30', created: 6, completed: 6, inProgress: 10 },
  { date: 'Jan 31', created: 3, completed: 5, inProgress: 8 },
  { date: 'Feb 1', created: 7, completed: 4, inProgress: 11 },
  { date: 'Feb 2', created: 4, completed: 3, inProgress: 12 },
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
            <span className="font-medium text-notion-text">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const TicketTrendChart = () => {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={ticketTrendData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(210 79% 51%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(210 79% 51%)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(169 78% 27%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(169 78% 27%)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(28 92% 45%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(28 92% 45%)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 17% 91%)" vertical={false} />
          <XAxis 
            dataKey="date" 
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
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Area 
            type="monotone" 
            dataKey="inProgress" 
            name="In Progress"
            stroke="hsl(28 92% 45%)" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorInProgress)" 
          />
          <Area 
            type="monotone" 
            dataKey="created" 
            name="Created"
            stroke="hsl(210 79% 51%)" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCreated)" 
          />
          <Area 
            type="monotone" 
            dataKey="completed" 
            name="Completed"
            stroke="hsl(169 78% 27%)" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCompleted)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketTrendChart;
