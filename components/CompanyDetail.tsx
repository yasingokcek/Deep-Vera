
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
    <div className="fixed inset-y-0 right-0 w-full sm:w-[850px] bg-white shadow-[-40px_0_100px_rgba(0,0,0,0.3)] z-[500] flex flex-col border-l border-slate-100 animate-fade-in overflow-hidden">
      
      {/* Top Navigation */}
      <div className="p-8 border-b border-slate-50 flex justify-between items-center shrink-0 bg-white/95 backdrop-blur-md sticky top-0 z-20">
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
          
          {/* İletişim & Sosyal Medya Şeridi - GERİ GETİRİLDİ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg">📞</div>
                   <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">İrtibat Kanalları</h3>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center justify-between group cursor-pointer" onClick={() => copyToClipboard(participant.phone, 'Telefon')}>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TELEFON:</span>
                      <span className="text-[14px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">{participant.phone || 'N/A'}</span>
                   </div>
                   <div className="flex items-center justify-between group cursor-pointer" onClick={() => copyToClipboard(participant.email, 'E-posta')}>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">E-POSTA:</span>
                      <span className="text-[14px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">{participant.email || 'N/A'}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WEB ADRESİ:</span>
                      <a href={participant.website} target="_blank" className="text-[14px] font-black text-blue-600 hover:underline">{participant.website ? 'Ziyaret Et ➔' : 'N/A'}</a>
                   </div>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg">🌍</div>
                   <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">Dijital Ayak İzleri</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {participant.linkedin && (
                      <a href={participant.linkedin} target="_blank" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-slate-100 hover:border-blue-600 group">
                         <span className="text-2xl">🔗</span>
                         <span className="text-[10px] font-black uppercase tracking-widest">LinkedIn</span>
                      </a>
                   )}
                   {participant.instagram && (
                      <a href={participant.instagram} target="_blank" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-pink-600 hover:text-white transition-all border border-slate-100 hover:border-pink-600">
                         <span className="text-2xl">📸</span>
                         <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                      </a>
                   )}
                   {participant.facebook && (
                      <a href={participant.facebook} target="_blank" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-800 hover:text-white transition-all border border-slate-100 hover:border-blue-800">
                         <span className="text-2xl">👥</span>
                         <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                      </a>
                   )}
                   {participant.twitter && (
                      <a href={participant.twitter} target="_blank" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100 hover:border-slate-900">
                         <span className="text-2xl">🐦</span>
                         <span className="text-[10px] font-black uppercase tracking-widest">Twitter</span>
                      </a>
                   )}
                   {(!participant.linkedin && !participant.instagram && !participant.facebook && !participant.twitter) && (
                      <div className="col-span-2 py-8 text-center text-[10px] font-black text-slate-300 uppercase italic border-2 border-dashed border-slate-50 rounded-[2rem]">
                         Sosyal bağlantı tespit edilemedi
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* Stratejik İstihbarat Paneli */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-sm">⚔️</div>
                   <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Analiz Edilen Rakipler</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                   {participant.competitors?.map((comp, i) => (
                      <span key={i} className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-tight group-hover:bg-blue-50 transition-colors">{comp}</span>
                   )) || <span className="text-[10px] text-slate-400 italic">Veri aranıyor...</span>}
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-sm">🎯</div>
                   <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Kritik Acı Noktaları</h3>
                </div>
                <div className="space-y-4">
                   {participant.painPoints?.map((point, i) => (
                      <div key={i} className="flex gap-4">
                         <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                         <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase">{point}</p>
                      </div>
                   )) || <span className="text-[10px] text-slate-400 italic">Analiz ediliyor...</span>}
                </div>
             </div>
          </div>

          {/* E-posta Taslağı */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl relative">
             <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 text-xl">🤖</div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Nöral Satış Taslağı (V5)</h3>
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em] mt-2">Paragraf Düzeni Korumalı</p>
                   </div>
                </div>
                {copyStatus && <span className="text-[10px] font-black text-emerald-600 uppercase animate-bounce bg-emerald-50 px-4 py-2 rounded-full">{copyStatus} KOPYALANDI</span>}
             </div>

             <div className="space-y-8">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 block ml-3 italic">Konu Başlığı</label>
                   <input 
                     type="text" 
                     value={subject} 
                     onChange={(e) => setSubject(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-7 text-[13px] font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner" 
                   />
                </div>

                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 block ml-3 italic">Mesaj Gövdesi (3-Paragraf Protokolü)</label>
                   <div className="relative group">
                      <textarea 
                        value={draft} 
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-full h-[550px] bg-white border border-slate-200 rounded-[2.5rem] p-10 text-[14px] text-slate-700 leading-[1.85] outline-none resize-none font-medium focus:border-blue-500 transition-all custom-scrollbar shadow-xl"
                      />
                      <button onClick={() => copyToClipboard(draft, 'Taslak')} className="absolute bottom-8 right-8 w-16 h-16 bg-slate-900 text-white rounded-2xl text-2xl hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center justify-center">📋</button>
                   </div>
                </div>

                <div className="p-10 bg-slate-900 rounded-[2.5rem] border border-blue-500/20 shadow-2xl">
                   <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-5 block">Kurumsal İmza Verisi</label>
                   <div className="text-[12px] font-bold text-white/60 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: signature }} />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-10 border-t border-slate-50 bg-white shrink-0 shadow-[0_-40px_80px_rgba(0,0,0,0.06)]">
         <div className="flex gap-6 h-20">
            <button 
              onClick={handleInternalSend} 
              disabled={isSending || !participant.email}
              className={`flex-1 rounded-[2.2rem] font-black text-[13px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-5 ${
                !participant.email ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-300 hover:bg-slate-900'
              }`}
            >
              {isSending ? (
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>SİSTEMDEN ŞİMDİ GÖNDER <span className="text-2xl">⚡</span></>
              )}
            </button>
            <button 
              onClick={() => copyToClipboard(`${subject}\n\n${draft}\n${signature.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')}`, 'Tüm Paket')}
              className="w-24 h-full bg-slate-50 text-slate-900 rounded-[2.2rem] flex items-center justify-center text-3xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm"
              title="Her şeyi kopyala"
            >
              📥
            </button>
         </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
