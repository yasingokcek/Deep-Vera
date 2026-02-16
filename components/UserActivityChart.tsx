
import React from 'react';
import { ActivityPoint } from '../types';

interface Props {
  data: ActivityPoint[];
}

const UserActivityChart: React.FC<Props> = ({ data }) => {
  const width = 800;
  const height = 180;
  const padding = 20;

  const maxVal = Math.max(...data.map(d => Math.max(d.tokensSpent, d.analyses, d.logins * 10)), 100);

  const getX = (index: number) => (index * (width - padding * 2)) / (data.length - 1) + padding;
  const getY = (val: number) => height - ((val / maxVal) * (height - padding * 2) + padding);

  const pointsTokens = data.map((d, i) => `${getX(i)},${getY(d.tokensSpent)}`).join(' ');
  const pointsAnalyses = data.map((d, i) => `${getX(i)},${getY(d.analyses)}`).join(' ');

  return (
    <div className="w-full bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex justify-end items-center mb-8">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_#2563eb]"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase">Credits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase">Analyses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-900"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase">Logins</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px] overflow-visible">
          {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
            <line 
              key={i} 
              x1={padding} 
              y1={getY(v * maxVal)} 
              x2={width - padding} 
              y2={getY(v * maxVal)} 
              stroke="#f1f5f9" 
              strokeWidth="1" 
            />
          ))}

          <polyline
            points={`${getX(0)},${height} ${pointsTokens} ${getX(data.length - 1)},${height}`}
            fill="url(#gradientTokens)"
            opacity="0.1"
          />
          <polyline
            points={pointsTokens}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <polyline
            points={`${getX(0)},${height} ${pointsAnalyses} ${getX(data.length - 1)},${height}`}
            fill="url(#gradientAnalyses)"
            opacity="0.1"
          />
          <polyline
            points={pointsAnalyses}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((d, i) => (
            <circle 
              key={i} 
              cx={getX(i)} 
              cy={getY(d.logins * 10)} 
              r="4" 
              fill="#0f172a" 
              className="hover:r-6 transition-all cursor-pointer"
            />
          ))}

          <defs>
            <linearGradient id="gradientTokens" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="gradientAnalyses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        <div className="flex justify-between px-[10px] mt-4">
          {data.map((d, i) => (
            <span key={i} className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">
              {d.date}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserActivityChart;
