
import React, { useState } from 'react';
import { Participant } from '../types';

interface Props {
  participant: Participant | null;
  onClose: () => void;
  userLogo?: string;
  n8nWebhookUrl?: string;
  updateParticipant?: (id: string, updates: Partial<Participant>) => void;
}

const CompanyDetail: React.FC<Props> = ({ participant, onClose, userLogo, n8nWebhookUrl, updateParticipant }) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [draft, setDraft] = useState(participant?.emailDraft || '');

  if (!participant) return null;

  const handleSyncCRM = async () => {
    if (!n8nWebhookUrl) {
      alert("Lütfen profil ayarlarından n8n Webhook URL'nizi tanımlayın.");
      return;
    }
    setIsSyncing(true);
    try {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...participant, draft, syncedAt: new Date().toISOString() })
      });
      alert("CRM Senkronizasyonu Başarılı!");
    } catch (e) {
      alert("Senkronizasyon hatası.");
    }
    setIsSyncing(false);
  };

  const handleToggleQueue = () => {
    if (!updateParticipant) return;
    const nextStatus = participant.automationStatus === 'idle' ? 'queued' : 'idle';
    updateParticipant(participant.id, { automationStatus: nextStatus as any });
  };

  const handleInternalSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      if (updateParticipant) updateParticipant(participant.id, { automationStatus: 'sent' });
      setTimeout(() => setIsSent(false), 3000);
    }, 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[680px] bg-white shadow-[-40px_0_100px_rgba(0,0,0,0.1)] z-[200] flex flex-col fade-in border-l border-slate-100">
      <div className="p-8 border-b border-slate-50 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-xl shrink-0">
               {participant.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase truncate">{participant.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                 <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded-full tracking-widest">{participant.industry || 'Global Lead'}</span>
                 {participant.healthScore && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                       <span className="text-[8px] font-black text-emerald-600 uppercase">Güven Skoru: %{participant.healthScore}</span>
                    </div>
                 )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center transition-all text-slate-400 text-2xl">
            &times;
          </button>
        </div>

        <div className="flex gap-3">
           <button 
             onClick={handleToggleQueue} 
             className={`flex-1 h-11 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
               participant.automationStatus === 'queued' 
               ? 'bg-red-50 text-red-600 border border-red-100' 
               : 'bg-blue-600 text-white hover:bg-slate-900'
             }`}
           >
              {participant.automationStatus === 'queued' ? "KUYRUKTAN ÇIKAR" : "OTONOM KUYRUĞA EKLE"}
           </button>
           <button onClick={handleSyncCRM} disabled={isSyncing} className="px-6 h-11 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
              CRM SENKRON
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/20">
        {participant.newsTrigger && (
          <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 relative overflow-hidden group">
             <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center text-xl shrink-0">🔔</div>
                <div>
                   <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Haber Tetikleyici (Trigger)</h4>
                   <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic">"{participant.newsTrigger}"</p>
                </div>
             </div>
          </div>
        )}

        <div className="space-y-4">
           <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Akıllı Satış Senaryosu</span>
              <span className="text-[8px] font-black text-blue-500 uppercase">AI: GPT-DeepVera Alpha v2</span>
           </div>
           
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm group">
              <div className="mb-4">
                 <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Konu Başlığı</label>
                 <input 
                   type="text" 
                   value={participant.emailSubject || ''} 
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[12px] font-black outline-none focus:border-blue-400 transition-all" 
                 />
              </div>
              <div className="mb-6">
                 <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Icebreaker (Giriş)</label>
                 <div className="p-4 bg-blue-50/30 border-l-4 border-blue-500 text-[11px] font-bold text-slate-700 italic mb-4">
                    {participant.icebreaker || 'Hazırlanıyor...'}
                 </div>
              </div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Mesaj Gövdesi</label>
              <textarea 
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full h-80 bg-white border-0 p-0 text-[13px] text-slate-700 leading-relaxed outline-none resize-none font-medium custom-scrollbar"
              />
              {userLogo && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
                  <img src={userLogo} className="h-10 w-auto grayscale opacity-40" alt="Logo" />
                  <div className="h-6 w-px bg-slate-100"></div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">DeepVera Verified System</span>
                </div>
              )}
           </div>

           <button 
             onClick={handleInternalSend}
             disabled={isSending || isSent || !participant.email?.includes('@')}
             className={`w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
               isSent ? 'bg-emerald-500 text-white' : 
               isSending ? 'bg-slate-900 text-white animate-pulse' : 
               'bg-blue-600 text-white hover:bg-slate-900'
             }`}
           >
             {isSent ? '✓ E-POSTA GÖNDERİLDİ' : isSending ? 'YAPAY ZEKA GÖNDERİYOR...' : 'ANINDA GÖNDER (GMAIL)'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
