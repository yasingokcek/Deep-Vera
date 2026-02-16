
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

const COUNTRIES = [
  "Türkiye", "ABD", "Almanya", "İngiltere", "Fransa", "Japonya", "Güney Kore", "Kanada", "Avustralya", "Hollanda", "İsviçre", "İsveç", "Norveç", "Danimarka", "Finlandiya", "İtalya", "İspanya", "İsrail", "Singapur", "Birleşik Arap Emirlikleri"
];

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
  const [selectedCountry, setSelectedCountry] = useState<string>('Türkiye');
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

  const addLog = (msg: string) => setLogs([msg]);

  const clearParticipants = () => {
    if (window.confirm("Tüm istihbarat havuzunu temizlemek istediğinizden emin misiniz?")) {
      setParticipants([]);
      localStorage.removeItem('deepvera_leads_cache');
      setSelectedParticipant(null);
    }
  };

  const exportToExcel = () => {
    if (participants.length === 0) return;
    const headers = ["Şirket Adı", "Web Sitesi", "E-posta", "Telefon", "Sektör", "Konum", "LinkedIn", "Instagram", "X", "Buzkıran", "Konu", "Mesaj"];
    const rows = participants.map(p => [
      p.name, p.website, p.email, p.phone, p.industry, p.location, p.linkedin || '', p.instagram || '', p.twitter || '', p.icebreaker || '', p.emailSubject || '', (p.emailDraft || '').replace(/\n/g, ' [P] ')
    ]);
    const csvContent = [headers.join(";"), ...rows.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(";"))].join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DeepVera_Rapor.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startAnalysis = async () => {
    if (tokenBalance < 1) { setIsPaymentModalOpen(true); return; }
    stopAnalysisRef.current = false;
    setStatus(AppStatus.LOADING);
    setLogs(["Arama Başlatılıyor..."]);
    
    try {
      const sectorLabel = SECTORS.find(s => s.id === selectedSector)?.label;
      const locationLabel = targetCityName ? `${targetCityName}, ${selectedCountry}` : selectedCountry;
      const activeQuery = queryContext.trim() || `${sectorLabel} companies in ${locationLabel}`;

      const rawResults = await extractLeadList(activeQuery, selectedSector, locationLabel, leadLimit, participants.map(p => p.name), (msg) => addLog(msg));
      
      if (!rawResults || rawResults.length === 0) { 
        addLog("Sonuç bulunamadı.");
        setStatus(AppStatus.IDLE); 
        return; 
      }

      const initialLeads: Participant[] = rawResults.slice(0, leadLimit).map(r => ({
        id: `p-${Date.now()}-${Math.random()}`,
        name: r.name || 'Şirket',
        website: r.website || '',
        email: 'Ayıklanıyor...',
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
        try {
          await sleep(500);
          const intel = await findCompanyIntel(current.name, current.website, selectedSector, user!, (msg) => addLog(msg));
          const updatedLead = { ...current, ...intel, status: 'completed' as const };
          setParticipants(prev => prev.map(p => p.id === current.id ? updatedLead : p));
          setTokenBalance(prev => Math.max(0, prev - 1));
        } catch (error) {
          setParticipants(prev => prev.map(p => p.id === current.id ? { ...p, status: 'failed' as const } : p));
        }
      }
    } catch (err) { 
      addLog("Sistem Kesintiye Uğradı.");
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
          <header className="min-h-[80px] sm:h-20 shrink-0 flex flex-col sm:flex-row items-center px-4 sm:px-8 py-3 sm:py-0 border-b border-slate-100 bg-white sticky top-0 z-[60] shadow-sm gap-4 sm:gap-0">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4 min-w-fit">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 text-white rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs sm:text-base">DV</div>
                <div className="flex flex-col leading-none">
                  <span className="font-black text-sm sm:text-base tracking-tighter uppercase">DeepVera <span className="text-blue-600">AI</span></span>
                  <span className="text-[6px] font-black text-slate-400 uppercase tracking-[0.3em] mt-0.5">İstihbarat</span>
                </div>
              </div>
              
              {/* Desktop Status Visual */}
              {status !== AppStatus.IDLE && (
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                  <div className="flex gap-0.5">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: `${i*0.2}s`}}></div>)}
                  </div>
                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Nöral Sistem Aktif</span>
                </div>
              )}

              <div className="flex sm:hidden items-center gap-3">
                <div className="flex flex-col items-end leading-none cursor-pointer" onClick={() => setIsPaymentModalOpen(true)}>
                  <span className="text-[10px] font-black text-blue-600">{tokenBalance}</span>
                  <span className="text-[5px] font-black text-slate-400 uppercase tracking-widest">KREDİ</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] grayscale" onClick={() => setIsIdentityModalOpen(true)}>⚙️</div>
              </div>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full max-w-7xl">
              <div className="w-full sm:flex-[2]">
                <input 
                  type="text"
                  value={queryContext}
                  onChange={(e) => setQueryContext(e.target.value)}
                  placeholder="Fuar URL'si veya Anahtar Kelime..."
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner"
                />
              </div>

              <div className={`flex items-center gap-2 w-full sm:w-auto ${isQueryActive ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                <select 
                  value={selectedSector} 
                  onChange={(e) => setSelectedSector(e.target.value)} 
                  className="h-10 bg-slate-50 border border-slate-100 rounded-xl px-2 text-[10px] font-black uppercase tracking-wider outline-none flex-1 sm:w-32"
                >
                  {SECTORS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                </select>

                <select 
                  value={selectedCountry} 
                  onChange={(e) => setSelectedCountry(e.target.value)} 
                  className="h-10 bg-slate-50 border border-slate-100 rounded-xl px-2 text-[10px] font-black uppercase tracking-wider outline-none flex-1 sm:w-40"
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center justify-center px-3 bg-slate-50 rounded-xl border border-slate-100 h-10 w-20 shrink-0">
                  <span className="text-[7px] font-black text-slate-400 uppercase mr-1">ADET:</span>
                  <input 
                    type="number"
                    value={leadLimit}
                    onChange={(e) => setLeadLimit(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-transparent text-[12px] font-black text-center outline-none text-blue-600"
                    min="1"
                  />
                </div>

                {status === AppStatus.IDLE ? (
                  <button onClick={startAnalysis} className="flex-1 sm:flex-none h-10 px-6 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg shadow-blue-100 active:scale-95 transition-all">🚀 BAŞLAT</button>
                ) : (
                  <button onClick={() => { stopAnalysisRef.current = true; setStatus(AppStatus.IDLE); }} className="flex-1 sm:flex-none h-10 px-6 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg animate-pulse transition-all">⏹️ DURDUR</button>
                )}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4 ml-6">
              <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-black cursor-pointer" onClick={() => setIsIdentityModalOpen(true)}>
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </header>
          
          <main className="flex-1 flex flex-col overflow-hidden">
            {status !== AppStatus.IDLE && (
              <div className="bg-[#00D1FF] px-4 py-2 flex items-center justify-between shadow-lg z-[55] border-b border-white/10 shrink-0 overflow-hidden relative">
                {/* Neural Scanning Animation */}
                <div className="absolute inset-0 scan-line opacity-20 pointer-events-none"></div>
                
                <div className="flex items-center gap-2 shrink-0 relative z-10">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest truncate">NÖRAL TARAMA DEVREDE</span>
                </div>
                <div className="flex-1 px-4 relative z-10">
                  <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white shadow-sm" style={{ width: `${(participants.filter(p => p.status === 'completed').length / (leadLimit || 1)) * 100}%` }}></div>
                  </div>
                </div>
                <div className="shrink-0 text-[8px] font-black text-white relative z-10">
                   {participants.filter(p => p.status === 'completed').length}/{leadLimit}
                </div>
              </div>
            )}

            <div className="flex-1 relative max-w-[1600px] mx-auto w-full px-4 sm:px-8 py-4 sm:py-8 overflow-y-auto no-scrollbar flex flex-col gap-4 sm:gap-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 shrink-0">
                 {[
                   { title: "HEDEF", icon: "🎯", desc: "Küresel Pazar" },
                   { title: "SOSYAL", icon: "📱", desc: "Sosyal Medya" },
                   { title: "ANALİZ", icon: "🧠", desc: "Ayrıştırma" },
                   { title: "TEKLİF", icon: "✉️", desc: "B2B Taslak" }
                 ].map((item, idx) => (
                   <div key={idx} className="bg-white border border-slate-100 p-2.5 sm:p-5 rounded-xl sm:rounded-[2rem] flex items-center gap-2 sm:gap-4 shadow-sm border-b-2 border-b-slate-50">
                      <div className="w-7 h-7 sm:w-12 sm:h-12 bg-slate-50 text-slate-900 rounded-lg sm:rounded-2xl flex items-center justify-center text-xs sm:text-xl shrink-0">
                         {item.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                         <h4 className="text-[8px] sm:text-[11px] font-black text-slate-900 uppercase truncate">{item.title}</h4>
                         <p className="text-[6px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <DataTable 
                participants={participants} 
                status={status} 
                tokenBalance={tokenBalance} 
                onSelectParticipant={setSelectedParticipant}
                onExport={exportToExcel} 
                onClear={clearParticipants}
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
