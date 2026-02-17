
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('deepvera_active_session') || sessionStorage.getItem('deepvera_active_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [view, setView] = useState<ViewState>(user ? 'dashboard' : 'landing');
  const [activeTab, setActiveTab] = useState<'search' | 'library'>('search');
  const [tokenBalance, setTokenBalance] = useState<number>(user?.tokenBalance || 50);
  
  // KALICILIK: participants listesini localStorage'dan yükle
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('deepvera_current_participants');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem('deepvera_saved_searches');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isConnectMenuOpen, setIsConnectMenuOpen] = useState(false);
  
  const [queryContext, setQueryContext] = useState('');
  const [searchLimit, setSearchLimit] = useState<number>(10);
  const [selectedCity, setSelectedCity] = useState<string>("Tüm Türkiye");
  const [selectedSector, setSelectedSector] = useState<string>("");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isWorkerOpen, setIsWorkerOpen] = useState(false);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // KALICILIK: participants her değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('deepvera_current_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('deepvera_saved_searches', JSON.stringify(savedSearches));
  }, [savedSearches]);

  const handleLogin = (u: User, remember: boolean) => {
    setUser(u);
    setTokenBalance(u.tokenBalance);
    const userStr = JSON.stringify(u);
    if (remember) localStorage.setItem('deepvera_active_session', userStr);
    else sessionStorage.setItem('deepvera_active_session', userStr);
    setView('dashboard');
    if (!u.companyName && u.provider !== 'demo') setIsIdentityModalOpen(true);
  };

  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const startAnalysis = async () => {
    if (tokenBalance < 1) { setIsPaymentModalOpen(true); return; }
    setStatus(AppStatus.LOADING);
    
    const finalSector = selectedSector || "Genel Şirketler";
    const finalLocation = selectedCity;

    try {
      const results = await extractLeadList(queryContext || `${finalLocation} ${finalSector}`, finalSector, finalLocation, searchLimit, []);
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
      
      for (const lead of newLeads) {
        const intel = await findCompanyIntel(lead.name, lead.website, finalSector, user!);
        setParticipants(prev => prev.map(p => p.id === lead.id ? { ...p, ...intel, status: 'completed' } : p));
        setTokenBalance(b => b - 1);
      }
    } catch (e) { console.error(e); }
    setStatus(AppStatus.IDLE);
  };

  const handleSaveSearch = (name: string) => {
    const newSave: SavedSearch = {
      id: Math.random().toString(36),
      name,
      date: new Date().toLocaleString('tr-TR'),
      city: selectedCity,
      sector: selectedSector,
      count: participants.length,
      participants: [...participants]
    };
    setSavedSearches([newSave, ...savedSearches]);
  };

  if (view === 'landing' && !user) return <LandingPage onGetStarted={() => setView('login')} />;
  if (!user) return <LoginForm onLogin={handleLogin} onCancel={() => setView('landing')} />;

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden font-sans">
      <Header 
        userName={user?.name} 
        tokenBalance={tokenBalance} 
        role={user?.role}
        onLogout={() => {
          setUser(null);
          localStorage.removeItem('deepvera_active_session');
          sessionStorage.removeItem('deepvera_active_session');
          // Çıkışta listeyi temizlemek opsiyoneldir, biz kalıcı bırakıyoruz.
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

      <main className="flex-1 flex flex-col overflow-hidden px-6 lg:px-14 py-6 gap-6 relative">
        {activeTab === 'search' && (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm shrink-0">
            <div className="flex flex-wrap items-center gap-4">
              <input 
                type="text" value={queryContext} onChange={(e) => setQueryContext(e.target.value)}
                placeholder="Özel komut veya URL..."
                className="flex-1 h-12 px-6 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold outline-none"
              />
              <button onClick={startAnalysis} disabled={status !== AppStatus.IDLE} className="h-12 px-8 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                {status === AppStatus.IDLE ? 'DERİN ANALİZ' : 'OPERASYONDA...'}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-4 px-2 shrink-0">
          <button onClick={() => setActiveTab('search')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'search' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'}`}>Canlı İstihbarat</button>
          <button onClick={() => setActiveTab('library')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'}`}>Veri Kütüphanesi</button>
        </div>

        <div className="flex-1 overflow-hidden">
          <DataTable 
            participants={participants} 
            status={status} 
            tokenBalance={tokenBalance} 
            onSelectParticipant={setSelectedParticipant}
            updateParticipant={updateParticipant}
            onExport={() => {}} 
            onClear={() => setParticipants([])}
            onSaveToLibrary={handleSaveSearch}
            onStartAutomation={() => setIsWorkerOpen(true)}
          />
        </div>
      </main>

      <IdentityModal isOpen={isIdentityModalOpen} onClose={() => setIsIdentityModalOpen(false)} user={user} onUpdate={(f) => setUser(u => u ? {...u, ...f} : null)} />
      <AutonomousWorker 
        user={user} 
        participants={participants} 
        updateParticipant={updateParticipant} 
        updateUser={(f) => setUser(u => u ? {...u, ...f} : null)}
        isOpen={isWorkerOpen} 
        onClose={() => setIsWorkerOpen(false)} 
      />
      <CompanyDetail participant={selectedParticipant} onClose={() => setSelectedParticipant(null)} user={user} updateParticipant={updateParticipant} />
      {isGmailOpen && <GmailCenter user={user} onClose={() => setIsGmailOpen(false)} participants={participants} updateParticipant={updateParticipant} />}
      <DeepVeraAssistant user={user} isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSuccess={(t) => setTokenBalance(b => b + t)} onUpgrade={() => {}} />
      {isAdminOpen && <AdminPanel currentUser={user} onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
};

export default App;
