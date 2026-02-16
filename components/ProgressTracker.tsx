
import React from 'react';
import { AppStatus } from '../types';

interface ProgressTrackerProps {
  current: number;
  total: number;
  status: AppStatus;
  stats: {
    total: number;
    found: number;
    pending: number;
  };
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ current, total, status, stats }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">General Progress</span>
          <span className="text-sm font-black text-blue-600">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.2)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[10px] font-bold text-slate-400 text-right uppercase tracking-widest">
          {current} / {total} Companies Processed
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Intel Found</p>
          <p className="text-lg font-black text-emerald-600">{stats.found}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
          <p className="text-lg font-black text-slate-900">{stats.pending}</p>
        </div>
      </div>

      {status === AppStatus.FINDING_DETAILS && (
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
          <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase tracking-tight">
            AI is actively scanning the web...
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
