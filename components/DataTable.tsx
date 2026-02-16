
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
        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 shadow-inner border border-slate-100">📡</div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">İstihbarat Bekleniyor</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] max-w-sm">
          Taramayı başlatmak için arama kutusuna bir URL veya sektör girin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div className="flex items-center gap-4">
           <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
           <div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">İstihbarat Havuzu</h3>
             <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{participants.length} Aktif Fırsat</span>
             </div>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onExport} className="h-9 px-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">📊 Raporla</button>
          <button onClick={onClear} className="h-9 px-4 bg-white text-slate-400 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-red-200 hover:text-red-500 transition-all shadow-sm">🗑️ Sıfırla</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {participants.map((p) => (
            <div 
              key={p.id} 
              onClick={() => handleRowClick(p)}
              className={`group relative bg-white border rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                activeId === p.id 
                ? 'border-blue-600 ring-4 ring-blue-50 shadow-xl shadow-blue-100/30 translate-y-[-2px]' 
                : 'border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100/50 hover:translate-y-[-1px]'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 transition-all duration-500 ${
                    activeId === p.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-white'
                  }`}>
                    {p.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-black tracking-tight truncate transition-colors mb-1 ${activeId === p.id ? 'text-blue-600' : 'text-slate-900'}`}>{p.name}</h4>
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">📍 {p.location || 'Bilinmiyor'}</span>
                       <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{p.industry || 'Potansiyel'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {p.linkedin && <span className="w-5 h-5 bg-blue-50 text-[#0077B5] rounded flex items-center justify-center text-[10px] font-bold">L</span>}
                  {p.instagram && <span className="w-5 h-5 bg-pink-50 text-[#E4405F] rounded flex items-center justify-center text-[10px] font-bold">I</span>}
                  {p.twitter && <span className="w-5 h-5 bg-slate-50 text-black rounded flex items-center justify-center text-[10px] font-bold">X</span>}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                  {p.status === 'completed' ? (
                     <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Analiz Tamam</span>
                  ) : (
                     <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full animate-pulse">İşleniyor...</span>
                  )}
                  {p.website && (
                    <div className="text-[9px] font-bold text-slate-300 group-hover:text-blue-600 transition-colors truncate max-w-[100px]">
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
