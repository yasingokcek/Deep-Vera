
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
  onSelectParticipant, 
  onClear, 
  updateParticipant, 
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
    <div className="flex flex-col">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8 px-6">
        <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tighter">
          AKILLI İSTİHBARAT HAVUZU ({participants.length})
        </h3>
        <div className="flex gap-3">
           {queuedCount > 0 && (
             <button onClick={onStartAutomation} className="h-11 px-8 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-blue-200">OTONOMU BAŞLAT ({queuedCount})</button>
           )}
           <button onClick={onClear} className="h-11 px-8 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">TÜMÜNÜ TEMİZLE</button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6">
        {participants.map((p) => (
          <div 
            key={p.id} onClick={() => handleRowClick(p)}
            className={`group relative bg-white border-2 rounded-[2.8rem] transition-all cursor-pointer overflow-hidden flex flex-col hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] ${
              activeId === p.id ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-50'
            }`}
          >
            <div className="p-8 flex-1">
              {/* Card Top: Logo, Stars & Quick Actions */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-3">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.6rem] flex items-center justify-center font-black text-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
                    {p.name.charAt(0)}
                  </div>
                  {/* Yıldız Rating (Görseldeki talep) */}
                  <div className="flex gap-0.5 px-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-[12px] ${i < (p.starRating || 3) ? 'text-amber-400' : 'text-slate-100'}`}>★</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                   {/* İletişim İkonları */}
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${p.email ? 'bg-slate-50 text-slate-400 opacity-100' : 'bg-slate-50 text-slate-200 opacity-40'}`}>
                      📧
                   </div>
                   <button 
                    onClick={(e) => handleQueueToggle(e, p)} 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                      p.automationStatus === 'queued' ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-white border border-slate-100 text-slate-300'
                    }`}
                  >
                    {p.automationStatus === 'sent' ? '✓' : '✉'}
                  </button>
                </div>
              </div>

              {/* Company Info */}
              <div className="mb-6">
                <h4 className="text-[17px] font-black uppercase text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                  {p.name}
                </h4>
                {/* Detaylı Konum Verisi (Görseldeki talep) */}
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                  {p.location || 'Semt, İlçe, Şehir'}
                </p>
              </div>

              {/* Sosyal Medya İkon Seti (Görseldeki talep) */}
              <div className="flex gap-4 mb-2 opacity-30 group-hover:opacity-100 transition-opacity">
                 {['linkedin', 'instagram', 'twitter'].map(social => (
                    <div key={social} className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-[10px] grayscale group-hover:grayscale-0 transition-all">
                       {social === 'linkedin' ? 'L' : social === 'instagram' ? 'I' : 'X'}
                    </div>
                 ))}
                 {p.phone && <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-[10px] grayscale">📞</div>}
              </div>
            </div>

            {/* Durum Barı (Görseldeki talep) */}
            <div className="bg-slate-50/80 border-t border-slate-100 px-8 py-5 flex items-center justify-between mt-auto">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DURUM:</span>
               <span className={`text-[10px] font-black uppercase tracking-widest ${
                 p.funnelStatus === 'replied' ? 'text-emerald-500' : 
                 p.funnelStatus === 'contacted' ? 'text-blue-500' : 'text-slate-400'
               }`}>
                 {p.funnelStatus === 'replied' ? 'YANIT ALINDI' : p.funnelStatus === 'contacted' ? 'İRTİBATTA' : 'BEKLEMEDE'}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTable;
