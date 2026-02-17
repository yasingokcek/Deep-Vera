
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
  currentFilters?: { city: string; sector: string };
  onStartAutomation?: () => void;
}

const DataTable: React.FC<Props> = ({ 
  participants, 
  status,
  onSelectParticipant, 
  onClear, 
  updateParticipant, 
  onSaveToLibrary,
  currentFilters,
  onStartAutomation,
  onExport
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleRowClick = (p: Participant) => {
    setActiveId(p.id);
    onSelectParticipant(p);
  };

  const toggleSave = (e: React.MouseEvent, p: Participant) => {
    e.stopPropagation();
    updateParticipant(p.id, { isSaved: !p.isSaved });
  };

  const handleQueueToggle = (e: React.MouseEvent, p: Participant) => {
    e.stopPropagation();
    if (p.automationStatus === 'sent' || p.automationStatus === 'sending') return;
    const nextStatus = p.automationStatus === 'idle' ? 'queued' : 'idle';
    updateParticipant(p.id, { automationStatus: nextStatus as any });
  };

  const handleQueueAll = () => {
    participants.forEach(p => {
      if (p.automationStatus === 'idle' && p.email && p.email !== 'Analiz ediliyor...') {
        updateParticipant(p.id, { automationStatus: 'queued' });
      }
    });
  };

  const triggerSaveSearch = () => {
    if (status !== AppStatus.IDLE) {
      alert("Analiz devam ediyor, lütfen işlemin tamamlanmasını bekleyiniz.");
      return;
    }
    if (!onSaveToLibrary) return;
    const dateStr = new Date().toLocaleDateString('tr-TR');
    const defaultName = `${currentFilters?.city || 'Türkiye'} - ${currentFilters?.sector || 'Genel'} (${participants.length} Firma) - ${dateStr}`;
    const customName = prompt("Kaydedilecek isim:", defaultName);
    if (customName) onSaveToLibrary(customName);
  };

  if (participants.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-30">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-4 border border-slate-100">🔭</div>
        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Veri Bekleniyor</h3>
      </div>
    );
  }

  // Yıldız puanına göre yüksekten düşüğe sıralama (5 Yıldız en üstte)
  const sortedParticipants = [...participants].sort((a, b) => (b.starRating || 0) - (a.starRating || 0));

  const queuedCount = participants.filter(p => p.automationStatus === 'queued').length;
  const isBusy = status !== AppStatus.IDLE;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0 px-2">
        <div className="flex items-center gap-3">
           <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
           <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Akıllı Prestij Sıralaması</h3>
           <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{participants.length} Kayıt</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onExport} className="h-8 px-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">📥 EXCEL'E AKTAR</button>
          <button onClick={handleQueueAll} className="h-8 px-4 bg-blue-600 text-white border border-blue-500 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2"><span>⚡ TÜMÜNÜ KUYRUĞA AL</span></button>
          {queuedCount > 0 && onStartAutomation && (
            <button onClick={onStartAutomation} className="h-8 px-4 bg-amber-500 text-white border border-amber-400 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg animate-pulse">🚀 OTONOMU BAŞLAT ({queuedCount})</button>
          )}
          <button onClick={triggerSaveSearch} className={`h-8 px-4 border rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isBusy ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}><span>{isBusy ? '⌛ ANALİZ EDİLİYOR...' : '📁 KÜTÜPHANEYE KAYDET'}</span></button>
          <button onClick={onClear} className="h-8 px-4 bg-white text-slate-400 border border-slate-100 rounded-xl text-[8px] font-black uppercase tracking-widest hover:text-red-500 transition-all">TEMİZLE</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedParticipants.map((p) => (
            <div 
              key={p.id} onClick={() => handleRowClick(p)}
              className={`group relative bg-white border rounded-[2.2rem] transition-all duration-300 cursor-pointer overflow-hidden ${
                activeId === p.id ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-100 hover:border-blue-200'
              }`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 transition-all ${p.automationStatus === 'sent' ? 'bg-emerald-500' : p.automationStatus === 'queued' ? 'bg-blue-600 animate-pulse' : 'bg-transparent'}`}></div>

              <div className="absolute top-5 right-5 flex gap-2 z-10">
                <button onClick={(e) => toggleSave(e, p)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${p.isSaved ? 'bg-amber-500 text-white' : 'bg-white text-slate-300 border border-slate-100'}`}>★</button>
                <button onClick={(e) => handleQueueToggle(e, p)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border ${p.automationStatus === 'queued' ? 'bg-blue-600 text-white' : 'bg-white text-slate-300'}`}>✉</button>
              </div>

              <div className="p-7">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-sm font-black shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0 pr-12">
                    <h4 className="text-[11px] font-black truncate uppercase text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{p.name}</h4>
                    {/* Yıldız Puanı */}
                    <div className="flex items-center gap-0.5 mt-1.5">
                       {[...Array(5)].map((_, i) => (
                         <span key={i} className={`text-[10px] ${i < (p.starRating || 0) ? 'text-amber-400' : 'text-slate-100'}`}>★</span>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mb-5">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px]">📍</span>
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter truncate">{p.location || 'Bilinmiyor'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px]">📞</span>
                     <span className="text-[9px] font-black text-slate-900 uppercase tracking-tight">{p.phone || 'Aranıyor...'}</span>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/80 space-y-2.5">
                   <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">İtibar Skoru</span>
                      <span className={`text-[9px] font-black uppercase ${p.starRating && p.starRating >= 4 ? 'text-emerald-600' : 'text-slate-500'}`}>
                         {p.starRating ? `${p.starRating * 20}% Prestij` : 'Analiz Ediliyor...'}
                      </span>
                   </div>
                   <div className="h-px bg-slate-200/50"></div>
                   <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Operasyon</span>
                      <div className="flex items-center gap-1.5">
                         <div className={`w-1.5 h-1.5 rounded-full ${p.automationStatus === 'sent' ? 'bg-emerald-500' : p.automationStatus === 'queued' ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`}></div>
                         <span className="text-[8px] font-black uppercase text-slate-500">{p.automationStatus === 'sent' ? 'İletildi' : p.automationStatus === 'queued' ? 'Sırada' : 'Bekliyor'}</span>
                      </div>
                   </div>
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
