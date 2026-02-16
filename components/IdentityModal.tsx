
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
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 text-2xl font-bold cursor-pointer transition-all hover:bg-red-50 hover:text-red-500">&times;</button>
        </div>

        <div className="p-10 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-8 text-left">
          {/* Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Şirket Tam Adı</label>
              <input type="text" value={user.companyName || ''} onChange={(e) => onUpdate({ companyName: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:border-blue-400 transition-all" placeholder="Örn: DeepVera Teknoloji A.Ş." />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Yetkili Kişi</label>
              <input type="text" value={user.authorizedPerson || ''} onChange={(e) => onUpdate({ authorizedPerson: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:border-blue-400 transition-all" placeholder="Örn: Can Yılmaz" />
            </div>
          </div>

          {/* Strategic Context (NEW) */}
          <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 block">AI Strateji Bağlamı</span>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Ana Faaliyet Alanı & Çözümünüz</label>
              <textarea value={user.mainActivity || ''} onChange={(e) => onUpdate({ mainActivity: e.target.value })} className="w-full h-20 p-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-medium resize-none outline-none focus:border-blue-400" placeholder="Şirketiniz ne üretiyor veya hangi sorunu çözüyor?" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Başlıca Rakipleriniz</label>
                <input type="text" value={user.competitorsInfo || ''} onChange={(e) => onUpdate({ competitorsInfo: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:border-blue-400" placeholder="Örn: Salesforce, HubSpot" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">İdeal Hedef Kitle</label>
                <input type="text" value={user.targetAudience || ''} onChange={(e) => onUpdate({ targetAudience: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:border-blue-400" placeholder="Örn: Lojistik Müdürleri" />
              </div>
            </div>
          </div>

          {/* General Bio */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Şirket İş Özeti (AI Referans)</label>
            <textarea value={user.companyDescription || ''} onChange={(e) => onUpdate({ companyDescription: e.target.value })} className="w-full h-24 p-5 bg-white border border-slate-200 rounded-[2rem] text-[11px] font-medium resize-none leading-relaxed outline-none focus:border-blue-400" placeholder="Genel tanıtım metni..." />
          </div>

          <div className="p-6 bg-slate-900 rounded-[2.5rem] space-y-4 border border-blue-500/30">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">⚡</div>
               <label className="text-[10px] font-black text-white uppercase tracking-widest">n8n Otomasyon Webhook</label>
            </div>
            <input type="text" value={user.n8nWebhookUrl || ''} onChange={(e) => onUpdate({ n8nWebhookUrl: e.target.value })} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-mono text-blue-400 outline-none focus:border-blue-500" placeholder="https://n8n.sunucunuz.com/..." />
          </div>
        </div>

        <div className="p-10 bg-slate-900">
           <button onClick={onClose} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-white hover:text-slate-900 transition-all active:scale-95">
             Yapılandırmayı Kaydet
           </button>
        </div>
      </div>
    </div>
  );
};

export default IdentityModal;
