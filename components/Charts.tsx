
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { KPIStats } from '../types.ts';

interface ChartsProps {
  stats: KPIStats;
  onStatClick?: (filter: 'all' | 'repair' | 'optimal') => void;
}

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">{label || payload[0].name}</p>
        <p className="text-white text-xl font-black">{payload[0].value} <span className="text-xs font-bold text-slate-600 uppercase">UNIDADES</span></p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#ffffff" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-[11px] font-black"
    >
      {`${value}`}
    </text>
  );
};

const Charts: React.FC<ChartsProps> = ({ stats, onStatClick }) => {
  const estadoData = [
    { name: 'BUENO', count: stats.estados.find(e => e.name === 'BUENO')?.count || 0, color: '#10b981' },
    { name: 'REGULAR', count: stats.estados.find(e => e.name === 'REGULAR')?.count || 0, color: '#f59e0b' },
    { name: 'MALO', count: stats.estados.find(e => e.name === 'MALO')?.count || 0, color: '#f43f5e' }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2.5rem] shadow-2xl">
        <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3 tracking-tight uppercase italic">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />Familias e Instrumentos
        </h3>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={stats.categorias} 
                cx="50%" 
                cy="45%" 
                innerRadius={80} 
                outerRadius={110} 
                paddingAngle={6} 
                dataKey="value" 
                stroke="transparent"
                label={renderCustomizedLabel}
                labelLine={{ stroke: '#64748b', strokeWidth: 1.5 }}
              >
                {stats.categorias.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2.5rem] shadow-2xl">
        <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3 tracking-tight uppercase italic">
          <div className="w-1.5 h-6 bg-rose-500 rounded-full" />Estado del Inventario
        </h3>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={estadoData} layout="vertical" margin={{ left: 20, right: 40 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={130} 
                axisLine={false} 
                tickLine={false} 
                // Removed textTransform as it's not a valid SVG text property for recharts
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={40}>
                {estadoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
