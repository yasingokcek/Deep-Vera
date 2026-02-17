
import React, { useState } from 'react';
import { User, SenderAccount } from '../types';
import { analyzeOwnWebsite } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (fields: Partial<User>) => void;
}

const IdentityModal: React.FC<Props> = ({ isOpen, onClose, user, onUpdate }) => {
  const [newEmail, setNewEmail] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  if (!isOpen || !user) return null;

  const addAccount = () => {
    if (!newEmail.includes('@')) return;
    const newAcc: SenderAccount = {
      id: Math.random().toString(36).substr(2, 9),
      email: newEmail,
      status: 'active',
      usageCount: 0
    };
    onUpdate({ senderAccounts: [...(user.senderAccounts || []), newAcc] });
    setNewEmail('');
  };

  const removeAccount = (id: string) => {
    onUpdate({ senderAccounts: user.senderAccounts.filter(a => a.id !== id) });
  };

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
      <div className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-white">
        
        <div className="p-10 border-b border-slate-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">⚙️</div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Profil & Gönderici Havuzu</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Global İstihbarat Parametreleri</p>
             </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-slate-50 rounded-xl text-3xl text-slate-300 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Şirket Bilgileri */}
            <div className="space-y-8">
               <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-4">01. Kurumsal Kimlik</h4>
               
               <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Şirket Web Sitesi</label>
                  <div className="relative group">
                     <input type="text" value={user.companyWebsite || ''} onChange={(e) => onUpdate({ companyWebsite: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none group-focus-within:bg-white group-focus-within:border-blue-400 transition-all" placeholder="https://..." />
                     <button onClick={handleAIScan} className="absolute right-2 top-2 bottom-2 px-5 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">AI ANALİZ</button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">İmza Temsilcisi</label>
                    <input type="text" value={user.authorizedPerson || ''} onChange={(e) => onUpdate({ authorizedPerson: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-400" placeholder="Ad Soyad" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Resmi Şirket Adı</label>
                    <input type="text" value={user.companyName || ''} onChange={(e) => onUpdate({ companyName: e.target.value })} className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-400" />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Pitch (Ana Değer Önerisi)</label>
                  <textarea value={user.globalPitch || ''} onChange={(e) => onUpdate({ globalPitch: e.target.value })} className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-3xl text-[12px] font-medium leading-relaxed resize-none outline-none focus:bg-white transition-all shadow-inner" placeholder="Şirketiniz ne yapar? Müşteriye ne kazandırır?" />
               </div>
            </div>

            {/* Gönderici Havuzu (ÇOKLU HESAP) */}
            <div className="space-y-8 bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
               <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-200 pb-4 flex justify-between">
                  <span>02. Gönderici Havuzu</span>
                  <span className="text-blue-600">{user.senderAccounts?.length || 0} Hesap</span>
               </h4>
               
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">
                 Anti-Spam Shield: Buraya eklediğiniz her e-posta adresi sırayla kullanılır. Bu, bir domain üzerinden çok fazla gönderim yapılmasını engelleyerek spam riskini düşürür.
               </p>

               <div className="flex gap-3">
                  <input 
                    type="email" 
                    value={newEmail} 
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="E-posta adresi girin..."
                    className="flex-1 h-14 px-6 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold outline-none focus:border-blue-500 shadow-sm"
                  />
                  <button onClick={addAccount} className="px-8 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg">EKLE</button>
               </div>

               <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-3">
                  {user.senderAccounts?.map((acc) => (
                    <div key={acc.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex justify-between items-center group hover:border-blue-200 transition-all shadow-sm">
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs">✉</div>
                          <span className="text-[11px] font-black text-slate-700">{acc.email}</span>
                       </div>
                       <button onClick={() => removeAccount(acc.id)} className="text-slate-300 hover:text-red-500 transition-colors">Sil</button>
                    </div>
                  ))}
                  {(!user.senderAccounts || user.senderAccounts.length === 0) && (
                    <div className="p-20 text-center opacity-30 border-2 border-dashed border-slate-200 rounded-3xl">
                       <div className="text-3xl mb-4">📭</div>
                       <span className="text-[10px] font-black uppercase tracking-widest">Henüz Hesap Eklenmedi</span>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0 gap-6">
           <button onClick={onClose} className="px-14 py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95">SİSTEMİ SENKRONİZE ET</button>
        </div>
      </div>
    </div>
  );
};

export default IdentityModal;
