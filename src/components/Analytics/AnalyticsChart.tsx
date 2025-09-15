import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalyticsChartProps {
  data: Array<{ date: string; views: number; [key: string]: any }>;
  type?: 'line' | 'bar';
  height?: number;
  color?: string;
  title?: string;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  type = 'line',
  height = 300,
  color = '#2563eb',
  title
}) => {
  const Chart = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <Chart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <DataComponent
            {...(type === 'line' ? {
              type: 'monotone',
              dataKey: 'views',
              stroke: color,
              strokeWidth: 2,
              dot: { fill: color, strokeWidth: 2, r: 4 },
              activeDot: { r: 6, stroke: color, strokeWidth: 2 }
            } : {
              dataKey: 'views',
              fill: color,
              radius: [4, 4, 0, 0]
            })}
          />
        </Chart>
      </ResponsiveContainer>
    </div>
  );
};