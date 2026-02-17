
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

const SECTORS = [
  { id: 'cafeteria', label: 'Kafeterya', icon: '☕' },
  { id: 'restaurant', label: 'Restoran', icon: '🍽️' },
  { id: 'real_estate', label: 'Emlak / Gayrimenkul', icon: '🏠' },
  { id: 'beach', label: 'Beach / Plaj', icon: '🏖️' },
  { id: 'hotel', label: 'Otel', icon: '🏨' },
  { id: 'hospital', label: 'Hastane', icon: '🏥' },
  { id: 'pharmacy', label: 'Eczane', icon: '💊' },
  { id: 'beauty', label: 'Güzellik Merkezi', icon: '💄' },
  { id: 'mall', label: 'AVM', icon: '🛍️' },
  { id: 'clothing', label: 'Giyim', icon: '👕' },
  { id: 'shoes', label: 'Ayakkabı', icon: '👞' },
  { id: 'school', label: 'Özel Okul', icon: '🏫' },
];

const SEARCH_LIMITS = [10, 25, 50, 100, 250];

const TURKISH_CITIES = [
  "Tüm Türkiye", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", 
  "Gaziantep", "Kayseri", "Kocaeli", "Mersin", "Diyarbakır", "Denizli", "Samsun", 
  "Muğla", "Aydın", "Balıkesir", "Tekirdağ", "Sakarya", "Eskişehir"
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('deepvera_active_session') || sessionStorage.getItem('deepvera_active_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [view, setView] = useState<ViewState>(user ? 'dashboard' : 'landing');
  const [activeTab, setActiveTab] = useState<'search' | 'library'>('search');
  const [tokenBalance, setTokenBalance] = useState<number>(user?.tokenBalance || 50);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem('deepvera_saved_searches');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [queryContext, setQueryContext] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isConnectMenuOpen, setIsConnectMenuOpen] = useState(false);
  
  const [searchLimit, setSearchLimit] = useState<number>(10);
  const [selectedCity, setSelectedCity] = useState<string>("Tüm Türkiye");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isWorkerOpen, setIsWorkerOpen] = useState(false);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

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
    setSelectedParticipant(null);
    setStatus(AppStatus.LOADING);
    
    const finalSector = selectedSector || "Genel Şirketler";
    const finalLocation = selectedDistrict ? `${selectedCity}, ${selectedDistrict}` : selectedCity;
    const finalQuery = queryContext || `${finalLocation} bölgesindeki ${finalSector}`;

    try {
      const results = await extractLeadList(finalQuery, finalSector, finalLocation, searchLimit, []);
      const newLeads: Participant[] = results.map(r => ({
        id: Math.random().toString(36),
        name: r.name || 'Bilinmeyen',
        website: r.website || '',
        email: 'Analiz ediliyor...',
        phone: r.phone || '...',
        status: 'pending',
        automationStatus: 'idle',
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

  const loadSavedSearch = (search: SavedSearch) => {
    setParticipants(search.participants);
    setSelectedCity(search.city);
    setSelectedSector(search.sector);
    setActiveTab('search');
  };

  const deleteSavedSearch = (id: string) => {
    if (confirm("Bu arama kaydını silmek istediğinize emin misiniz?")) {
      setSavedSearches(savedSearches.filter(s => s.id !== id));
    }
  };

  const exportToExcel = () => {
    if (participants.length === 0) return;
    // CSV oluşturma
    const headers = ["Firma Adi", "Web Sitesi", "Email", "Telefon", "Konum", "Yildiz Puani", "Sektor"];
    const rows = participants.map(p => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.website || '').replace(/"/g, '""')}"`,
      `"${(p.email || '').replace(/"/g, '""')}"`,
      `"${(p.phone || '').replace(/"/g, '""')}"`,
      `"${(p.location || '').replace(/"/g, '""')}"`,
      p.starRating || 0,
      `"${(p.industry || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `DeepVera_Istihbarat_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] shrink-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[280px] relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  type="text" value={queryContext} onChange={(e) => setQueryContext(e.target.value)}
                  placeholder="Özel komut girin veya bir URL yapıştırın..."
                  className="w-full h-12 pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="flex items-center gap-2">
                <select 
                  value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                  className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-[10px] font-black uppercase outline-none focus:border-blue-400 cursor-pointer min-w-[130px] transition-all"
                >
                  {TURKISH_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>

                <input 
                  type="text" 
                  value={selectedDistrict} 
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  placeholder="İlçe Girin..."
                  className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-[10px] font-black uppercase outline-none focus:border-blue-400 min-w-[120px] transition-all placeholder:text-slate-300"
                />

                <select 
                  value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}
                  className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-[10px] font-black uppercase outline-none focus:border-blue-400 cursor-pointer min-w-[150px] transition-all"
                >
                  <option value="">Sektör Seçin</option>
                  {SECTORS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                </select>

                <select 
                  value={searchLimit} onChange={(e) => setSearchLimit(Number(e.target.value))}
                  className="h-12 bg-blue-50/30 border border-blue-100/50 rounded-xl px-4 text-[10px] font-black uppercase outline-none focus:border-blue-400 cursor-pointer text-blue-600 min-w-[110px] transition-all"
                >
                  {SEARCH_LIMITS.map(limit => <option key={limit} value={limit}>{limit} Firma</option>)}
                </select>
              </div>

              <button 
                onClick={startAnalysis} 
                disabled={status !== AppStatus.IDLE} 
                className="h-12 px-8 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:bg-blue-600 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {status === AppStatus.IDLE ? (
                  <><span>DERİN ANALİZ</span><div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center text-xs">🚀</div></>
                ) : (
                  <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>OPERASYONDA</span></>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-4 px-2 shrink-0">
          <button onClick={() => setActiveTab('search')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'search' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>Canlı İstihbarat</button>
          <button onClick={() => setActiveTab('library')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>Veri Kütüphanesi</button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'search' ? (
            <DataTable 
              participants={participants} 
              status={status} 
              tokenBalance={tokenBalance} 
              onSelectParticipant={setSelectedParticipant}
              updateParticipant={updateParticipant}
              onExport={exportToExcel} 
              onClear={() => setParticipants([])}
              onSaveToLibrary={handleSaveSearch}
              currentFilters={{ city: selectedCity, sector: selectedSector }}
              onStartAutomation={() => setIsWorkerOpen(true)}
            />
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               {savedSearches.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-20">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-sm font-black text-slate-900 uppercase">Kütüphane Henüz Boş</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Arama sonuçlarınızı buraya arşivleyerek kalıcı hale getirebilirsiniz.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {savedSearches.map((s) => (
                      <div key={s.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm group hover:border-blue-400 transition-all cursor-pointer" onClick={() => loadSavedSearch(s)}>
                         <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">📁</div>
                            <button onClick={(e) => { e.stopPropagation(); deleteSavedSearch(s.id); }} className="text-slate-300 hover:text-red-500 text-2xl transition-colors">&times;</button>
                         </div>
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{s.name}</h4>
                         <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                               <span>Kayıt Tarihi</span>
                               <span className="text-slate-900">{s.date}</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                               <span>Bölge / Sektör</span>
                               <span className="text-slate-900">{s.city} / {s.sector || 'Genel'}</span>
                            </div>
                         </div>
                         <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{s.count} Şirket İstihbaratı</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase group-hover:text-blue-600">Verileri Aç ➔</span>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-10 right-10 z-[300] flex flex-col items-end gap-6">
         <div className={`flex flex-col items-end gap-5 transition-all duration-500 transform origin-bottom ${isConnectMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-12 pointer-events-none'}`}>
            <a href="https://wa.me/902122630900" target="_blank" className="flex items-center gap-5 group">
               <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl shadow-xl">WhatsApp Hattı</span>
               <div className="w-16 h-16 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-transform">💬</div>
            </a>
            <button onClick={() => setIsAssistantOpen(true)} className="flex items-center gap-5 group">
               <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl shadow-xl">DeepVera Rehber</span>
               <div className="w-16 h-16 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-transform">🧠</div>
            </button>
         </div>
         <button onClick={() => setIsConnectMenuOpen(!isConnectMenuOpen)} className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all ${isConnectMenuOpen ? 'bg-slate-900 rotate-45' : 'bg-blue-600'} text-white font-black`}>
            {isConnectMenuOpen ? '×' : 'DV'}
         </button>
      </div>

      <IdentityModal isOpen={isIdentityModalOpen} onClose={() => setIsIdentityModalOpen(false)} user={user} onUpdate={(f) => setUser(u => u ? {...u, ...f} : null)} />
      <AutonomousWorker user={user} participants={participants} updateParticipant={updateParticipant} isOpen={isWorkerOpen} onClose={() => setIsWorkerOpen(false)} />
      <CompanyDetail participant={selectedParticipant} onClose={() => setSelectedParticipant(null)} user={user} updateParticipant={updateParticipant} />
      {isGmailOpen && <GmailCenter user={user} onClose={() => setIsGmailOpen(false)} />}
      <DeepVeraAssistant user={user} isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSuccess={(t) => setTokenBalance(b => b + t)} onUpgrade={() => {}} />
      {isAdminOpen && <AdminPanel currentUser={user} onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
};

export default App;
