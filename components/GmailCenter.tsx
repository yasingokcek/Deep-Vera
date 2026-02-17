
import React, { useState, useEffect } from 'react';
import { User, Participant } from '../types';

interface Props {
  user: User | null;
  onClose: () => void;
  participants?: Participant[];
  updateParticipant?: (id: string, updates: Partial<Participant>) => void;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  read: boolean;
  rawFrom: string; // Sadece email adresi
}

const GmailCenter: React.FC<Props> = ({ user, onClose, participants = [], updateParticipant }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts'>('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.googleAccessToken) {
      fetchRealEmails();
    }
  }, [user, activeTab]);

  const fetchRealEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const labelMap = { inbox: 'INBOX', sent: 'SENT', drafts: 'DRAFT' };
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=label:${labelMap[activeTab]}`,
        { headers: { Authorization: `Bearer ${user?.googleAccessToken}` } }
      );

      if (!response.ok) throw new Error('Gmail API hatası. Oturum süresi dolmuş olabilir.');

      const data = await response.json();
      if (!data.messages) {
        setEmails([]);
        setLoading(false);
        return;
      }

      const emailDetails = await Promise.all(
        data.messages.map(async (msg: any) => {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
            { headers: { Authorization: `Bearer ${user?.googleAccessToken}` } }
          );
          const detail = await detailRes.json();
          const fromHeader = detail.payload.headers.find((h: any) => h.name === 'From')?.value || '';
          const subjectHeader = detail.payload.headers.find((h: any) => h.name === 'Subject')?.value || '';
          const dateHeader = detail.payload.headers.find((h: any) => h.name === 'Date')?.value || '';
          
          // E-posta adresini extract et (Regex: example@mail.com)
          const emailMatch = fromHeader.match(/<(.+)>|(\S+@\S+\.\S+)/);
          const rawEmail = emailMatch ? (emailMatch[1] || emailMatch[2]) : fromHeader;

          return {
            id: detail.id,
            from: fromHeader,
            rawFrom: rawEmail.toLowerCase().trim(),
            subject: subjectHeader,
            date: new Date(dateHeader).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            snippet: detail.snippet,
            read: !detail.labelIds.includes('UNREAD')
          };
        })
      );

      setEmails(emailDetails);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // NÖRAL SENKRONİZASYON: Gelen kutusunu tara ve Participant listesiyle eşleştir
  const handleNeuralSync = async () => {
    if (!updateParticipant || participants.length === 0) return;
    setSyncing(true);
    
    let matchedCount = 0;
    
    // Sadece gelen kutusundaki emailleri tara
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=label:INBOX`,
      { headers: { Authorization: `Bearer ${user?.googleAccessToken}` } }
    );
    const data = await response.json();
    
    if (data.messages) {
      for (const msg of data.messages) {
        const detail = await (await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${user?.googleAccessToken}` }
        })).json();
        
        const fromHeader = detail.payload.headers.find((h: any) => h.name === 'From')?.value || '';
        const emailMatch = fromHeader.match(/<(.+)>|(\S+@\S+\.\S+)/);
        const incomingEmail = (emailMatch ? (emailMatch[1] || emailMatch[2]) : fromHeader).toLowerCase().trim();

        // Katılımcı listemizde bu e-posta var mı?
        const matchedLead = participants.find(p => p.email.toLowerCase().trim() === incomingEmail);
        
        if (matchedLead && matchedLead.funnelStatus !== 'replied') {
          updateParticipant(matchedLead.id, { 
            funnelStatus: 'replied',
            repliedAt: new Date().toISOString()
          });
          matchedCount++;
        }
      }
    }

    setSyncing(false);
    alert(`${matchedCount} yeni firma cevabı tespit edildi ve sisteme işlendi!`);
    fetchRealEmails();
  };

  return (
    <div className="fixed inset-0 z-[600] bg-[#f8fafc] flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 shadow-sm">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl">M</div>
            <div>
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Gmail Komuta Merkezi</h2>
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-2">Nöral İstihbarat Aktif</p>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <button 
              onClick={handleNeuralSync}
              disabled={syncing || loading}
              className={`h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl ${
                syncing ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white hover:bg-slate-900'
              }`}
            >
               {syncing ? 'TARANIYOR...' : 'SİSTEMİ SENKRONİZE ET'}
               <span className="text-xl">🧠</span>
            </button>
            <button onClick={onClose} className="w-14 h-14 bg-slate-50 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all text-slate-400 text-3xl font-bold">&times;</button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar */}
         <div className="w-80 bg-white border-r border-slate-50 p-8 flex flex-col gap-3 shrink-0">
            <button className="w-full h-14 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest mb-8 shadow-2xl shadow-blue-100 hover:scale-105 transition-all">Yeni Mesaj Yaz</button>
            
            {[
               { id: 'inbox', label: 'Gelen Kutusu', icon: '📥' },
               { id: 'sent', label: 'Gönderilenler', icon: '📤' },
               { id: 'drafts', label: 'Taslaklar', icon: '📝' }
            ].map(item => (
               <button 
                 key={item.id}
                 onClick={() => setActiveTab(item.id as any)}
                 className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                  <div className="flex items-center gap-4">
                     <span className="text-xl">{item.icon}</span>
                     <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
               </button>
            ))}

            <div className="mt-auto p-8 bg-slate-900 rounded-[3rem] border border-blue-500/30 shadow-2xl">
               <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3 block">Akıllı Takip</span>
               <p className="text-[11px] text-white/70 font-bold leading-relaxed italic opacity-80">
                 Gelen kutusuna düşen yanıtlar, DeepVera tarafından analiz edilerek satış hunisine (Funnel) otomatik olarak işlenir.
               </p>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 bg-slate-50/30 flex flex-col overflow-hidden">
            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
               {loading ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 animate-pulse">
                     <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                     <span className="text-xs font-black uppercase tracking-[0.4em]">E-postalar Analiz Ediliyor...</span>
                  </div>
               ) : error ? (
                  <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                     <div className="text-6xl mb-6">⚠️</div>
                     <h3 className="text-xl font-black text-slate-900 uppercase">{error}</h3>
                     <p className="text-sm font-bold text-slate-400 mt-4">Güvenlik anahtarı yenilenmeli. Lütfen tekrar bağlanın.</p>
                  </div>
               ) : emails.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                     <div className="text-6xl mb-6">📭</div>
                     <h3 className="text-xl font-black text-slate-900 uppercase">Mesaj Bulunamadı</h3>
                  </div>
               ) : (
                  <div className="space-y-4 max-w-5xl mx-auto">
                     {emails.map(email => {
                        const isMatch = participants.some(p => p.email.toLowerCase().trim() === email.rawFrom);
                        return (
                          <div key={email.id} className={`p-8 bg-white border rounded-[2.5rem] flex items-center gap-8 cursor-pointer hover:shadow-2xl transition-all group relative ${!email.read ? 'border-blue-400 shadow-xl' : 'border-slate-100'}`}>
                             {isMatch && (
                               <div className="absolute -top-3 -right-3 px-4 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-full shadow-lg z-10 animate-bounce">
                                 SİSTEMDE KAYITLI FİRMA
                               </div>
                             )}
                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ${!email.read ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                                {email.from.charAt(0)}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-2">
                                   <h4 className={`text-[12px] font-black uppercase truncate ${!email.read ? 'text-slate-900' : 'text-slate-400'}`}>{email.from}</h4>
                                   <span className="text-[10px] font-black text-slate-300 uppercase">{email.date}</span>
                                </div>
                                <h5 className="text-[13px] font-black text-slate-800 mb-2 truncate">{email.subject}</h5>
                                <p className="text-[11px] text-slate-500 truncate font-medium opacity-70">{email.snippet}</p>
                             </div>
                             <div className="opacity-0 group-hover:opacity-100 flex gap-3 transition-all">
                                <button className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">Görüntüle</button>
                             </div>
                          </div>
                        );
                     })}
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default GmailCenter;
