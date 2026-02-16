
import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  user: User | null;
  onClose: () => void;
}

const GmailCenter: React.FC<Props> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts'>('inbox');
  
  const mockEmails = [
    { id: 1, from: 'Ahmet Yılmaz (LC Waikiki)', subject: 'Yeni Sezon Teklifiniz Hakkında', date: '10:45', snippet: 'Gönderdiğiniz yapay zeka destekli verimlilik raporunu inceledik...', read: false },
    { id: 2, from: 'DeepVera AI', subject: 'Haftalık İstihbarat Özeti', date: '09:12', snippet: 'Geçen hafta Sidney bölgesinde 42 yeni potansiyel müşteri bulundu.', read: true },
    { id: 3, from: 'Global Lojistik A.Ş.', subject: 'Fiyat Teklifi Talebi', date: 'Dün', snippet: 'Fuar katılımcıları listenizdeki firmalara özel lojistik çözümleri için...', read: true },
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-[#f8fafc] flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-lg font-black shadow-sm">M</div>
            <div>
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Gmail Komuta Merkezi</h2>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">{user?.email}</p>
            </div>
         </div>
         <button onClick={onClose} className="w-10 h-10 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl flex items-center justify-center transition-all text-slate-400 text-xl font-bold">&times;</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar */}
         <div className="w-72 bg-white border-r border-slate-50 p-6 flex flex-col gap-2 shrink-0">
            <button className="w-full h-12 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest mb-6 shadow-xl shadow-blue-100 hover:scale-105 transition-all">Yeni Mesaj Yaz</button>
            
            {[
               { id: 'inbox', label: 'Gelen Kutusu', icon: '📥', count: 3 },
               { id: 'sent', label: 'Gönderilenler', icon: '📤', count: 0 },
               { id: 'drafts', label: 'Taslaklar', icon: '📝', count: 12 },
               { id: 'starred', label: 'Yıldızlılar', icon: '⭐', count: 0 }
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
                  {item.count > 0 && <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${activeTab === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{item.count}</span>}
               </button>
            ))}

            <div className="mt-auto p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
               <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-2 block">AI Gücü Aktif</span>
               <p className="text-[9px] text-blue-800 font-bold leading-relaxed italic">DeepVera tüm e-postalarınızı analiz ederek en kritik olanları en üste taşır.</p>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 bg-slate-50/30 flex flex-col overflow-hidden">
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
               <div className="space-y-3">
                  {mockEmails.map(email => (
                     <div key={email.id} className={`p-6 bg-white border rounded-[2rem] flex items-center gap-6 cursor-pointer hover:shadow-xl transition-all group ${!email.read ? 'border-blue-200 ring-1 ring-blue-50 shadow-md' : 'border-slate-100'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${!email.read ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                           {email.from.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-1">
                              <h4 className={`text-[11px] font-black uppercase truncate ${!email.read ? 'text-slate-900' : 'text-slate-400'}`}>{email.from}</h4>
                              <span className="text-[9px] font-bold text-slate-300">{email.date}</span>
                           </div>
                           <h5 className="text-[10px] font-black text-slate-700 mb-1">{email.subject}</h5>
                           <p className="text-[10px] text-slate-400 truncate font-medium">{email.snippet}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                           <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-blue-600">Reply</button>
                           <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-red-500">Trash</button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GmailCenter;
