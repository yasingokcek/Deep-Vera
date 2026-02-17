
import React, { useState } from 'react';
import { Participant, AppStatus } from '../types';

interface Props {
  participants: Participant[];
  status: AppStatus;
  tokenBalance: number;
  onSelectParticipant: (p: Participant) => void;
  onExport: () => void;
  onClear: () => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  onSaveToLibrary?: (name: string) => void;
  onStartAutomation?: () => void;
}

const DataTable: React.FC<Props> = ({ 
  participants, 
  status,
  onSelectParticipant, 
  onClear, 
  updateParticipant, 
  onSaveToLibrary,
  onStartAutomation,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleRowClick = (p: Participant) => {
    setActiveId(p.id);
    onSelectParticipant(p);
  };

  const handleQueueToggle = (e: React.MouseEvent, p: Participant) => {
    e.stopPropagation();
    if (p.automationStatus === 'sent' || p.automationStatus === 'sending') return;
    const nextStatus = p.automationStatus === 'idle' ? 'queued' : 'idle';
    updateParticipant(p.id, { automationStatus: nextStatus as any });
  };

  const queuedCount = participants.filter(p => p.automationStatus === 'queued').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Akıllı İstihbarat Havuzu ({participants.length})</h3>
        <div className="flex gap-2">
           {queuedCount > 0 && (
             <button onClick={onStartAutomation} className="h-9 px-6 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-amber-200">Otonom Başlat ({queuedCount})</button>
           )}
           <button onClick={onClear} className="h-9 px-6 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Tümünü Temizle</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {participants.map((p) => (
            <div 
              key={p.id} onClick={() => handleRowClick(p)}
              className={`group relative bg-white border rounded-[2.5rem] transition-all cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 ${
                activeId === p.id ? 'border-blue-600 ring-8 ring-blue-50/50' : 'border-slate-100'
              }`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                p.funnelStatus === 'replied' ? 'bg-emerald-500' : 
                p.funnelStatus === 'contacted' ? 'bg-amber-500' : 
                p.automationStatus === 'queued' ? 'bg-blue-600 animate-pulse' : 'bg-transparent'
              }`}></div>

              <div className="p-7">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
                    {p.name.charAt(0)}
                  </div>
                  <button 
                    onClick={(e) => handleQueueToggle(e, p)} 
                    disabled={p.automationStatus === 'sent' || p.automationStatus === 'sending'}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                      p.automationStatus === 'queued' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 
                      p.automationStatus === 'sent' ? 'bg-emerald-100 border-emerald-100 text-emerald-600' :
                      'bg-white border-slate-100 text-slate-300 hover:text-blue-600 hover:border-blue-200'
                    }`}
                  >
                    {p.automationStatus === 'sent' ? '✓' : '✉'}
                  </button>
                </div>

                <h4 className="text-[13px] font-black truncate uppercase text-slate-900 mb-1 leading-tight">{p.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 truncate mb-5">{p.location || 'Konum Bilirtilmedi'}</p>

                <div className="bg-slate-50/80 p-4 rounded-[1.5rem] space-y-3 border border-slate-100/50">
                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">Durum:</span>
                      <span className={p.funnelStatus === 'replied' ? 'text-emerald-600' : 'text-slate-600'}>
                        {p.funnelStatus === 'replied' ? 'Yanıt Alındı' : p.funnelStatus === 'contacted' ? 'İrtibata Geçildi' : 'Beklemede'}
                      </span>
                   </div>
                   
                   {p.sentFromEmail && (
                     <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-200">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Gönderen Kanal:</span>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                           <span className="text-[10px] font-black text-blue-600 truncate">{p.sentFromEmail}</span>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataTable;
