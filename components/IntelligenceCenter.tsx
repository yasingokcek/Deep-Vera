
import React, { useState } from 'react';
import { Sector, SearchMode } from '../types';

interface Props {
  onSearch: (sector: string, location: string, mode: SearchMode) => void;
  isLoading: boolean;
}

const sectors: Sector[] = [
  { id: 'hotel', label: 'Hotels', icon: '🏨' },
  { id: 'factory', label: 'Manufacturing', icon: '🏭' },
  { id: 'restaurant', label: 'Hospitality', icon: '🍽️' },
  { id: 'logistics', label: 'Logistics', icon: '🚚' },
  { id: 'tech', label: 'Technology', icon: '💻' },
];

const states = ["Australia Wide", "New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "ACT", "Northern Territory"];

const IntelligenceCenter: React.FC<Props> = ({ onSearch, isLoading }) => {
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [mode, setMode] = useState<SearchMode>('db');

  return (
    <div className="flex flex-col gap-10">
      <div className="fade-in">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">01 / Choose Sector</label>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {sectors.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSector(s.id)}
              className={`flex-shrink-0 px-8 py-4 rounded-2xl border transition-all flex items-center gap-4 ${
                selectedSector === s.id 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'
              }`}
            >
              <span className="text-xl">{s.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-widest">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedSector && (
        <div className="fade-in">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">02 / Select Region</label>
          <div className="flex gap-3 flex-wrap">
            {states.map(state => (
              <button 
                key={state}
                onClick={() => setSelectedCity(state)}
                className={`px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedCity === state ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCity && (
        <div className="fade-in flex flex-col md:flex-row items-center justify-between p-8 bg-slate-50 rounded-3xl border border-slate-200">
           <div className="flex gap-12">
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Search Depth</span>
                 <div className="flex gap-6">
                    <button onClick={() => setMode('db')} className={`text-[10px] font-black uppercase tracking-widest ${mode === 'db' ? 'text-blue-600 underline underline-offset-8' : 'text-slate-400'}`}>Quick Scan</button>
                    <button onClick={() => setMode('live')} className={`text-[10px] font-black uppercase tracking-widest ${mode === 'live' ? 'text-blue-600 underline underline-offset-8' : 'text-slate-400'}`}>Deep Analysis</button>
                 </div>
              </div>
           </div>
           
           <button
             disabled={isLoading}
             onClick={() => onSearch(selectedSector, selectedCity, mode)}
             className={`px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all ${
               isLoading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-slate-900 shadow-xl shadow-blue-50'
             }`}
           >
             {isLoading ? 'Searching...' : 'Initiate Intelligence'}
           </button>
        </div>
      )}
    </div>
  );
};

export default IntelligenceCenter;
