
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
${user.companyName || 'Kurumsal İstihbarat Yöneticisi'}<br>
${user.officialAddress || ''}<br>
${user.companyWebsite || ''}`;

  const handleInternalSend = () => {
    setIsSending(true);
    const finalHtml = `${draft}${signature}`;
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
    <div className="fixed inset-y-0 right-0 w-full sm:w-[700px] bg-white shadow-[-40px_0_80px_rgba(0,0,0,0.15)] z-[500] flex flex-col border-l border-slate-100 animate-fade-in">
      
      <div className="p-8 border-b border-slate-50 flex justify-between items-center shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center text-3xl font-black shadow-2xl relative">
             {participant.name.charAt(0)}
             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center text-[10px]">✓</div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{participant.name}</h2>
            <div className="flex items-center gap-3 mt-2">
               <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < (participant.starRating || 0) ? 'text-amber-400' : 'text-slate-100'}`}>★</span>
                  ))}
               </div>
               <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">{participant.industry || 'Analiz Ediliyor'}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all text-3xl">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/20">
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 block">İstihbarat Temas Noktaları</span>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-blue-50 transition-all cursor-pointer" onClick={() => copyToClipboard(participant.email, 'E-posta')}>
                      <div className="min-w-0">
                         <span className="text-[8px] font-black text-slate-400 uppercase block">Kurumsal Email</span>
                         <span className="text-[11px] font-bold text-slate-700 truncate block">{participant.email || 'Email aranıyor...'}</span>
                      </div>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-blue-50 transition-all cursor-pointer" onClick={() => copyToClipboard(participant.phone, 'Telefon')}>
                      <div className="min-w-0">
                         <span className="text-[8px] font-black text-slate-400 uppercase block">Direkt Telefon</span>
                         <a href={`tel:${participant.phone}`} className="text-[11px] font-black text-slate-900 truncate block hover:text-blue-600">{participant.phone || 'Numara aranıyor...'}</a>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Dijital Ayak İzi</span>
                <div className="flex flex-wrap gap-2">
                   <a href={participant.website} target="_blank" className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black uppercase hover:scale-105 transition-all">Web</a>
                   {participant.linkedin && <a href={participant.linkedin} target="_blank" className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm shadow-lg">in</a>}
                   {participant.instagram && <a href={participant.instagram} target="_blank" className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-sm shadow-lg">ig</a>}
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                   <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Akıllı Teklif Editörü</h3>
                   <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Doğal Dil Aktif</span>
                </div>
                {copyStatus && <span className="text-[9px] font-black text-emerald-500 uppercase animate-bounce">{copyStatus} Kopyalandı!</span>}
             </div>

             <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">E-posta Konusu</label>
                   <input 
                     type="text" 
                     value={subject} 
                     onChange={(e) => setSubject(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[11px] font-black text-slate-900 outline-none focus:border-blue-400 transition-all" 
                   />
                </div>

                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Mesaj İçeriği (Paragraf Düzeni)</label>
                   <textarea 
                     value={draft} 
                     onChange={(e) => setDraft(e.target.value)}
                     className="w-full h-96 bg-white border border-slate-100 rounded-2xl p-6 text-[12px] text-slate-700 leading-relaxed outline-none resize-none font-medium focus:border-blue-400 transition-all custom-scrollbar"
                   />
                </div>

                <div className="pt-6 border-t border-slate-50">
                   <label className="text-[9px] font-black text-blue-500 uppercase mb-3 block">Otomatik İmza Taslağı</label>
                   <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <div className="text-[11px] font-bold text-slate-400 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: signature }} />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-slate-50 bg-white shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
         <div className="flex gap-4">
            <button 
              onClick={handleInternalSend} 
              disabled={isSending || !participant.email}
              className={`flex-1 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                !participant.email ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-200'
              }`}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>GMAIL İLE GÖNDER <span className="text-xl">📤</span></>
              )}
            </button>
            <button 
              onClick={() => copyToClipboard(`${subject}\n\n${draft}\n${signature.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')}`, 'Tüm Mesaj')}
              className="w-16 h-full bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl hover:bg-blue-600 transition-all"
            >
              📋
            </button>
         </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
