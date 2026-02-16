
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
import AdminPanel from './components/AdminPanel';
import GmailCenter from './components/GmailCenter';

const SECTORS = [
  { id: 'retail', label: 'Perakende & Mağazacılık', icon: '🛒' },
  { id: 'fashion', label: 'Moda & Tekstil', icon: '👗' },
  { id: 'fmcg', label: 'Hızlı Tüketim (FMCG)', icon: '📦' },
  { id: 'e-commerce', label: 'E-Ticaret & Pazaryeri', icon: '🌐' },
  { id: 'tech', label: 'Yazılım & BT', icon: '🤖' },
  { id: 'finance', label: 'Fintek & Bankacılık', icon: '💎' },
  { id: 'health', label: 'Sağlık & Medikal', icon: '🧬' },
  { id: 'energy', label: 'Yenilenebilir Enerji', icon: '🔋' },
  { id: 'logistics', label: 'Akıllı Lojistik', icon: '🚚' },
  { id: 'auto', label: 'Otomotiv', icon: '🚗' },
];

const LIMIT_OPTIONS = [10, 25, 50, 100, 250];

const LOCATION_DATA: Record<string, string[]> = {
  "Türkiye": ["Tüm Şehirler", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli", "Gaziantep"],
  "Avustralya": ["Tüm Bölgeler", "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Gold Coast"],
  "ABD": ["New York", "California", "Texas", "Florida", "Washington"],
  "Almanya": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Stuttgart"],
  "İngiltere": ["London", "Manchester", "Birmingham", "Leeds"]
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const local = localStorage.getItem('deepvera_active_session');
    const session = sessionStorage.getItem('deepvera_active_session');
    const saved = local || session;
    return saved ? JSON.parse(saved) : null;
  });
  
  const [view, setView] = useState<ViewState>(() => {
    const local = localStorage.getItem('deepvera_active_session');
    const session = sessionStorage.getItem('deepvera_active_session');
    return (local || session) ? 'dashboard' : 'landing';
  });

  const [tokenBalance, setTokenBalance] = useState<number>(() => {
    const saved = localStorage.getItem('deepvera_tokens');
    return saved ? parseInt(saved) : 50; 
  });

  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('deepvera_leads_cache');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCountry, setSelectedCountry] = useState<string>("Türkiye");
  const [selectedCity, setSelectedCity] = useState<string>("Tüm Şehirler");
  const [selectedSector, setSelectedSector] = useState<string>('retail');
  const [queryContext, setQueryContext] = useState<string>('');
  const [leadLimit, setLeadLimit] = useState<number>(25);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [searchStep, setSearchStep] = useState<number>(0);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isGmailCenterOpen, setIsGmailCenterOpen] = useState(false);
  
  const stopAnalysisRef = useRef(false);

  const handleLogin = (u: User, remember: boolean) => {
    setUser(u);
    setView('dashboard');
    if (u.tokenBalance !== undefined) setTokenBalance(u.tokenBalance);
    const userStr = JSON.stringify(u);
    if (remember) {
      localStorage.setItem('deepvera_active_session', userStr);
    } else {
      sessionStorage.setItem('deepvera_active_session', userStr);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    localStorage.removeItem('deepvera_active_session');
    sessionStorage.removeItem('deepvera_active_session');
  };

  useEffect(() => {
    localStorage.setItem('deepvera_tokens', tokenBalance.toString());
    localStorage.setItem('deepvera_leads_cache', JSON.stringify(participants));
  }, [tokenBalance, participants]);

  const startAnalysis = async () => {
    if (tokenBalance < 1) { setIsPaymentModalOpen(true); return; }
    stopAnalysisRef.current = false;
    setStatus(AppStatus.LOADING);
    
    try {
      setSearchStep(1);
      const sectorLabel = SECTORS.find(s => s.id === selectedSector)?.label;
      const locationLabel = `${selectedCity}, ${selectedCountry}`;
      const activeQuery = queryContext.trim() || `${sectorLabel} sektöründeki firmalar - ${locationLabel}`;

      setSearchStep(2);
      const rawResults = await extractLeadList(activeQuery, selectedSector, locationLabel, leadLimit, participants.map(p => p.name));
      
      if (!rawResults || rawResults.length === 0) { 
        setStatus(AppStatus.IDLE); 
        return; 
      }

      const initialLeads: Participant[] = rawResults.slice(0, leadLimit).map(r => ({
        id: `p-${Date.now()}-${Math.random()}`,
        name: r.name || 'Şirket',
        website: r.website || '',
        email: 'Analiz Başlıyor...',
        phone: '...',
        industry: sectorLabel,
        location: r.location || locationLabel,
        status: 'pending' as const,
        automationStatus: 'idle'
      }));

      setParticipants(prev => [...initialLeads, ...prev]);
      
      setSearchStep(3);
      setStatus(AppStatus.FINDING_DETAILS);

      for (let i = 0; i < initialLeads.length; i++) {
        if (stopAnalysisRef.current) break;
        const current = initialLeads[i];
        try {
          await sleep(150);
          const intel = await findCompanyIntel(current.name, current.website, selectedSector, user!);
          const updatedLead = { ...current, ...intel, status: 'completed' as const };
          setParticipants(prev => prev.map(p => p.id === current.id ? updatedLead : p));
          setTokenBalance(prev => Math.max(0, prev - 1));
        } catch (error) {
          setParticipants(prev => prev.map(p => p.id === current.id ? { ...p, status: 'failed' as const } : p));
        }
      }
      setSearchStep(4);
    } catch (err) { console.error(err); }
    setStatus(AppStatus.IDLE);
    setSearchStep(0);
  };

  const steps = [
    { label: "INITIALIZE", icon: "🚀" },
    { label: "CRAWLING", icon: "📡" },
    { label: "NEURAL_SYNC", icon: "🧠" },
    { label: "SOCIAL_RESOLVE", icon: "📱" },
    { label: "AI_STRATEGY", icon: "✉️" }
  ];

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden font-sans text-slate-900 selection:bg-blue-600/10">
      {view === 'landing' ? (
        <LandingPage onGetStarted={() => setView('login')} />
      ) : view === 'login' ? (
        <LoginForm onLogin={handleLogin} onCancel={() => setView('landing')} />
      ) : (
        <>
          <Header 
            userName={user?.name}
            tokenBalance={tokenBalance}
            onLogout={handleLogout}
            onBuyTokens={() => setIsPaymentModalOpen(true)}
            onOpenSettings={() => setIsIdentityModalOpen(true)}
            onOpenAdmin={() => setIsAdminPanelOpen(true)}
            onOpenGmail={() => setIsGmailCenterOpen(true)}
            role={user?.role}
            isGmailConnected={user?.isGmailConnected}
          />
          
          <main className="flex-1 flex flex-col overflow-hidden px-6 lg:px-14 py-4 gap-4">
            <div className="bg-white border border-slate-200/50 rounded-[2.5rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] shrink-0">
               <div className="flex flex-col lg:flex-row items-center gap-3">
                  <div className="w-full lg:flex-1 relative group">
                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600 opacity-30 group-focus-within:opacity-100 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                     </div>
                     <input 
                       type="text"
                       value={queryContext}
                       onChange={(e) => setQueryContext(e.target.value)}
                       placeholder="Fuar URL'si veya Anahtar Kelime..."
                       className="w-full h-12 pl-12 pr-6 bg-slate-50/50 border border-slate-100 rounded-xl text-[12px] font-semibold outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all"
                     />
                  </div>

                  <div className="flex items-center gap-2 w-full lg:w-auto">
                    <button 
                      onClick={() => setIsGmailCenterOpen(true)}
                      className="h-12 px-6 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      Gmail_Sync
                    </button>

                    <select 
                      value={selectedSector} 
                      onChange={(e) => setSelectedSector(e.target.value)} 
                      className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-[9px] font-black uppercase tracking-widest outline-none min-w-[150px] cursor-pointer hover:bg-white transition-all"
                    >
                      {SECTORS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                    </select>

                    <div className="flex gap-2">
                      <select 
                        value={selectedCountry} 
                        onChange={(e) => { setSelectedCountry(e.target.value); setSelectedCity(LOCATION_DATA[e.target.value][0]); }} 
                        className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-[9px] font-black uppercase tracking-widest outline-none min-w-[110px] cursor-pointer"
                      >
                        {Object.keys(LOCATION_DATA).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>

                      <select 
                        value={selectedCity} 
                        onChange={(e) => setSelectedCity(e.target.value)} 
                        className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-[9px] font-black uppercase tracking-widest outline-none min-w-[120px] cursor-pointer"
                      >
                        {LOCATION_DATA[selectedCountry].map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                      
                      <select 
                        value={leadLimit} 
                        onChange={(e) => setLeadLimit(Number(e.target.value))} 
                        className="h-12 bg-blue-50/40 border border-blue-100 text-blue-600 rounded-xl px-4 text-[9px] font-black uppercase tracking-widest outline-none min-w-[85px] cursor-pointer hover:bg-blue-100/50 transition-colors"
                      >
                        {LIMIT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} LMT</option>)}
                      </select>
                    </div>

                    <button 
                      onClick={status === AppStatus.IDLE ? startAnalysis : () => { stopAnalysisRef.current = true; setStatus(AppStatus.IDLE); }} 
                      className={`h-12 px-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 ${
                        status === AppStatus.IDLE 
                        ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-slate-900' 
                        : 'bg-red-500 text-white shadow-red-50 animate-pulse'
                      }`}
                    >
                      {status === AppStatus.IDLE ? "KEŞFET" : "DURDUR"}
                    </button>
                  </div>
               </div>
            </div>

            <DataTable 
              participants={participants} 
              status={status} 
              tokenBalance={tokenBalance} 
              onSelectParticipant={setSelectedParticipant}
              onExport={() => {}} 
              onClear={() => setParticipants([])}
            />
          </main>

          <DeepVeraAssistant user={user} />
          <IdentityModal isOpen={isIdentityModalOpen} onClose={() => setIsIdentityModalOpen(false)} user={user} onUpdate={(f) => setUser(u => u ? {...u, ...f} : null)} />
          <PaymentModal isOpen={isPaymentModalOpen} isPro={user?.isPro} onClose={() => setIsPaymentModalOpen(false)} onSuccess={(t) => setTokenBalance(b => b + t)} onUpgrade={() => user && setUser({...user, isPro: true})} />
          <CompanyDetail participant={selectedParticipant} onClose={() => setSelectedParticipant(null)} userLogo={user?.companyLogo} />
          {isAdminPanelOpen && <AdminPanel onClose={() => setIsAdminPanelOpen(false)} currentUser={user} />}
          {isGmailCenterOpen && <GmailCenter user={user} onClose={() => setIsGmailCenterOpen(false)} />}
        </>
      )}
    </div>
  );
};

export default App;
