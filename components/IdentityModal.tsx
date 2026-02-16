
import React from 'react';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (fields: Partial<User>) => void;
}

const IdentityModal: React.FC<Props> = ({ isOpen, onClose, user, onUpdate }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl border border-white overflow-hidden flex flex-col fade-in">
        <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Profil Yapılandırması</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Bu veriler AI Senaryo Motoruna güç verir.</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 text-2xl font-bold cursor-pointer">&times;</button>
        </div>

        <div className="p-10 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-8 text-left">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Şirket Tam Adı</label>
              <input type="text" value={user.companyName || ''} onChange={(e) => onUpdate({ companyName: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold outline-none" placeholder="Örn: DeepVera Teknoloji A.Ş." />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Yetkili Kişi</label>
              <input type="text" value={user.authorizedPerson || ''} onChange={(e) => onUpdate({ authorizedPerson: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold outline-none" placeholder="Örn: Can Yılmaz" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-2">AI Referans Metni (İş Özeti)</label>
            <textarea value={user.companyDescription || ''} onChange={(e) => onUpdate({ companyDescription: e.target.value })} className="w-full h-24 p-5 bg-blue-50/30 border border-blue-100 rounded-[2rem] text-[11px] font-medium resize-none leading-relaxed" placeholder="Şirketiniz ne yapar? AI teklifleri buna göre yazar." />
          </div>

          <div className="p-6 bg-slate-900 rounded-[2.5rem] space-y-4 border border-blue-500/30">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">⚡</div>
               <label className="text-[10px] font-black text-white uppercase tracking-widest">n8n Otomasyon Webhook</label>
            </div>
            <input type="text" value={user.n8nWebhookUrl || ''} onChange={(e) => onUpdate({ n8nWebhookUrl: e.target.value })} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-mono text-blue-400 outline-none" placeholder="https://n8n.sunucunuz.com/..." />
          </div>
        </div>

        <div className="p-10 bg-slate-900 flex flex-col gap-4">
           <button onClick={onClose} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-white hover:text-slate-900 transition-all">
             Değişiklikleri Kaydet
           </button>
        </div>
      </div>
    </div>
  );
};

export default IdentityModal;
