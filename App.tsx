
import React, { useState, useEffect, useRef } from 'react';
import { extractLeadList, findCompanyIntel, sleep } from './services/geminiService';
import { Participant, ViewState, User, AppStatus } from './types';
import Header from './components/Header';
import DataTable from './components/DataTable';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import PaymentModal from './components/PaymentModal';
import CompanyDetail from './components/CompanyDetail';
import IdentityModal from './components/IdentityModal';
import DeepVeraAssistant from './components/DeepVeraAssistant';

const SECTORS = [
  { id: 'tech', label: 'Yazılım/BT', icon: '💻' },
  { id: 'restaurant', label: 'Restoran/Gıda', icon: '🍽️' },
  { id: 'market', label: 'Perakende/Market', icon: '🛒' },
  { id: 'hotel', label: 'Otel/Konaklama', icon: '🏨' },
  { id: 'factory', label: 'Üretim/Fabrika', icon: '🏭' },
  { id: 'hospital', label: 'Sağlık/Medikal', icon: '🏥' },
  { id: 'edu', label: 'Eğitim/Okul', icon: '🎓' },
  { id: 'logistics', label: 'Lojistik/Nakliye', icon: '🚚' },
  { id: 'cons', label: 'İnşaat/Emlak', icon: '🏗️' },
  { id: 'beauty', label: 'Güzellik/Kozmetik', icon: '💄' },
];

const STATES = ["Tüm Türkiye", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli", "Adana", "Gaziantep", "Konya"];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('deepvera_active_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [view, setView] = useState<ViewState>(() => {
    const saved = localStorage.getItem('deepvera_active_session');
    return saved ? 'dashboard' : 'landing';
  });

  const [tokenBalance, setTokenBalance] = useState<number>(() => {
    const saved = localStorage.getItem('deepvera_tokens');
    return saved ? parseInt(saved) : 1500;
  });

  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('deepvera_leads_cache');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('tech');
  const [selectedCity, setSelectedCity] = useState<string>('İstanbul');
  const [targetCityName, setTargetCityName] = useState<string>('');
  const [queryContext, setQueryContext] = useState<string>('');
  const [leadLimit, setLeadLimit] = useState<number>(20);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [logs, setLogs] = useState<string[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  
  const stopAnalysisRef = useRef(false);

  useEffect(() => {
    if (user) localStorage.setItem('deepvera_active_session', JSON.stringify(user));
    localStorage.setItem('deepvera_tokens', tokenBalance.toString());
    localStorage.setItem('deepvera_leads_cache', JSON.stringify(participants));
  }, [user, tokenBalance, participants]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  };

  const startAnalysis = async () => {
    if (tokenBalance < 1) { setIsPaymentModalOpen(true); return; }
    stopAnalysisRef.current = false;
    setStatus(AppStatus.LOADING);
    setLogs(["İstihbarat Boru Hattı Isınıyor...", "Bağlantı Tünelleri Test Ediliyor..."]);
    
    try {
      const sectorLabel = SECTORS.find(s => s.id === selectedSector)?.label;
      const locationLabel = targetCityName ? `${targetCityName}, ${selectedCity}` : selectedCity;
      const activeQuery = queryContext.trim() || `${sectorLabel} companies in ${locationLabel}`;

      addLog(`Hedef Kilitlendi: ${activeQuery}`);
      const rawResults = await extractLeadList(activeQuery, selectedSector, locationLabel, leadLimit, participants.map(p => p.name), (msg) => addLog(msg));
      
      if (!rawResults || rawResults.length === 0) { 
        addLog("HATA: Hedef sinyal alınamadı.");
        setStatus(AppStatus.IDLE); 
        return; 
      }

      const initialLeads: Participant[] = rawResults.slice(0, leadLimit).map(r => ({
        id: `p-${Date.now()}-${Math.random()}`,
        name: r.name || 'İsimsiz Şirket',
        website: r.website || '',
        email: 'Analiz Ediliyor...',
        phone: '...',
        industry: sectorLabel,
        location: r.location || locationLabel,
        status: 'pending' as const,
        automationStatus: 'idle'
      }));

      setParticipants(prev => [...initialLeads, ...prev]);
      setStatus(AppStatus.FINDING_DETAILS);

      for (let i = 0; i < initialLeads.length; i++) {
        if (stopAnalysisRef.current) break;
        const current = initialLeads[i];
        addLog(`Derin Madencilik: ${current.name}`);
        try {
          await sleep(1000);
          const intel = await findCompanyIntel(current.name, current.website, selectedSector, user!, (msg) => addLog(msg));
          const updatedLead = { ...current, ...intel, status: 'completed' as const };
          setParticipants(prev => prev.map(p => p.id === current.id ? updatedLead : p));
          setTokenBalance(prev => Math.max(0, prev - 1));
        } catch (error) {
          addLog(`Atlanıyor: ${current.name}`);
          setParticipants(prev => prev.map(p => p.id === current.id ? { ...p, status: 'failed' as const } : p));
        }
      }
    } catch (err: any) { 
      addLog(`DURDURULDU: ${err.message}`);
    }
    setStatus(AppStatus.IDLE);
  };

  const isQueryActive = queryContext.trim().length > 0;

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden font-sans text-slate-900">
      {view === 'landing' ? (
        <LandingPage onGetStarted={() => setView('login')} />
      ) : view === 'login' ? (
        <LoginForm onLogin={(u) => { setUser(u); setView('dashboard'); }} onCancel={() => setView('landing')} />
      ) : (
        <>
          <header className="h-20 shrink-0 flex items-center px-6 border-b border-slate-100 bg-white sticky top-0 z-[60] shadow-sm">
            <div className="flex items-center gap-4 min-w-fit">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-base shadow-lg">DV</div>
              <div className="hidden lg:flex flex-col leading-none text-left">
                <span className="font-black text-base tracking-tighter uppercase">DeepVera <span className="text-blue-600">AI</span></span>
                <span className="text-[6px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">İstihbarat Merkezi</span>
              </div>
            </div>

            <div className="mx-6 h-8 w-px bg-slate-100 hidden sm:block"></div>

            <div className="flex-1 flex items-center gap-2 max-w-7xl overflow-hidden justify-center">
              <input 
                type="text"
                value={queryContext}
                onChange={(e) => setQueryContext(e.target.value)}
                placeholder="URL / Hedef..."
                className="w-44 lg:w-56 h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner"
              />

              <div className={`hidden xl:flex items-center gap-2 ${isQueryActive ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className="h-11 bg-slate-50 border border-slate-100 rounded-xl px-3 text-[9px] font-black uppercase tracking-widest outline-none w-28">
                  {SECTORS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                </select>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="h-11 bg-slate-50 border border-slate-100 rounded-xl px-3 text-[9px] font-black uppercase tracking-widest outline-none w-32">
                  {STATES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {status === AppStatus.IDLE ? (
                <button onClick={startAnalysis} className="h-11 px-6 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-slate-900 transition-all shrink-0">🚀 BAŞLAT</button>
              ) : (
                <button onClick={() => { stopAnalysisRef.current = true; setStatus(AppStatus.IDLE); }} className="h-11 px-6 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-100 animate-pulse shrink-0">⏹️ DURDUR</button>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0 ml-4">
              <div className="flex flex-col items-end leading-none cursor-pointer group" onClick={() => setIsPaymentModalOpen(true)}>
                <span className="text-xs font-black text-blue-600 group-hover:scale-110 transition-transform">{tokenBalance}</span>
                <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">KREDİ</span>
              </div>
              <button onClick={() => setIsIdentityModalOpen(true)} className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-xs hover:bg-white transition-all">⚙️</button>
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white text-[10px] font-black flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors" onClick={() => { setUser(null); setView('landing'); }}>{user?.name?.charAt(0)}</div>
            </div>
          </header>
          
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* HİKAYE ODAKLI NÖRAL İSTİHBARAT BORU HATTI */}
            {status !== AppStatus.IDLE && (
              <div className="bg-[#020617] h-48 flex flex-col justify-center border-b border-blue-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[55] overflow-hidden relative">
                <div className="absolute inset-0 scan-line opacity-5 pointer-events-none"></div>
                
                {/* Aşama Göstergeleri */}
                <div className="flex items-center justify-between px-20 max-w-6xl mx-auto w-full relative">
                   {/* Bağlantı Çizgisi */}
                   <div className="absolute top-1/2 left-24 right-24 h-0.5 bg-blue-500/10 -translate-y-1/2">
                      <div className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-[shimmer_2s_infinite] transition-all" style={{ width: `${(participants.filter(p => p.status === 'completed').length / leadLimit) * 100}%` }}></div>
                   </div>

                   {/* Step 1: Targeting */}
                   <div className={`flex flex-col items-center gap-3 relative z-10 transition-all duration-500 ${status === AppStatus.LOADING ? 'scale-110' : 'opacity-40'}`}>
                      <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${status === AppStatus.LOADING ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'bg-slate-800 border-slate-700'}`}>
                         <span className="text-xl">🎯</span>
                      </div>
                      <div className="text-center">
                         <span className="text-white text-[9px] font-black uppercase tracking-widest block">Hedefleme</span>
                         <span className="text-blue-400 text-[7px] font-bold uppercase">{status === AppStatus.LOADING ? 'Sinyal Alındı' : 'Kilitlendi'}</span>
                      </div>
                   </div>

                   {/* Step 2: Signal Scan */}
                   <div className={`flex flex-col items-center gap-3 relative z-10 transition-all duration-500 ${status === AppStatus.FINDING_DETAILS ? 'scale-110' : 'opacity-40'}`}>
                      <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${status === AppStatus.FINDING_DETAILS ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'bg-slate-800 border-slate-700'}`}>
                         <div className={status === AppStatus.FINDING_DETAILS ? 'animate-spin' : ''}>🔍</div>
                      </div>
                      <div className="text-center">
                         <span className="text-white text-[9px] font-black uppercase tracking-widest block">Düğüm Taraması</span>
                         <span className="text-blue-400 text-[7px] font-bold uppercase">{status === AppStatus.FINDING_DETAILS ? 'Taranıyor' : 'Beklemede'}</span>
                      </div>
                   </div>

                   {/* Step 3: Mining */}
                   <div className={`flex flex-col items-center gap-3 relative z-10 transition-all duration-500 ${status === AppStatus.FINDING_DETAILS ? 'scale-110' : 'opacity-40'}`}>
                      <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${status === AppStatus.FINDING_DETAILS ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'bg-slate-800 border-slate-700'}`}>
                         <span className="text-xl">💎</span>
                      </div>
                      <div className="text-center">
                         <span className="text-white text-[9px] font-black uppercase tracking-widest block">Veri Madenciliği</span>
                         <span className="text-blue-400 text-[7px] font-bold uppercase">Ayıklanıyor</span>
                      </div>
                   </div>

                   {/* Step 4: AI Synthesis */}
                   <div className={`flex flex-col items-center gap-3 relative z-10 transition-all duration-500 ${status === AppStatus.FINDING_DETAILS ? 'scale-110' : 'opacity-40'}`}>
                      <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${status === AppStatus.FINDING_DETAILS ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'bg-slate-800 border-slate-700'}`}>
                         <span className="text-xl">🧠</span>
                      </div>
                      <div className="text-center">
                         <span className="text-white text-[9px] font-black uppercase tracking-widest block">Nöral Sentez</span>
                         <span className="text-blue-400 text-[7px] font-bold uppercase">Buzkıran Yazılıyor</span>
                      </div>
                   </div>
                </div>

                {/* Alt: Canlı İşlem Logu */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/5">
                   <span className="text-[8px] font-mono text-blue-500 animate-pulse">SYSTEM_LOG_v2.4:</span>
                   <span className="text-[9px] font-mono text-white/80 whitespace-nowrap">{logs[0] || 'Hazırlanıyor...'}</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-4"></span>
                </div>
              </div>
            )}

            <div className="flex-1 relative max-w-[1600px] mx-auto w-full px-6 py-6 overflow-y-auto no-scrollbar flex flex-col gap-6">
              <DataTable 
                participants={participants} 
                status={status} 
                tokenBalance={tokenBalance} 
                onSelectParticipant={setSelectedParticipant}
                onExport={() => {}} 
                onClear={() => setParticipants([])}
              />
              
              <CompanyDetail 
                participant={selectedParticipant} 
                onClose={() => setSelectedParticipant(null)} 
                userLogo={user?.companyLogo}
              />
            </div>
          </main>

          <DeepVeraAssistant user={user} />
          <IdentityModal isOpen={isIdentityModalOpen} onClose={() => setIsIdentityModalOpen(false)} user={user} onUpdate={(f) => setUser(u => u ? {...u, ...f} : null)} />
          <PaymentModal isOpen={isPaymentModalOpen} isPro={user?.isPro} onClose={() => setIsPaymentModalOpen(false)} onSuccess={(t) => setTokenBalance(b => b + t)} onUpgrade={() => user && setUser({...user, isPro: true})} />
        </>
      )}
    </div>
  );
};

export default App;
