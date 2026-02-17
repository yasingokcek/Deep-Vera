
import React, { useState, useEffect, useRef } from 'react';
import { Participant, User, AutomationConfig } from '../types';
import { sendGmail } from '../services/gmailService';

interface Props {
  user: User | null;
  participants: Participant[];
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AutonomousWorker: React.FC<Props> = ({ user, participants, updateParticipant, isOpen, onClose }) => {
  const [config, setConfig] = useState<AutomationConfig>({
    minInterval: 5,
    maxInterval: 7,
    isActive: false,
    dailyLimit: 50,
    sentToday: 0,
    isCenterActive: true
  });
  
  const [nextActionIn, setNextActionIn] = useState<number | null>(null);
  const [currentTask, setCurrentTask] = useState<string>('Sistem Hazır');
  const timerRef = useRef<any>(null);

  const queuedLeads = participants.filter(p => p.automationStatus === 'queued');

  // Protokol 6: İnsan Davranışı Simülasyonu (Mesai Saati Kontrolü)
  const isBusinessHours = () => {
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 18;
  };

  const runAutomationStep = async () => {
    if (!config.isActive || !user?.googleAccessToken) return;

    if (!isBusinessHours()) {
      setCurrentTask('Mesai saatleri bekleniyor (09:00 - 18:00)');
      timerRef.current = setTimeout(runAutomationStep, 60000); // Her dk kontrol et
      return;
    }

    const target = participants.find(p => p.automationStatus === 'queued' && p.email.includes('@'));
    
    if (!target) {
      setCurrentTask('Kuyruk Tamamlandı');
      setConfig(prev => ({ ...prev, isActive: false }));
      return;
    }

    try {
      setCurrentTask(`${target.name} için teklif hazırlanıyor...`);
      updateParticipant(target.id, { automationStatus: 'sending' });
      
      await sendGmail(user.googleAccessToken, target.email, target.emailSubject || 'DeepVera İş Birliği', target.emailDraft || '');

      updateParticipant(target.id, { automationStatus: 'sent', sentAt: new Date().toISOString() });
      setConfig(prev => ({ ...prev, sentToday: prev.sentToday + 1 }));

      // Protokol 6A: Rastgele Zamanlama (5-7 dk)
      const randomMinutes = Math.floor(Math.random() * (config.maxInterval - config.minInterval + 1)) + config.minInterval;
      setNextActionIn(randomMinutes);
      setCurrentTask('Anti-Spam bekleme protokolü devrede');
      
      timerRef.current = setTimeout(runAutomationStep, randomMinutes * 60 * 1000);
    } catch (error) {
      updateParticipant(target.id, { automationStatus: 'failed' });
      timerRef.current = setTimeout(runAutomationStep, 60000); 
    }
  };

  useEffect(() => {
    if (config.isActive) runAutomationStep();
    else { if (timerRef.current) clearTimeout(timerRef.current); setNextActionIn(null); }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [config.isActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl border border-white overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-black">🤖</div>
              <div>
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Otonom Kontrol Merkezi</h3>
                 <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1">DeepVera Engine v2.0</p>
              </div>
           </div>
           <button onClick={onClose} className="text-slate-300 hover:text-red-500 text-3xl">&times;</button>
        </div>

        <div className="p-10 space-y-8">
           {/* Canlı İzleme (Protokol 4E) */}
           <div className="p-6 bg-slate-900 rounded-[2rem] border border-blue-500/30">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-3 block">Canlı İşlem Akışı</span>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                 <p className="text-[11px] font-bold text-white tracking-tight">{currentTask}</p>
              </div>
              {nextActionIn && (
                 <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[9px] text-white/40 uppercase">Sıradaki Gönderim</span>
                    <span className="text-xl font-black text-blue-400">{nextActionIn}:00 DK</span>
                 </div>
              )}
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                 <span className="text-[8px] font-black text-slate-400 uppercase mb-2 block">Kuyruk</span>
                 <span className="text-2xl font-black text-slate-900">{queuedLeads.length}</span>
              </div>
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                 <span className="text-[8px] font-black text-blue-600 uppercase mb-2 block">Gönderilen</span>
                 <span className="text-2xl font-black text-blue-600">{config.sentToday}</span>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-2">
                 <span>Zamanlama (5-7 dk kuralı)</span>
                 <span className="text-blue-600">Aktif</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Min (Dk)</label>
                    <input type="number" value={config.minInterval} readOnly className="w-full bg-transparent text-sm font-bold outline-none" />
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Max (Dk)</label>
                    <input type="number" value={config.maxInterval} readOnly className="w-full bg-transparent text-sm font-bold outline-none" />
                 </div>
              </div>
           </div>

           <button 
             onClick={() => setConfig(prev => ({ ...prev, isActive: !prev.isActive }))}
             disabled={queuedLeads.length === 0 && !config.isActive}
             className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${config.isActive ? 'bg-red-500 text-white shadow-red-100' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-slate-900'}`}
           >
              {config.isActive ? 'OTOMASYONU DURDUR' : 'OTONOM GÖNDERİMİ BAŞLAT'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AutonomousWorker;
