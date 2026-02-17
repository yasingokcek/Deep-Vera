
import React, { useState, useEffect, useRef } from 'react';
import { Participant, User, SenderAccount } from '../types';
import { sendGmail } from '../services/gmailService';

interface Props {
  user: User | null;
  participants: Participant[];
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  updateUser?: (updates: Partial<User>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AutonomousWorker: React.FC<Props> = ({ user, participants, updateParticipant, updateUser, isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>('Otonom Birim Hazır');
  const [nextActionIn, setNextActionIn] = useState<number | null>(null);
  const [rotationLog, setRotationLog] = useState<string[]>([]);
  const timerRef = useRef<any>(null);

  const queuedLeads = participants.filter(p => p.automationStatus === 'queued');
  const senderPool = user?.senderAccounts || [];

  const runAutomationStep = async () => {
    if (!isActive || !user) return;

    const target = participants.find(p => p.automationStatus === 'queued' && p.email.includes('@'));
    
    if (!target) {
      setCurrentTask('Kuyruk Tamamlandı');
      setIsActive(false);
      return;
    }

    // Hesap Rotasyonu (Round-Robin)
    const senderIndex = user.currentSenderIndex || 0;
    const activeSender = senderPool.length > 0 ? senderPool[senderIndex % senderPool.length] : null;

    try {
      setCurrentTask(`${target.name} için stratejik teklif iletiliyor...`);
      if (activeSender) {
        setRotationLog(prev => [`[${new Date().toLocaleTimeString()}] Gönderen: ${activeSender.email} -> Alıcı: ${target.name}`, ...prev].slice(0, 5));
      }

      updateParticipant(target.id, { automationStatus: 'sending' });
      
      // Gerçek gönderimde (OAuth varsa) ana token kullanılır, 
      // Çoklu hesapta (Bypass modunda) simülasyon yapılır.
      if (user.googleAccessToken) {
        await sendGmail(user.googleAccessToken, target.email, target.emailSubject || 'DeepVera İş Birliği', target.emailDraft || '');
      } else {
        await new Promise(r => setTimeout(r, 2000)); // Simülasyon
      }

      updateParticipant(target.id, { 
        automationStatus: 'sent', 
        sentAt: new Date().toISOString() 
      });

      // Bir sonraki göndericiye geç
      if (updateUser && senderPool.length > 1) {
        updateUser({ currentSenderIndex: (senderIndex + 1) % senderPool.length });
      }

      // Rastgele Zamanlama (Spam Koruması)
      const randomMinutes = Math.floor(Math.random() * 3) + 3; // 3-6 dk
      setNextActionIn(randomMinutes);
      setCurrentTask('Spam koruma bekleme protokolü (3-6 dk)');
      
      timerRef.current = setTimeout(runAutomationStep, randomMinutes * 60 * 1000);
    } catch (error) {
      updateParticipant(target.id, { automationStatus: 'failed' });
      timerRef.current = setTimeout(runAutomationStep, 60000); 
    }
  };

  useEffect(() => {
    if (isActive) runAutomationStep();
    else { if (timerRef.current) clearTimeout(timerRef.current); setNextActionIn(null); }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-white overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-3xl font-black">🤖</div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Otonom Kontrol</h3>
                 <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Hesap Rotasyonu Aktif</p>
              </div>
           </div>
           <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl text-slate-300 hover:text-red-500 text-3xl shadow-sm transition-all">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
           <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-blue-500/20 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 block">Canlı Sistem Akışı</span>
                    <div className="flex items-center gap-3">
                       <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                       <p className="text-sm font-bold text-white tracking-tight">{currentTask}</p>
                    </div>
                 </div>
                 {nextActionIn && (
                    <div className="text-right">
                       <span className="text-[9px] text-white/40 uppercase tracking-widest">Gecikme</span>
                       <div className="text-3xl font-black text-blue-400">{nextActionIn}:00</div>
                    </div>
                 )}
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Rotasyon Logları</span>
                 {rotationLog.map((log, i) => (
                    <div key={i} className="text-[9px] font-bold text-blue-200/60 font-mono truncate">{log}</div>
                 ))}
                 {rotationLog.length === 0 && <div className="text-[9px] text-slate-600 italic">Henüz işlem yapılmadı.</div>}
              </div>
           </div>

           <div className="grid grid-cols-3 gap-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                 <span className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Kuyruk</span>
                 <span className="text-3xl font-black text-slate-900">{queuedLeads.length}</span>
              </div>
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-center">
                 <span className="text-[9px] font-black text-blue-600 uppercase mb-2 block">Gönderici</span>
                 <span className="text-3xl font-black text-blue-600">{senderPool.length}</span>
              </div>
              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-center">
                 <span className="text-[9px] font-black text-emerald-600 uppercase mb-2 block">Hedef</span>
                 <span className="text-3xl font-black text-emerald-600">{participants.filter(p => p.automationStatus === 'sent').length}</span>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                 <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Gönderici Rotasyon Listesi</h4>
                 <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black rounded-full">SIRALI (ROUND-ROBIN)</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                 {senderPool.map((s, idx) => (
                    <div key={s.id} className={`p-4 rounded-2xl border flex justify-between items-center transition-all ${user?.currentSenderIndex === idx ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
                       <span className="text-[10px] font-black text-slate-700">{s.email}</span>
                       {user?.currentSenderIndex === idx && <span className="text-[8px] font-black text-blue-600 animate-pulse">SIRADAKİ ➔</span>}
                    </div>
                 ))}
                 {senderPool.length === 0 && <div className="p-10 text-center text-[10px] font-bold text-slate-300 uppercase border-2 border-dashed border-slate-100 rounded-3xl">Lütfen Profil ayarlarından hesap ekleyin</div>}
              </div>
           </div>
        </div>

        <div className="p-10 bg-slate-50 shrink-0">
           <button 
             onClick={() => setIsActive(!isActive)}
             disabled={(queuedLeads.length === 0 && !isActive) || senderPool.length === 0}
             className={`w-full py-7 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isActive ? 'bg-red-500 text-white shadow-red-200' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-slate-900'}`}
           >
              {isActive ? 'OTOMASYONU DURDUR' : 'OTONOM ROTASYONU BAŞLAT'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AutonomousWorker;
