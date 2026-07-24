import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface FleetData {
  name: string
  value: number
}

interface FleetDistributionProps {
  data: FleetData[]
}

const COLORS = ['#FF6B00', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export function FleetDistribution({ data }: FleetDistributionProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0F1115', borderColor: '#24272E', color: '#F2F2F2', fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase' }}
            itemStyle={{ color: '#FF6B00' }}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="square"
            formatter={(value) => <span className="text-[10px] font-mono uppercase text-[#A0A0A0] ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
