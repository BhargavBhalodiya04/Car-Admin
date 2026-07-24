import React from 'react'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  TooltipProps 
} from 'recharts'

interface RevenueData {
  month: string
  amount: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#181A1F] border border-[#24272E] p-3 shadow-xl font-mono text-[10px] uppercase">
        <p className="font-bold text-[#FF6B00] mb-1">{label}</p>
        <p className="text-[#A0A0A0]">Revenue: <span className="text-[#F2F2F2]">${payload[0].value?.toLocaleString()}</span></p>
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#A0A0A0', fontSize: 10, fontFamily: 'monospace' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#A0A0A0', fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FF6B00', strokeWidth: 1 }} />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#FF6B00" 
            fillOpacity={1} 
            fill="url(#colorAmount)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
