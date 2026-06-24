'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  LineChart, Line, AreaChart, Area
} from 'recharts';

// Dark-mode aware color palettes
const LIGHT_COLORS = ['#3b82f6', '#2dd4bf', '#a78bfa', '#fb923c', '#4ade80', '#f472b6'];
const DARK_COLORS  = ['#60a5fa', '#34d399', '#c4b5fd', '#fdba74', '#86efac', '#f9a8d4'];

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: isDark ? '#1e1e1e' : '#fff',
        border: `1px solid ${isDark ? '#333' : '#e2e8f0'}`,
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.1)',
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#666' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 900, color: isDark ? '#e0e0e0' : '#0f172a' }}>
          {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function SpendByCategoryChart({ data }: { data: any[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke={isDark ? '#1c1c1c' : '#fff'}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.slice(0, 4).map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-[10px] font-semibold uppercase truncate max-w-[100px]" style={{ color: isDark ? '#888' : '#64748b' }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MonthlySpendChart({ data }: { data: any[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const lineColor   = isDark ? '#60a5fa' : '#3b82f6';
  const gridColor   = isDark ? '#2a2a2a' : '#f1f5f9';
  const tickColor   = isDark ? '#666'    : '#94a3b8';
  const gradStart   = isDark ? 'rgba(96,165,250,0.25)'  : 'rgba(59,130,246,0.12)';
  const gradEnd     = isDark ? 'rgba(96,165,250,0)'     : 'rgba(59,130,246,0)';

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValueDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={lineColor} stopOpacity={isDark ? 0.25 : 0.12} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: tickColor, fontWeight: 600 }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={lineColor}
            strokeWidth={3}
            dot={{ r: 4, fill: lineColor, strokeWidth: 2, stroke: isDark ? '#1c1c1c' : '#fff' }}
            activeDot={{ r: 6, fill: lineColor, strokeWidth: 2, stroke: isDark ? '#1c1c1c' : '#fff' }}
            fillOpacity={1} 
            fill="url(#colorValueDark)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopSuppliersChart({ data }: { data: any[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const barColor  = isDark ? '#60a5fa' : '#3b82f6';
  const tickColor = isDark ? '#666'    : '#94a3b8';

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: tickColor, fontWeight: 600 }}
            width={120}
          />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <Bar 
            dataKey="value" 
            fill={barColor}
            radius={[0, 8, 8, 0]} 
            barSize={16}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
