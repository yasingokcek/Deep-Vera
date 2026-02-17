
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

    const target = participants.find(p => p.automationStatus === 'queued' && p.email.includes('@'));
    
    if (!target) {
      setCurrentTask('Tamamlandı');
      setIsActive(false);
      return;
    }

    const senderIndex = user.currentSenderIndex || 0;
    const activeSender = senderPool.length > 0 ? senderPool[senderIndex % senderPool.length] : null;

    if (!activeSender) {
      setCurrentTask('GÖNDERİCİ YOK!');
      setIsActive(false);
      return;
    }

    try {
      setCurrentTask(`${target.name} firmasına gönderim yapılıyor...`);
      updateParticipant(target.id, { automationStatus: 'sending' });
      
      await sendGmail(activeSender.accessToken, target.email, target.emailSubject || 'İş Birliği Teklifi', target.emailDraft || '');

      setRotationLog(prev => [`[${new Date().toLocaleTimeString()}] ${target.name} → ${activeSender.email} (BAŞARILI)`, ...prev].slice(0, 15));

      updateParticipant(target.id, { 
        automationStatus: 'sent', 
        funnelStatus: 'contacted',
        sentAt: new Date().toISOString(),
        sentFromEmail: activeSender.email // Künye bilgisi eklendi
      });

      if (updateUser && senderPool.length > 0) {
        updateUser({ currentSenderIndex: (senderIndex + 1) % senderPool.length });
      }

      const randomWait = 420 + Math.floor(Math.random() * 60);
      setCountdown(randomWait);
      setCurrentTask('Anti-Spam Koruması Bekleniyor...');
      
      timerRef.current = setTimeout(runAutomationStep, randomWait * 1000);
    } catch (error: any) {
      console.error(error);
      updateParticipant(target.id, { automationStatus: 'failed' });
      setRotationLog(prev => [`[${new Date().toLocaleTimeString()}] HATA: ${target.name} (İletilemedi)`, ...prev].slice(0, 15));
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
    <div className="fixed inset-0 z-[1100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-white">
        
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl">🤖</div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Otonom Sevk Ünitesi</h3>
                 <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1 italic">N8N Simulation Core v5.0</p>
              </div>
           </div>
           <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl text-slate-300 hover:text-red-500 text-3xl shadow-sm transition-all">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-slate-50/20">
           
           <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px]"></div>
              
              <div className="relative z-10 flex justify-between items-center mb-8">
                 <div>
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 block">Operasyonel Durum</span>
                    <h4 className="text-2xl font-black text-white">{currentTask}</h4>
                 </div>
                 {countdown > 0 && (
                    <div className="text-right">
                       <span className="text-[9px] text-white/40 uppercase tracking-widest mb-1 block">Anti-Spam Sayaç</span>
                       <div className="text-4xl font-black text-blue-400 font-mono">{formatTime(countdown)}</div>
                    </div>
                 )}
              </div>

              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-8">
                 <div className={`h-full bg-blue-500 transition-all duration-1000 ${isActive ? 'w-full animate-pulse' : 'w-0'}`}></div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 block italic">Otonom İşlem Günlüğü</span>
                 <div className="space-y-2 h-40 overflow-y-auto custom-scrollbar pr-2 text-[10px] font-mono text-blue-100/60">
                    {rotationLog.length === 0 ? 'Sistem başlatılmaya hazır...' : rotationLog.map((log, i) => (
                       <div key={i} className="flex gap-4 border-b border-white/5 pb-2">
                          <span className="text-blue-400">#</span>
                          <span>{log}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-6">
              <div className="p-8 bg-white border border-slate-100 rounded-[2rem] text-center shadow-sm">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Kuyruk</span>
                 <span className="text-4xl font-black text-slate-900">{queuedLeads.length}</span>
              </div>
              <div className="p-8 bg-white border border-slate-100 rounded-[2rem] text-center shadow-sm">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Aktif Kanallar</span>
                 <span className="text-4xl font-black text-blue-600">{senderPool.length}</span>
              </div>
              <div className="p-8 bg-white border border-slate-100 rounded-[2rem] text-center shadow-sm">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Başarı Oranı</span>
                 <span className="text-4xl font-black text-emerald-600">%{participants.length > 0 ? Math.round((participants.filter(p => p.automationStatus === 'sent').length / participants.length) * 100) : 0}</span>
              </div>
           </div>
        </div>

        <div className="p-10 bg-white border-t border-slate-100 shrink-0">
           <button 
             onClick={() => setIsActive(!isActive)}
             disabled={(queuedLeads.length === 0 && !isActive) || senderPool.length === 0}
             className={`w-full py-7 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-6 ${
               isActive ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'
             }`}
           >
              {isActive ? 'DÖNGÜYÜ DURDUR' : 'OTONOM GÖNDERİMİ BAŞLAT'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AutonomousWorker;
