
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
  const [currentTask, setCurrentTask] = useState<string>('Sistem Beklemede');
  const [rotationLog, setRotationLog] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number>(0);
  const timerRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);

  const queuedLeads = participants.filter(p => p.automationStatus === 'queued');
  const senderPool = user?.senderAccounts || [];

  const runAutomationStep = async () => {
    if (!isActive || !user) return;

    // Kuyruktaki ilk geçerli firmayı bul
    const target = participants.find(p => p.automationStatus === 'queued' && p.email.includes('@'));
    
    if (!target) {
      setCurrentTask('Tüm Operasyon Başarıyla Tamamlandı');
      setIsActive(false);
      return;
    }

    // N8N MİMARİSİ: Round-Robin Rotasyon
    // Havuzdaki e-posta hesaplarını sırayla döneriz.
    const senderIndex = user.currentSenderIndex || 0;
    const activeSender = senderPool.length > 0 ? senderPool[senderIndex % senderPool.length] : null;

    if (!activeSender) {
      setCurrentTask('HATA: Bağlı Gönderici Hesabı Bulunamadı!');
      setIsActive(false);
      return;
    }

    try {
      setCurrentTask(`${target.name} analiz ediliyor ve ${activeSender.email} üzerinden iletiliyor...`);
      setRotationLog(prev => [`[${new Date().toLocaleTimeString()}] AKTİF KANAL: ${activeSender.email}`, ...prev].slice(0, 10));

      updateParticipant(target.id, { automationStatus: 'sending' });
      
      // GERÇEK GÖNDERİM (OAuth2 Token Kullanılarak)
      // Gmail API /send endpointi kullanılır.
      await sendGmail(activeSender.accessToken, target.email, target.emailSubject || 'İş Birliği Teklifi', target.emailDraft || '');

      updateParticipant(target.id, { 
        automationStatus: 'sent', 
        sentAt: new Date().toISOString() 
      });

      setRotationLog(prev => [`[${new Date().toLocaleTimeString()}] BAŞARILI: ${target.name} iletildi.`, ...prev].slice(0, 10));

      // Göndericiyi bir sonrakine kaydır (N8N Credential Rotation Mantığı)
      if (updateUser && senderPool.length > 0) {
        updateUser({ currentSenderIndex: (senderIndex + 1) % senderPool.length });
      }

      // SPAM KORUMA PROTOKOLÜ: 7-9 Dakika Rastgele Bekleme (Jittering)
      // 420 saniye (7 dk) ile 540 saniye (9 dk) arasında bir değer.
      const randomSeconds = Math.floor(Math.random() * (540 - 420 + 1)) + 420;
      setCountdown(randomSeconds);
      setCurrentTask('Anti-Spam Mola Protokolü Devrede...');
      
      timerRef.current = setTimeout(runAutomationStep, randomSeconds * 1000);
    } catch (error: any) {
      console.error(error);
      updateParticipant(target.id, { automationStatus: 'failed' });
      setRotationLog(prev => [`[${new Date().toLocaleTimeString()}] HATA: ${activeSender.email} üzerinden gönderim yapılamadı.`, ...prev].slice(0, 10));
      
      // Hata durumunda 1 dakika bekleyip bir sonraki hesaba geçmeyi dene
      timerRef.current = setTimeout(runAutomationStep, 60000); 
    }
  };

  // UI Geri sayım sayacı
  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
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
    else { 
      if (timerRef.current) clearTimeout(timerRef.current); 
      setCountdown(0); 
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-slate-900/80 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.8rem] flex items-center justify-center text-4xl font-black shadow-2xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 to-transparent"></div>
                 🤖
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Otonom Sevk Ünitesi</h3>
                 <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em] mt-2">N8N Engine - Simulation Model</p>
              </div>
           </div>
           <button onClick={onClose} className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl text-slate-300 hover:text-red-500 text-4xl shadow-sm transition-all">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
           
           <div className="p-10 bg-slate-900 rounded-[3rem] border border-blue-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 blur-[100px]"></div>
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                 <div className="flex-1">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-4 block">Görev Durumu</span>
                    <div className="flex items-center gap-4">
                       <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`}></div>
                       <p className="text-xl font-black text-white tracking-tight">{currentTask}</p>
                    </div>
                 </div>
                 {countdown > 0 && (
                    <div className="text-right">
                       <span className="text-[10px] text-white/40 uppercase tracking-[0.4em] mb-2 block">Sıradaki İşlem</span>
                       <div className="text-5xl font-black text-blue-400 font-mono tracking-tighter">{formatTime(countdown)}</div>
                    </div>
                 )}
              </div>
              
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-3">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.6em] mb-3 block">Operasyonel Günlük</span>
                 <div className="space-y-2.5 h-40 overflow-y-auto custom-scrollbar pr-4">
                    {rotationLog.map((log, i) => (
                       <div key={i} className={`text-[10px] font-bold font-mono truncate leading-relaxed ${log.includes('HATA') ? 'text-red-400' : log.includes('BAŞARILI') ? 'text-emerald-400' : 'text-blue-200/60'}`}>
                          {log}
                       </div>
                    ))}
                    {rotationLog.length === 0 && <div className="text-[10px] text-slate-600 italic">Sistem başlatılmayı bekliyor...</div>}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-6">
              <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 text-center group hover:bg-white transition-all shadow-sm">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Kuyruk</span>
                 <span className="text-5xl font-black text-slate-900">{queuedLeads.length}</span>
              </div>
              <div className="p-10 bg-blue-50 rounded-[3rem] border border-blue-100 text-center group hover:bg-white transition-all shadow-sm">
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 block">Kanallar</span>
                 <span className="text-5xl font-black text-blue-600">{senderPool.length}</span>
              </div>
              <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100 text-center group hover:bg-white transition-all shadow-sm">
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 block">Başarı</span>
                 <span className="text-5xl font-black text-emerald-600">{participants.filter(p => p.automationStatus === 'sent').length}</span>
              </div>
           </div>

           {/* Hesap Rotasyon Durumu */}
           <div className="space-y-6">
              <div className="flex justify-between items-center px-6">
                 <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-[0.4em]">Credential Rotasyon Zinciri</h4>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">AKTİF MODÜL</span>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto custom-scrollbar pr-4">
                 {senderPool.map((s, idx) => (
                    <div key={s.id} className={`p-6 rounded-[2rem] border-2 transition-all duration-500 flex justify-between items-center ${user?.currentSenderIndex % senderPool.length === idx ? 'bg-blue-600 border-blue-600 text-white shadow-2xl translate-x-3' : 'bg-white border-slate-100 text-slate-400 opacity-60'}`}>
                       <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${user?.currentSenderIndex % senderPool.length === idx ? 'bg-white/20' : 'bg-slate-50'}`}>✉</div>
                          <div className="flex flex-col">
                             <span className="text-sm font-black">{s.email}</span>
                             <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Google OAuth2 Bağlantısı</span>
                          </div>
                       </div>
                       {user?.currentSenderIndex % senderPool.length === idx && (
                          <div className="bg-white/20 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">Sıradaki</div>
                       )}
                    </div>
                 ))}
                 {senderPool.length === 0 && (
                    <div className="p-20 text-center text-[10px] font-black text-slate-300 uppercase border-4 border-dashed border-slate-50 rounded-[3rem]">
                       PROFİLDEN GMAIL HESAPLARINIZI BAĞLAYIN
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="p-10 bg-slate-50 shrink-0 border-t border-slate-100">
           <button 
             onClick={() => setIsActive(!isActive)}
             disabled={(queuedLeads.length === 0 && !isActive) || senderPool.length === 0}
             className={`w-full py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-6 ${
               isActive ? 'bg-red-500 text-white shadow-red-200 hover:bg-red-600' : 'bg-blue-600 text-white shadow-blue-400 hover:bg-slate-900'
             }`}
           >
              {isActive ? (
                <>OTOMASYON DÖNGÜSÜNÜ KIR <span className="text-3xl">⏹</span></>
              ) : (
                <>OTONOM ROTASYONU BAŞLAT <span className="text-3xl">⚡</span></>
              )}
           </button>
           <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-8">
              * Mühendislik Notu: Bu işlem tarayıcı tarafında çalışır. Sekmeyi kapatmanız halinde scheduler duracaktır.
           </p>
        </div>
      </div>
    </div>
  );
};

export default AutonomousWorker;
