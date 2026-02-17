
import React from 'react';
import { User, ClipboardList, TrendingUp } from 'lucide-react';
import { KPIStats } from '../types.ts';

interface MonitorStatsProps {
  stats: KPIStats;
  onMonitorClick?: (name: string) => void;
}

const MonitorStats: React.FC<MonitorStatsProps> = ({ stats, onMonitorClick }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
      <div className="flex items-center gap-4 mb-10"><div className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/40" /><h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Monitores Responsables</h3></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.monitores.map((monitor, idx) => (
          <button key={idx} onClick={() => onMonitorClick?.(monitor.name)} className="group relative bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] hover:border-indigo-500/50 transition-all duration-500 text-left overflow-hidden active:scale-95 shadow-xl">
            <div className="flex items-start justify-between mb-6"><div className="p-3 bg-indigo-500/10 border border-indigo-500/10 rounded-2xl group-hover:bg-indigo-500 transition-all duration-500"><User className="w-5 h-5 text-indigo-400 group-hover:text-white" /></div><div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full"><TrendingUp className="w-3 h-3 text-emerald-500" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activo</span></div></div>
            <div className="space-y-1"><h4 className="text-sm font-black text-white uppercase tracking-tight truncate leading-tight">{monitor.name}</h4><p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Monitor Orquesta</p></div>
            <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-between"><div className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-slate-500" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">A CARGO:</span></div><div className="flex items-baseline gap-1"><span className="text-2xl font-black text-white tracking-tighter">{monitor.count}</span><span className="text-[9px] font-black text-slate-600 uppercase">items</span></div></div>
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-0 group-hover:w-full transition-all duration-500" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MonitorStats;
