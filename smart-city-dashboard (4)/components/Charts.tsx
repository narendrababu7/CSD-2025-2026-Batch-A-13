
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ChartDataPoint } from '../types';

interface ChartProps {
  data: ChartDataPoint[];
  color: string;
  title: string;
  type?: 'area' | 'bar';
  unit?: string;
}

export const SmartChart: React.FC<ChartProps> = ({ data, color, title, type = 'area', unit = '' }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      {/* Fixed height container to prevent Recharts width(-1) warning */}
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
              <defs>
                <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 11, fill: '#94a3b8'}} 
                label={{ 
                  value: unit, 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 10, fontWeight: 500 } 
                }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#334155', fontSize: '12px' }}
                cursor={{ stroke: color, strokeWidth: 1 }}
                formatter={(value: number) => [`${value} ${unit}`, 'Value']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#color-${title})`} 
                animationDuration={1500}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
               <YAxis 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{fontSize: 11, fill: '#94a3b8'}} 
                 label={{ 
                  value: unit, 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 10, fontWeight: 500 } 
                 }}
               />
               <Tooltip 
                 cursor={{fill: '#f8fafc'}} 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 formatter={(value: number) => [`${value} ${unit}`, 'Value']}
               />
               <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} animationDuration={1500} barSize={30} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
