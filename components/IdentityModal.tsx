
import React, { useState } from 'react';
import { User } from '../types';
import { analyzeOwnWebsite } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (fields: Partial<User>) => void;
}

const IdentityModal: React.FC<Props> = ({ isOpen, onClose, user, onUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  if (!isOpen || !user) return null;

  const handleAIScan = async () => {
    if (!user.companyWebsite?.includes('.')) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeOwnWebsite(user.companyWebsite);
      onUpdate(result);
    } catch (e) { alert("Analiz başarısız."); }
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-black">⚙️</div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Profil Komut Merkezi</h3>
          </div>
          <button onClick={onClose} className="text-3xl text-slate-300 hover:text-red-500">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Şirket Web Sitesi</label>
              <div className="relative">
                 <input type="text" value={user.companyWebsite || ''} onChange={(e) => onUpdate({ companyWebsite: e.target.value })} className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold outline-none" placeholder="https://..." />
                 <button onClick={handleAIScan} className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">AI Analiz</button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">İmza Temsilcisi</label>
              <input type="text" value={user.authorizedPerson || ''} onChange={(e) => onUpdate({ authorizedPerson: e.target.value })} className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold outline-none" placeholder="Ad Soyad" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Resmi Şirket Adı</label>
            <input type="text" value={user.companyName || ''} onChange={(e) => onUpdate({ companyName: e.target.value })} className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold outline-none" />
          </div>

          {/* Protokol 3 İçin Kritik Alan */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Fiziki / Resmi Adres (İmza İçin)</label>
            <input type="text" value={user.officialAddress || ''} onChange={(e) => onUpdate({ officialAddress: e.target.value })} className="w-full h-12 px-6 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold outline-none" placeholder="Mahalle, Sokak, No..." />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Global Pitch (Ana Değer Önerisi)</label>
            <textarea value={user.globalPitch || ''} onChange={(e) => onUpdate({ globalPitch: e.target.value })} className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-medium leading-relaxed resize-none outline-none focus:bg-white transition-all" />
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
           <button onClick={onClose} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Kaydet ve Senkronize Et</button>
        </div>
      </div>
    </div>
  );
};

export default IdentityModal;
