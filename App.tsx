
import React, { useState, useEffect } from 'react';
import { extractLeadList, findCompanyIntel } from './services/geminiService';
import { Participant, ViewState, User, AppStatus, SavedSearch } from './types';
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
import AutonomousWorker from './components/AutonomousWorker';

const globalLocations: Record<string, string[]> = {
  "TÜRKİYE": [
    "İSTANBUL", "ANKARA", "İZMİR", 
    "ADANA", "ADIYAMAN", "AFYONKARAHİSAR", "AĞRI", "AKSARAY", "AMASYA", "ANTALYA", "ARDAHAN", "ARTVİN", "AYDIN", 
    "BALIKESİR", "BARTIN", "BATMAN", "BAYBURT", "BİLECİK", "BİNGÖL", "BİTLİS", "BOLU", "BURDUR", "BURSA", "ÇANAKKALE", 
    "ÇANKIRI", "ÇORUM", "DENİZLİ", "DİYARBAKIR", "DÜZCE", "EDİRNE", "ELAZIĞ", "ERZİNCAN", "ERZURUM", "ESKİŞEHİR", 
    "GAZİANTEP", "GİRESUN", "GÜMÜŞHANE", "HAKKARİ", "HATAY", "IĞDIR", "ISPARTA", "KAHRAMANMARAŞ", "KARABÜK", "KARAMAN", 
    "KARS", "KASTAMONU", "KAYSERİ", "KIRIKKALE", "KIRKLARELİ", "KIRŞEHİR", "KİLİS", "KOCAELİ", "KONYA", "KÜTAHYA", 
    "MALATYA", "MANİSA", "MARDİN", "MERSİN", "MUĞLA", "MUŞ", "NEVŞEHİR", "NİĞDE", "ORDU", "OSMANİYE", "RİZE", "SAKARYA", 
    "SAMSUN", "SİİRT", "SİNOP", "SİVAS", "ŞIRNAK", "TEKİRDAĞ", "TOKAT", "TRABZON", "TUNCELİ", "ŞANLIURFA", "UŞAK", "VAN", 
    "YALOVA", "YOZGAT", "ZONGULDAK"
  ],
  "ALMANYA": ["BERLIN", "MUNICH", "HAMBURG", "FRANKFURT", "STUTTGART", "COLOGNE", "DUSSELDORF", "DORTMUND"],
  "ABD": ["NEW YORK", "LOS ANGELES", "CHICAGO", "HOUSTON", "PHOENIX", "PHILADELPHIA", "SAN ANTONIO", "SAN DIEGO"],
  "İNGİLTERE": ["LONDON", "MANCHESTER", "BIRMINGHAM", "LEEDS", "LIVERPOOL", "GLASGOW", "SHEFFIELD", "BRISTOL"],
  "FRANSA": ["PARIS", "MARSEILLE", "LYON", "TOULOUSE", "NICE", "NANTES", "STRASBOURG", "MONTPELLIER"],
  "KANADA": ["TORONTO", "VANCOUVER", "MONTREAL", "OTTAWA", "CALGARY", "EDMONTON", "QUEBEC CITY"],
  "AFRİKA BİRLİĞİ": ["LAGOS", "ABUJA", "CAIRO", "JOHANNESBURG", "CAPE TOWN", "NAIROBI", "CASABLANCA", "ADDIS ABABA"]
};

const sectors = [
  { id: 'all', label: 'SEKTÖR SEÇİN' },
  { id: 'avm', label: 'AVM & ALIŞVERİŞ MERKEZİ' },
  { id: 'restoran', label: 'RESTORAN' },
  { id: 'kafeterya', label: 'KAFETERYA' },
  { id: 'hastahane', label: 'HASTANE' },
  { id: 'sigorta', label: 'SİGORTA' },
  { id: 'giyim', label: 'GİYİM MAĞAZALARI' },
  { id: 'cocuk_giyim', label: 'ÇOCUK GİYİM' },
  { id: 'market', label: 'MARKET' },
  { id: 'guzellik', label: 'GÜZELLİK MERKEZİ' },
  { id: 'sac_ekim', label: 'SAÇ EKİM MERKEZLERİ' },
  { id: 'ozel_okul', label: 'ÖZEL OKULLAR' },
  { id: 'otomotiv', label: 'OTOMOTİV & GALERİ' },
  { id: 'yazilim', label: 'YAZILIM ŞİRKETLERİ' },
  { id: 'spor', label: 'SPOR SALONLARI' },
  { id: 'mobilya', label: 'MOBİLYA & DEKORASYON' },
  { id: 'otel', label: 'HOTELS & TURİZM' },
  { id: 'fabrika', label: 'SANAYİ & ÜRETİM' },
];

const limits = [10, 25, 50, 100, 250];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('deepvera_active_session') || sessionStorage.getItem('deepvera_active_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [view, setView] = useState<ViewState>(user ? 'dashboard' : 'landing');
  const [activeTab, setActiveTab] = useState<'search' | 'library'>('search');
  const [tokenBalance, setTokenBalance] = useState<number>(user?.tokenBalance || 100);
  
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('deepvera_current_participants');
    return saved ? JSON.parse(saved) : [];
  });

  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  
  const [queryContext, setQueryContext] = useState('');
  const [searchLimit, setSearchLimit] = useState<number>(10);
  const [selectedCountry, setSelectedCountry] = useState<string>("TÜRKİYE");
  const [selectedCity, setSelectedCity] = useState<string>("İSTANBUL");
  const [selectedSector, setSelectedSector] = useState<string>("SEKTÖR SEÇİN");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isWorkerOpen, setIsWorkerOpen] = useState(false);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const isUrlInput = queryContext.startsWith('http') || queryContext.startsWith('www');

  useEffect(() => {
    if (user) {
      const userStr = JSON.stringify(user);
      if (localStorage.getItem('deepvera_active_session')) {
        localStorage.setItem('deepvera_active_session', userStr);
      } else {
        sessionStorage.setItem('deepvera_active_session', userStr);
      }
    }
  }, [user]);

  const handleLogin = (loggedUser: User, remember: boolean) => {
    setUser(loggedUser);
    setTokenBalance(loggedUser.tokenBalance);
    setView('dashboard');
    const userStr = JSON.stringify(loggedUser);
    if (remember) localStorage.setItem('deepvera_active_session', userStr);
    else sessionStorage.setItem('deepvera_active_session', userStr);
  };

  const startAnalysis = async () => {
    if (tokenBalance < searchLimit) { 
      setIsPaymentModalOpen(true); 
      return; 
    }
    
    setStatus(AppStatus.LOADING);
    setCurrentStep('Web kaynakları taranıyor...');
    setProgressPercent(5);
    
    const finalSector = selectedSector === "SEKTÖR SEÇİN" ? "" : selectedSector;
    const finalLocation = isUrlInput ? "" : `${selectedCountry} ${selectedCity}`.trim();

    try {
      const results = await extractLeadList(
        queryContext || `${finalLocation} ${finalSector}`, 
        finalSector, 
        finalLocation, 
        searchLimit, 
        []
      );

      setCurrentStep('Firma listesi ayrıştırılıyor...');
      setProgressPercent(20);
      
      const newLeads: Participant[] = results.map(r => ({
        id: Math.random().toString(36),
        name: r.name || 'Bilinmeyen',
        website: r.website || '',
        email: 'Analiz ediliyor...',
        phone: r.phone || '...',
        status: 'pending',
        automationStatus: 'idle',
        funnelStatus: 'waiting',
        isSaved: false,
        location: r.location || finalLocation
      }));

      setParticipants(newLeads);
      setStatus(AppStatus.FINDING_DETAILS);

      let processed = 0;
      for (const lead of newLeads) {
        processed++;
        const currentProgress = 20 + Math.round((processed / newLeads.length) * 80);
        setProgressPercent(currentProgress);
        setCurrentStep(`[${processed}/${newLeads.length}] ${lead.name} nöral analizi...`);
        
        const intel = await findCompanyIntel(lead.name, lead.website, finalSector, user!);
        setParticipants(prev => prev.map(p => p.id === lead.id ? { ...p, ...intel, status: 'completed' } : p));
        
        setTokenBalance(b => {
            const newBalance = b - 1;
            if (user) {
              const updatedUser = { ...user, tokenBalance: newBalance };
              setUser(updatedUser);
              localStorage.setItem('deepvera_active_session', JSON.stringify(updatedUser));
            }
            return newBalance;
        });
      }
    } catch (e) { 
      console.error(e); 
      setStatus(AppStatus.FAILED);
    }
    setStatus(AppStatus.IDLE);
    setCurrentStep('');
    setProgressPercent(0);
  };

  const renderMainContent = () => {
    if (view === 'landing' && !user) {
      return <LandingPage onGetStarted={() => setView('login')} onToggleAssistant={() => setIsAssistantOpen(true)} />;
    }
    
    if (!user) {
      return <LoginForm onLogin={handleLogin} onCancel={() => setView('landing')} />;
    }

    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans relative">
        <Header 
          userName={user?.name} 
          tokenBalance={tokenBalance} 
          role={user?.role}
          onLogout={() => {
            setUser(null);
            localStorage.removeItem('deepvera_active_session');
            sessionStorage.removeItem('deepvera_active_session');
            setView('landing');
          }} 
          onBuyTokens={() => setIsPaymentModalOpen(true)}
          onOpenSettings={() => setIsIdentityModalOpen(true)} 
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenGmail={() => setIsGmailOpen(true)} 
          onOpenWorker={() => setIsWorkerOpen(true)}
          isGmailConnected={user?.isGmailConnected}
          queuedCount={participants.filter(p => p.automationStatus === 'queued').length}
        />

        <main className="flex-1 flex flex-col px-4 lg:px-8 py-4 gap-6 max-w-full relative">
          
          {/* Intelligence Operation Bar (Sticky) */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-3 shadow-sm shrink-0 flex flex-wrap lg:flex-nowrap items-center gap-2 sticky top-28 z-40 transition-all">
            <div className="flex-[2] min-w-[250px] relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input 
                type="text" value={queryContext} onChange={(e) => setQueryContext(e.target.value)}
                placeholder="Özel komut girin veya bir URL yapıştırın."
                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 border border-transparent rounded-xl text-[12px] font-bold text-slate-900 placeholder-slate-300 outline-none focus:bg-white focus:border-blue-100 transition-all"
              />
            </div>

            {!isUrlInput && (
              <>
                <div className="flex-1 min-w-[140px] relative">
                  <select 
                    value={selectedCountry} onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedCity(globalLocations[e.target.value][0]);
                    }}
                    className="w-full h-14 px-4 bg-slate-50/50 border border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none appearance-none cursor-pointer hover:bg-white transition-all"
                  >
                    {Object.keys(globalLocations).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex-1 min-w-[140px] relative">
                  <select 
                    value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full h-14 px-4 bg-slate-50/50 border border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none appearance-none cursor-pointer hover:bg-white transition-all"
                  >
                    {globalLocations[selectedCountry].map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>

                <div className="flex-1 min-w-[140px] relative">
                  <select 
                    value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full h-14 px-4 bg-slate-50/50 border border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none appearance-none cursor-pointer hover:bg-white transition-all"
                  >
                    {sectors.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="w-[120px] relative">
              <select 
                value={searchLimit} onChange={(e) => setSearchLimit(Number(e.target.value))}
                className="w-full h-14 px-4 bg-slate-50/50 border border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 outline-none appearance-none cursor-pointer hover:bg-white transition-all"
              >
                {limits.map(l => <option key={l} value={l}>{l} FİRMA</option>)}
              </select>
            </div>

            <button 
              onClick={startAnalysis} 
              disabled={status !== AppStatus.IDLE}
              className="h-14 px-8 bg-[#0f172a] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              DERİN ANALİZ 🚀
            </button>
          </div>

          <div className="flex gap-2 px-2 shrink-0">
            <button 
              onClick={() => setActiveTab('search')} 
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'search' ? 'bg-[#0f172a] text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
            >
              Canlı İstihbarat
            </button>
            <button 
              onClick={() => setActiveTab('library')} 
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-[#0f172a] text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
            >
              Veri Kütüphanesi
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 bg-white/50 rounded-[2rem] border border-slate-50/50 min-h-[600px] mb-32">
            {participants.length === 0 && status === AppStatus.IDLE ? (
              <div className="h-full py-40 flex flex-col items-center justify-center opacity-30 gap-4">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl grayscale">🔭</div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">VERİ BEKLENİYOR</span>
              </div>
            ) : (
              <DataTable 
                participants={participants} 
                status={status} 
                tokenBalance={tokenBalance} 
                onSelectParticipant={setSelectedParticipant}
                updateParticipant={(id, updates) => setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))}
                onExport={() => {}} 
                onClear={() => setParticipants([])}
                onStartAutomation={() => setIsWorkerOpen(true)}
              />
            )}
          </div>

          {/* Floating Global Assistant Button */}
          <button 
            onClick={() => setIsAssistantOpen(true)} 
            className="fixed bottom-10 right-10 z-[110] w-16 h-16 md:w-20 md:h-20 bg-emerald-500 text-white rounded-full flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:scale-110 hover:bg-slate-900 transition-all active:scale-95 group"
          >
            <div className="absolute -inset-2 bg-emerald-400 rounded-full blur opacity-20 group-hover:opacity-40 animate-pulse"></div>
            <div className="text-2xl md:text-3xl relative z-10">🤖</div>
            <span className="text-[7px] font-black uppercase tracking-tighter mt-1 relative z-10">DV_ASSISTANT</span>
          </button>

          {/* User-Friendly Floating Progress Bar (Fixed at bottom) */}
          {status !== AppStatus.IDLE && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[120] animate-fade-in">
              <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-5 flex items-center gap-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl shrink-0 animate-pulse shadow-lg shadow-blue-500/20">🧠</div>
                <div className="flex-1">
                   <div className="flex justify-between items-end mb-2.5">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{currentStep}</span>
                      <span className="text-[11px] font-black text-white">%{progressPercent}</span>
                   </div>
                   <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: `${progressPercent}%` }}></div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  };

  return (
    <>
      {renderMainContent()}
      <IdentityModal isOpen={isIdentityModalOpen} onClose={() => setIsIdentityModalOpen(false)} user={user} onUpdate={(f) => setUser(prev => prev ? { ...prev, ...f } : null)} />
      <AutonomousWorker user={user} participants={participants} updateParticipant={(id, u) => setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...u } : p))} updateUser={(u) => setUser(prev => prev ? { ...prev, ...u } : null)} isOpen={isWorkerOpen} onClose={() => setIsWorkerOpen(false)} />
      <CompanyDetail participant={selectedParticipant} onClose={() => setSelectedParticipant(null)} user={user} updateParticipant={(id, u) => setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...u } : p))} />
      {isGmailOpen && <GmailCenter user={user} onClose={() => setIsGmailOpen(false)} participants={participants} updateParticipant={(id, u) => setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...u } : p))} />}
      <DeepVeraAssistant user={user} isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSuccess={(t) => setTokenBalance(b => b + t)} onUpgrade={() => {}} />
      {isAdminOpen && <AdminPanel currentUser={user} onClose={() => setIsAdminOpen(false)} />}
    </>
  );
};

export default App;
