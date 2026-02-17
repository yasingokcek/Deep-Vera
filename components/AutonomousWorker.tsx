
import React, { useState, useEffect, useRef } from 'react';
import { Participant, User } from '../types';
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
  const [currentTask, setCurrentTask] = useState<string>('Sistem Hazır');
  const [rotationLog, setRotationLog] = useState<{msg: string, type: 'success' | 'error' | 'info'}[]>([]);
  const [countdown, setCountdown] = useState<number>(0);
  const timerRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);

  const queuedLeads = participants.filter(p => p.automationStatus === 'queued');
  const sentLeads = participants.filter(p => p.automationStatus === 'sent');
  const senderPool = user?.senderAccounts || [];
  
  const totalInQueue = queuedLeads.length + sentLeads.length;
  const progressPercentage = totalInQueue > 0 ? (sentLeads.length / totalInQueue) * 100 : 0;

  const addLog = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setRotationLog(prev => [{ msg, type }, ...prev].slice(0, 20));
  };

  const runAutomationStep = async () => {
    if (!isActive || !user) return;

    const target = participants.find(p => p.automationStatus === 'queued' && p.email.includes('@'));
    
    if (!target) {
      setCurrentTask('Tüm Görevler Tamamlandı');
      addLog('Kuyruktaki tüm işlemler başarıyla sonuçlandırıldı.', 'success');
      setIsActive(false);
      return;
    }

    const senderIndex = user.currentSenderIndex || 0;
    const activeSender = senderPool.length > 0 ? senderPool[senderIndex % senderPool.length] : null;

    if (!activeSender) {
      setCurrentTask('Gönderici Kanal Hatası');
      addLog('Sisteme bağlı aktif bir Gmail kanalı bulunamadı!', 'error');
      setIsActive(false);
      return;
    }

    try {
      setCurrentTask(`${target.name} analizi ve gönderimi yapılıyor...`);
      updateParticipant(target.id, { automationStatus: 'sending' });
      
      await sendGmail(activeSender.accessToken, target.email, target.emailSubject || 'İş Birliği Teklifi', target.emailDraft || '');

      addLog(`${target.name} firmasına ${activeSender.email} üzerinden ulaşıldı.`, 'success');

      updateParticipant(target.id, { 
        automationStatus: 'sent', 
        funnelStatus: 'contacted',
        sentAt: new Date().toISOString(),
        sentFromEmail: activeSender.email
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
      addLog(`Hata: ${target.name} iletilemedi. (Bağlantı Sorunu)`, 'error');
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
    <div className="fixed inset-0 z-[1100] bg-slate-950/60 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[90vh] md:h-[85vh] border border-white/50">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-[#0f172a] text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-transparent"></div>
                 <span className="relative z-10 group-hover:scale-110 transition-transform">🤖</span>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Otonom Sevk Ünitesi</h3>
                 <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">DEEPVERA ENGINE V5.0</span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">OTONOM SEVK PROTOKOLÜ</span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-3xl border border-slate-100">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar bg-[#fcfcfd]">
           
           {/* Status Monitor Card */}
           <div className="p-10 bg-[#0f172a] rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] -z-0"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]' : 'bg-slate-600'}`}></div>
                       <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">OPERASYONEL DURUM</span>
                    </div>
                    <h4 className="text-3xl font-black text-white tracking-tight uppercase leading-none">{currentTask}</h4>
                 </div>
                 
                 {countdown > 0 && (
                    <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-[2rem] text-center backdrop-blur-md">
                       <span className="text-[9px] text-blue-300 font-black uppercase tracking-widest mb-1 block">YENİ GÖREV İÇİN BEKLEME</span>
                       <div className="text-3xl font-black text-white font-mono">{formatTime(countdown)}</div>
                    </div>
                 )}
              </div>

              {/* Progress Tracker */}
              <div className="space-y-3 mb-10 relative z-10">
                <div className="flex justify-between items-end px-1">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kuyruk İlerlemesi</span>
                   <span className="text-[12px] font-black text-blue-400">%{Math.round(progressPercentage)}</span>
                </div>
                <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                   <div 
                     className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                     style={{ width: `${progressPercentage}%` }}
                   ></div>
                </div>
              </div>

              {/* Log Console */}
              <div className="bg-black/40 rounded-[2.5rem] p-8 border border-white/5 relative z-10">
                 <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Gerçek Zamanlı İşlem Günlüğü</span>
                    <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                       <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                       <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                    </div>
                 </div>
                 <div className="space-y-3 h-48 overflow-y-auto custom-scrollbar pr-4 text-[11px] font-mono">
                    {rotationLog.length === 0 ? (
                       <div className="text-slate-600 italic">Sistem başlatılmaya hazır. Kuyrukta bekleyen {queuedLeads.length} firma mevcut.</div>
                    ) : rotationLog.map((log, i) => (
                       <div key={i} className={`flex gap-4 pb-3 border-b border-white/5 last:border-0 ${
                         log.type === 'success' ? 'text-emerald-400' : 
                         log.type === 'error' ? 'text-red-400' : 'text-blue-200/60'
                       }`}>
                          <span className="opacity-40 shrink-0">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>
                          <span className="font-bold">{log.msg}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Stats Summary Area */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-sm group hover:border-blue-200 transition-all">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl mb-4 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">📋</div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bekleyen Kuyruk</span>
                 <span className="text-4xl font-black text-slate-900 leading-none">{queuedLeads.length}</span>
              </div>
              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-sm group hover:border-blue-200 transition-all">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl mb-4 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">📩</div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aktif Kanallar</span>
                 <span className="text-4xl font-black text-blue-600 leading-none">{senderPool.length}</span>
              </div>
              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-sm group hover:border-emerald-200 transition-all">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl mb-4 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">🚀</div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Başarı Oranı</span>
                 <span className="text-4xl font-black text-emerald-600 leading-none">%{participants.length > 0 ? Math.round((sentLeads.length / participants.length) * 100) : 0}</span>
              </div>
           </div>
        </div>

        {/* Control Footer */}
        <div className="p-10 bg-white border-t border-slate-100 shrink-0 flex gap-5">
           <button 
             onClick={() => setIsActive(!isActive)}
             disabled={(queuedLeads.length === 0 && !isActive) || senderPool.length === 0}
             className={`flex-1 py-7 rounded-[2.2rem] font-black text-[13px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-6 ${
               isActive 
               ? 'bg-red-500 text-white shadow-red-200 hover:bg-red-600' 
               : 'bg-[#0f172a] text-white shadow-slate-200 hover:bg-blue-600'
             } disabled:opacity-20 disabled:cursor-not-allowed`}
           >
              {isActive ? (
                <>OTONOM SÜRECİ DURDUR <span className="text-2xl">⏹</span></>
              ) : (
                <>OTONOM GÖNDERİMİ BAŞLAT <span className="text-2xl">⚡</span></>
              )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AutonomousWorker;
