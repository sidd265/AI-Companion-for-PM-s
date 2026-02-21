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
import { useTicketTrends } from '@/hooks/useChartData';

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

interface TicketTrendChartProps {
  compact?: boolean;
}

const TicketTrendChart = ({ compact = false }: TicketTrendChartProps) => {
  const { data: ticketTrendData = [], isLoading } = useTicketTrends();

  if (isLoading) return <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Loading...</div>;

  return (
    <div className={compact ? "h-full w-full" : "h-[280px] w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={ticketTrendData}
          margin={compact ? { top: 5, right: 5, left: -20, bottom: 0 } : { top: 10, right: 10, left: -20, bottom: 0 }}
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
            tick={{ fontSize: compact ? 9 : 11, fill: 'hsl(37 4% 46%)' }}
            dy={compact ? 5 : 10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: compact ? 9 : 11, fill: 'hsl(37 4% 46%)' }}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} />
          {!compact && (
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px' }}
            />
          )}
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
