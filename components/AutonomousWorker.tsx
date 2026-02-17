
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
    sentToday: 0
  });
  
  const [nextActionIn, setNextActionIn] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  const queuedLeads = participants.filter(p => p.automationStatus === 'queued');
  const sentLeads = participants.filter(p => p.automationStatus === 'sent');

  const runAutomationStep = async () => {
    if (!config.isActive || !user?.googleAccessToken) return;

    const target = participants.find(p => p.automationStatus === 'queued' && p.email.includes('@'));
    
    if (!target) {
      setConfig(prev => ({ ...prev, isActive: false }));
      setNextActionIn(null);
      return;
    }

    try {
      updateParticipant(target.id, { automationStatus: 'sending' });
      
      await sendGmail(
        user.googleAccessToken, 
        target.email, 
        target.emailSubject || 'DeepVera İş Birliği Teklifi', 
        target.emailDraft || ''
      );

      updateParticipant(target.id, { automationStatus: 'sent', sentAt: new Date().toISOString() });
      setConfig(prev => ({ ...prev, sentToday: prev.sentToday + 1 }));

      // Bir sonraki gönderim için rastgele süre belirle (5-7 dk arası)
      const randomMinutes = Math.floor(Math.random() * (config.maxInterval - config.minInterval + 1)) + config.minInterval;
      const nextDelayMs = randomMinutes * 60 * 1000;
      
      setNextActionIn(randomMinutes);
      
      timerRef.current = setTimeout(runAutomationStep, nextDelayMs);
    } catch (error) {
      updateParticipant(target.id, { automationStatus: 'failed' });
      console.error("Otomasyon hatası:", error);
      // Hata olsa da devam et, bir sonraki adımı planla
      timerRef.current = setTimeout(runAutomationStep, 60000); 
    }
  };

  useEffect(() => {
    if (config.isActive) {
      runAutomationStep();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setNextActionIn(null);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [config.isActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-xl">🤖</div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Otonom Satış Temsilcisi</h3>
                 <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">DeepVera Autonomous Engine v1.0</p>
              </div>
           </div>
           <button onClick={onClose} className="text-slate-300 hover:text-red-500 text-3xl transition-colors">&times;</button>
        </div>

        <div className="p-10 space-y-8">
           <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Kuyruktaki Adaylar</span>
                 <div className="text-3xl font-black text-slate-900">{queuedLeads.length}</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                 <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-2">Bugün Gönderilen</span>
                 <div className="text-3xl font-black text-blue-600">{config.sentToday}</div>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Zaman Aralığı Yapılandırması</span>
                 <span className="text-[10px] font-black text-blue-600">{config.minInterval} - {config.maxInterval} Dakika</span>
              </div>
              <div className="flex gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <div className="flex-1 space-y-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Minimum Bekleme (dk)</label>
                    <input 
                      type="number" 
                      value={config.minInterval}
                      onChange={(e) => setConfig(prev => ({ ...prev, minInterval: Math.max(1, parseInt(e.target.value)) }))}
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-blue-400"
                    />
                 </div>
                 <div className="flex-1 space-y-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Maximum Bekleme (dk)</label>
                    <input 
                      type="number" 
                      value={config.maxInterval}
                      onChange={(e) => setConfig(prev => ({ ...prev, maxInterval: Math.max(config.minInterval + 1, parseInt(e.target.value)) }))}
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-blue-400"
                    />
                 </div>
              </div>
           </div>

           {nextActionIn !== null && config.isActive && (
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sıradaki gönderim bekleniyor...</span>
                 </div>
                 <span className="text-lg font-black text-emerald-600">~{nextActionIn} DK</span>
              </div>
           )}

           <button 
             onClick={() => setConfig(prev => ({ ...prev, isActive: !prev.isActive }))}
             disabled={queuedLeads.length === 0 && !config.isActive}
             className={`w-full py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
               config.isActive 
               ? 'bg-red-500 text-white shadow-red-200' 
               : (queuedLeads.length === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-slate-900')
             }`}
           >
              {config.isActive ? 'OTOMASYONU DURDUR' : 'OTONOM GÖNDERİMİ BAŞLAT'}
           </button>

           <div className="text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                * Bu sistem tamamen insan davranışını taklit eder.<br/>
                Gmail spam filtrelerinden korunmak için 5-7 dakikalık rastgele aralıklar önerilir.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomousWorker;
