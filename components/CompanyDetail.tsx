
import React, { useState, useEffect } from 'react';
import { Participant, User } from '../types';

interface Props {
  participant: Participant | null;
  onClose: () => void;
  user: User | null;
  updateParticipant?: (id: string, updates: Partial<Participant>) => void;
}

const CompanyDetail: React.FC<Props> = ({ participant, onClose, user, updateParticipant }) => {
  const [isSending, setIsSending] = useState(false);
  const [draft, setDraft] = useState(participant?.emailDraft || '');
  const [subject, setSubject] = useState(participant?.emailSubject || '');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    if (participant) {
      setDraft(participant.emailDraft || '');
      setSubject(participant.emailSubject || '');
    }
  }, [participant]);

  if (!participant || !user) return null;

  const signature = `
<br><br>
Saygılarımla,
<br><br>
<b>${user.authorizedPerson || user.name}</b><br>
${user.companyName || 'DeepVera Strateji Birimi'}<br>
${user.officialAddress || ''}<br>
${user.companyWebsite || ''}`;

  const handleInternalSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      if (updateParticipant) {
        updateParticipant(participant.id, { 
          automationStatus: 'sent', 
          funnelStatus: 'contacted',
          emailDraft: draft,
          emailSubject: subject
        });
      }
      onClose();
    }, 1800);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[800px] bg-white shadow-[-40px_0_80px_rgba(0,0,0,0.2)] z-[500] flex flex-col border-l border-slate-100 animate-fade-in">
      
      <div className="p-8 border-b border-slate-50 flex justify-between items-center shrink-0 bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-transparent"></div>
             {participant.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">{participant.name}</h2>
            <div className="flex items-center gap-3 mt-3">
               <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-base ${i < (participant.starRating || 0) ? 'text-amber-400' : 'text-slate-100'}`}>★</span>
                  ))}
               </div>
               <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1.5 rounded-full tracking-widest">{participant.industry || 'Analiz Ediliyor'}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all text-4xl">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/20">
        <div className="p-8 space-y-8">
          
          {/* Stratejik İstihbarat Paneli */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">⚔️</div>
                   <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Rakip Analizi</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                   {participant.competitors?.map((comp, i) => (
                      <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-tight">{comp}</span>
                   )) || <span className="text-[10px] text-slate-400 italic">Veri aranıyor...</span>}
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-sm">🎯</div>
                   <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Sektörel Acı Noktaları</h3>
                </div>
                <div className="space-y-3">
                   {participant.painPoints?.map((point, i) => (
                      <div key={i} className="flex gap-3">
                         <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0"></div>
                         <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">{point}</p>
                      </div>
                   )) || <span className="text-[10px] text-slate-400 italic">Analiz ediliyor...</span>}
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">🤖</div>
                   <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tighter">Nöral İkna Taslağı (V4)</h3>
                </div>
                {copyStatus && <span className="text-[9px] font-black text-emerald-500 uppercase animate-bounce">{copyStatus} Kopyalandı!</span>}
             </div>

             <div className="space-y-6">
                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">İkna Edici Konu Başlığı</label>
                   <input 
                     type="text" 
                     value={subject} 
                     onChange={(e) => setSubject(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-[12px] font-black text-slate-900 outline-none focus:bg-white focus:border-blue-400 transition-all" 
                   />
                </div>

                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">Kişiselleştirilmiş Mesaj</label>
                   <textarea 
                     value={draft} 
                     onChange={(e) => setDraft(e.target.value)}
                     className="w-full h-96 bg-white border border-slate-200 rounded-[2rem] p-8 text-[13px] text-slate-700 leading-[1.8] outline-none resize-none font-medium focus:border-blue-400 transition-all custom-scrollbar shadow-inner"
                   />
                </div>

                <div className="p-8 bg-slate-900 rounded-[2rem] border border-blue-500/20">
                   <label className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4 block">Operasyonel İmza</label>
                   <div className="text-[11px] font-bold text-white/50 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: signature }} />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-slate-50 bg-white shrink-0 shadow-[0_-30px_60px_rgba(0,0,0,0.04)]">
         <div className="flex gap-4">
            <button 
              onClick={handleInternalSend} 
              disabled={isSending || !participant.email}
              className={`flex-1 py-7 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
                !participant.email ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-slate-900'
              }`}
            >
              {isSending ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>OTOMATİK GÖNDER <span className="text-xl">⚡</span></>
              )}
            </button>
            <button 
              onClick={() => copyToClipboard(`${subject}\n\n${draft}\n${signature.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')}`, 'Tüm İletişim')}
              className="w-20 h-full bg-slate-100 text-slate-900 rounded-[2rem] flex items-center justify-center text-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-200"
            >
              📋
            </button>
         </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
