
import React, { useState } from 'react';
import { Participant, AppStatus } from '../types';

interface Props {
  participants: Participant[];
  status: AppStatus;
  tokenBalance: number;
  onSelectParticipant: (p: Participant) => void;
  onExport: () => void;
  onClear: () => void;
}

const DataTable: React.FC<Props> = ({ participants, onSelectParticipant, onClear, onExport }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleRowClick = (p: Participant) => {
    setActiveId(p.id);
    onSelectParticipant(p);
  };

  if (participants.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-30">
        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-3xl mb-6 shadow-2xl border border-slate-100">🔭</div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">İstihbarat Bekleniyor</h3>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
          Yapay zeka analizini başlatmak için bir hedef girin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-0.5 h-5 bg-blue-600 rounded-full"></div>
           <div>
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">İstihbarat Havuzu</h3>
             <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1 block">{participants.length} Aktif Varlık</span>
           </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onExport} className="h-8 px-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">DIŞA AKTAR</button>
          <button onClick={onClear} className="h-8 px-4 bg-white text-slate-400 border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest hover:text-red-500 transition-all">TEMİZLE</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {participants.map((p) => (
            <div 
              key={p.id} 
              onClick={() => handleRowClick(p)}
              className={`group relative bg-white border rounded-[1.5rem] transition-all duration-300 cursor-pointer overflow-hidden ${
                activeId === p.id 
                ? 'border-blue-600 ring-4 ring-blue-50 shadow-2xl translate-y-[-2px]' 
                : 'border-slate-100 hover:border-blue-200 hover:shadow-lg hover:translate-y-[-1px]'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all duration-500 ${
                    activeId === p.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-white'
                  }`}>
                    {p.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-[11px] font-black tracking-tight truncate transition-colors mb-0.5 uppercase ${activeId === p.id ? 'text-blue-600' : 'text-slate-900'}`}>{p.name}</h4>
                    <div className="flex flex-col gap-0.5">
                       <span className="text-[8px] font-bold text-slate-400 truncate">📍 {p.location || 'Konum Analizi...'}</span>
                       <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest">{p.industry || 'Genel'}</span>
                    </div>
                  </div>
                </div>

                {/* Social Badges */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[7px] font-black transition-all ${p.linkedin ? 'bg-[#0077B5] text-white' : 'bg-slate-50 text-slate-200'}`}>LI</div>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[7px] font-black transition-all ${p.instagram ? 'bg-[#E4405F] text-white' : 'bg-slate-50 text-slate-200'}`}>IG</div>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[7px] font-black transition-all ${p.twitter ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-200'}`}>X</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  {p.status === 'completed' ? (
                     <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                        <span className="text-[7px] font-black uppercase text-emerald-600">Veri Aktif</span>
                     </div>
                  ) : p.status === 'failed' ? (
                     <span className="text-[7px] font-black uppercase text-red-500">Hata</span>
                  ) : (
                     <span className="text-[7px] font-black uppercase text-blue-400 animate-pulse">Tarama...</span>
                  )}
                  {p.website && (
                    <div className="text-[8px] font-bold text-slate-300 group-hover:text-blue-600 transition-colors truncate max-w-[100px]">
                      {p.website.replace(/^https?:\/\/(www\.)?/, '')}
                    </div>
                  )}
                </div>
              </div>
              
              {p.status === 'pending' && (
                 <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-50 overflow-hidden">
                    <div className="h-full bg-blue-600 animate-[shimmer_2s_infinite] w-full"></div>
                 </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataTable;
