
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface Props {
  user: User | null;
  onClose: () => void;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  read: boolean;
}

const GmailCenter: React.FC<Props> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts'>('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
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
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=label:${labelMap[activeTab]}`,
        { headers: { Authorization: `Bearer ${user?.googleAccessToken}` } }
      );

      if (!response.ok) throw new Error('Gmail API hatası. Lütfen tekrar giriş yapın.');

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
          
          const getHeader = (name: string) => detail.payload.headers.find((h: any) => h.name === name)?.value || '';
          
          return {
            id: detail.id,
            from: getHeader('From'),
            subject: getHeader('Subject'),
            date: new Date(getHeader('Date')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  return (
    <div className="fixed inset-0 z-[150] bg-[#f8fafc] flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center text-lg font-black shadow-lg">M</div>
            <div>
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Gmail Komuta Merkezi</h2>
               <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">Gerçek Zamanlı Senkronizasyon: {user?.email}</p>
            </div>
         </div>
         <button onClick={onClose} className="w-10 h-10 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl flex items-center justify-center transition-all text-slate-400 text-xl font-bold">&times;</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar */}
         <div className="w-72 bg-white border-r border-slate-50 p-6 flex flex-col gap-2 shrink-0">
            <button className="w-full h-12 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest mb-6 shadow-xl shadow-blue-100 hover:scale-105 transition-all">Yeni Mesaj Yaz</button>
            
            {[
               { id: 'inbox', label: 'Gelen Kutusu', icon: '📥' },
               { id: 'sent', label: 'Gönderilenler', icon: '📤' },
               { id: 'drafts', label: 'Taslaklar', icon: '📝' }
            ].map(item => (
               <button 
                 key={item.id}
                 onClick={() => setActiveTab(item.id as any)}
                 className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                  <div className="flex items-center gap-3">
                     <span className="text-sm">{item.icon}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
               </button>
            ))}

            <div className="mt-auto p-6 bg-slate-900 rounded-[2rem] border border-blue-500/30">
               <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-2 block">Operasyonel Durum</span>
               <p className="text-[9px] text-white/70 font-bold leading-relaxed italic">
                 {user?.googleAccessToken ? 'Google API Yetkisi Alındı. Gerçek veriler listeleniyor.' : 'Demo modu aktif. Gerçek veriler için Gmail ile giriş yapın.'}
               </p>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 bg-slate-50/30 flex flex-col overflow-hidden">
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
               {loading ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 animate-pulse">
                     <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                     <span className="text-[10px] font-black uppercase tracking-[0.4em]">Gmail Kutusu Taranıyor...</span>
                  </div>
               ) : error ? (
                  <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                     <div className="text-4xl mb-4">⚠️</div>
                     <h3 className="text-sm font-black text-slate-900 uppercase">{error}</h3>
                     <p className="text-[9px] font-bold text-slate-400 mt-2">Token süresi dolmuş olabilir. Lütfen çıkış yapıp tekrar Gmail ile bağlanın.</p>
                  </div>
               ) : emails.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                     <div className="text-4xl mb-4">📭</div>
                     <h3 className="text-sm font-black text-slate-900 uppercase">E-posta Bulunamadı</h3>
                  </div>
               ) : (
                  <div className="space-y-3">
                     {emails.map(email => (
                        <div key={email.id} className={`p-6 bg-white border rounded-[2rem] flex items-center gap-6 cursor-pointer hover:shadow-xl transition-all group ${!email.read ? 'border-blue-200 ring-1 ring-blue-50 shadow-md' : 'border-slate-100'}`}>
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${!email.read ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              {email.from.charAt(0)}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                 <h4 className={`text-[10px] font-black uppercase truncate ${!email.read ? 'text-slate-900' : 'text-slate-400'}`}>{email.from}</h4>
                                 <span className="text-[9px] font-bold text-slate-300">{email.date}</span>
                              </div>
                              <h5 className="text-[10px] font-black text-slate-700 mb-1">{email.subject}</h5>
                              <p className="text-[9px] text-slate-400 truncate font-medium">{email.snippet}</p>
                           </div>
                           <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                              <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">Yanıtla</button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default GmailCenter;
