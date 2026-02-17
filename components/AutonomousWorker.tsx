
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
  const [currentTask, setCurrentTask] = useState<string>('Hazır');
  const [rotationLog, setRotationLog] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number>(0);
  const timerRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);

  const queuedLeads = participants.filter(p => p.automationStatus === 'queued');
  const senderPool = user?.senderAccounts || [];

  const runAutomationStep = async () => {
    if (!isActive || !user) return;

    // 1. Sıradaki Lead'i Bul
    const target = participants.find(p => p.automationStatus === 'queued' && p.email.includes('@'));
    
    if (!target) {
      setCurrentTask('Tamamlandı');
      setIsActive(false);
      return;
    }

    // 2. N8N Mimarisinde 'Credential Rotation' (Round-Robin)
    const senderIndex = user.currentSenderIndex || 0;
    const activeSender = senderPool.length > 0 ? senderPool[senderIndex % senderPool.length] : null;

    if (!activeSender) {
      setCurrentTask('GÖNDERİCİ YOK!');
      setIsActive(false);
      return;
    }

    try {
      setCurrentTask(`${target.name} gönderiliyor...`);
      setRotationLog(prev => [`[${new Date().toLocaleTimeString()}] İŞLEM: ${activeSender.email} üzerinden gönderildi.`, ...prev].slice(0, 10));

      updateParticipant(target.id, { automationStatus: 'sending' });
      
      // 3. TASLAKSIZ DİREKT GÖNDERİM
      await sendGmail(activeSender.accessToken, target.email, target.emailSubject || 'İş Birliği Teklifi', target.emailDraft || '');

      updateParticipant(target.id, { 
        automationStatus: 'sent', 
        sentAt: new Date().toISOString() 
      });

      // 4. Sıradaki Göndericiye Geç
      if (updateUser && senderPool.length > 0) {
        updateUser({ currentSenderIndex: (senderIndex + 1) % senderPool.length });
      }

      // 5. N8N 'WAIT' PROTOKOLÜ: 7-8 DAKİKA RASTGELE BEKLEME
      // Mühendislik Kararı: 420sn (7dk) + 0-60sn (Jitter) = 7-8 Dakika Arası
      const randomWait = 420 + Math.floor(Math.random() * 60);
      setCountdown(randomWait);
      setCurrentTask('Anti-Spam Bekleme...');
      
      timerRef.current = setTimeout(runAutomationStep, randomWait * 1000);
    } catch (error: any) {
      console.error(error);
      updateParticipant(target.id, { automationStatus: 'failed' });
      setRotationLog(prev => [`[${new Date().toLocaleTimeString()}] HATA: İletim başarısız.`, ...prev].slice(0, 10));
      
      // Hata olsa bile 2 dk sonra diğerine geçmeyi dene
      timerRef.current = setTimeout(runAutomationStep, 120000); 
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else {
      clearInterval(countdownRef.current);
    }
    return () => clearInterval(countdownRef.current);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if (isActive) runAutomationStep();
    else if (timerRef.current) clearTimeout(timerRef.current);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-slate-900/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.8rem] flex items-center justify-center text-4xl font-black shadow-2xl">🤖</div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Otonom Sevk Ünitesi</h3>
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-2 italic">N8N Simulation Engine v4.0</p>
              </div>
           </div>
           <button onClick={onClose} className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl text-slate-300 hover:text-red-500 text-4xl shadow-sm transition-all">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
           
           <div className="p-10 bg-slate-900 rounded-[3rem] border border-blue-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px]"></div>
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                 <div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-4 block">Durum</span>
                    <div className="flex items-center gap-4">
                       <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`}></div>
                       <p className="text-xl font-black text-white">{currentTask}</p>
                    </div>
                 </div>
                 {countdown > 0 && (
                    <div className="text-right">
                       <span className="text-[10px] text-white/30 uppercase tracking-[0.4em] mb-2 block">Kalan Bekleme</span>
                       <div className="text-5xl font-black text-blue-400 font-mono tracking-tighter">{formatTime(countdown)}</div>
                    </div>
                 )}
              </div>
              
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5">
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.6em] mb-3 block">Sistem Günlüğü</span>
                 <div className="space-y-2 h-32 overflow-y-auto custom-scrollbar pr-2">
                    {rotationLog.map((log, i) => (
                       <div key={i} className="text-[10px] font-bold font-mono text-blue-100/40 truncate">{log}</div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-6">
              <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Kuyruk</span>
                 <span className="text-5xl font-black text-slate-900">{queuedLeads.length}</span>
              </div>
              <div className="p-10 bg-blue-50 rounded-[2.5rem] border border-blue-100 text-center">
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 block">Hesaplar</span>
                 <span className="text-5xl font-black text-blue-600">{senderPool.length}</span>
              </div>
              <div className="p-10 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 text-center">
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 block">Başarı</span>
                 <span className="text-5xl font-black text-emerald-600">{participants.filter(p => p.automationStatus === 'sent').length}</span>
              </div>
           </div>
        </div>

        <div className="p-10 bg-slate-50 shrink-0 border-t border-slate-100">
           <button 
             onClick={() => setIsActive(!isActive)}
             disabled={(queuedLeads.length === 0 && !isActive) || senderPool.length === 0}
             className={`w-full py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-6 ${
               isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-slate-900 shadow-blue-400'
             }`}
           >
              {isActive ? (
                <>DÖNGÜYÜ DURDUR <span className="text-3xl">⏹</span></>
              ) : (
                <>OTONOM SEVKI BAŞLAT <span className="text-3xl">⚡</span></>
              )}
           </button>
           <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-8">
              * Teknik: Her işlem arası 7-8 dk beklenir. Tarayıcı sekmesini kapatmayın.
           </p>
        </div>
      </div>
    </div>
  );
};

export default AutonomousWorker;
