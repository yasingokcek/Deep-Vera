
import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onToggleAssistant: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onToggleAssistant }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectors = [
    { title: "Sigorta & Finans", desc: "Acente ağınızı sizin yerinize tarar, risk analizini yapar ve otonom iş birliği mesajlarını ileterek sizi direkt masaya oturtur.", metric: "+%35 Verim", icon: "🛡️" },
    { title: "Global Lojistik", desc: "Tedarik zinciri liderlerini bulur, operasyonel ihtiyaçlarını anlar ve sizin adınıza profesyonel teklif sunar.", metric: "-%65 Efor", icon: "🚚" },
    { title: "Sağlık Turizmi", desc: "Global partner adaylarını tespit eder, kliniğinizi tanıtır ve ilk randevuyu otonom olarak sizin yerinize kurgular.", metric: "+%30 Lead", icon: "🏥" },
    { title: "Horeka Tedarik", desc: "Otel ve restoran satın alma müdürlerini bulur, tedarik gücünüzü sizin adınıza anlatarak satış sürecini başlatır.", metric: "4X Erişim", icon: "🍽️" },
    { title: "Sanayi & Üretim", desc: "Parça ve hammadde ihtiyacı olan fabrikaları bulur, üretim kapasitenizi otonom olarak onlara sunar.", metric: "-%50 Süre", icon: "🏭" },
    { title: "Kurumsal Danışmanlık", desc: "Şirketlerin büyüme sancılarını teşhis eder ve çözüm önerilerinizi otonom bir dille karar vericilere ulaştırır.", metric: "+%40 Dönüşüm", icon: "👔" }
  ];

  const workflowStages = [
    { 
      id: "01", 
      title: "Otonom Veri Hasadı", 
      desc: "DeepVera, hedeflerinizle uyumlu global ağları (LinkedIn, Haberler, Bilançolar) saniyeler içinde tarayarak dijital istihbarat toplar.",
      tech: "Neural Crawling Core"
    },
    { 
      id: "02", 
      title: "Bilişsel Eşleşme", 
      desc: "Toplanan verileri şirketinizin 'değer önerisi' ile çapraz analiz eder. Sadece sizinle çalışmaya en hazır olan kontakları belirler.",
      tech: "Cognitive Scoring Engine"
    },
    { 
      id: "03", 
      title: "Sizin Adınıza İletişim", 
      desc: "Ajanlarımız, sizin dijital temsilciniz olarak kontaklara ulaşır ve iletişime geçer. Siz sadece randevu onayı gelen e-postalara dönersiniz.",
      tech: "Autonomous Outreach Proxy"
    }
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden relative max-w-full">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-3xl h-20 border-b border-slate-100 shadow-sm' : 'h-24 bg-transparent'}`}>
        <div className="container mx-auto px-6 lg:px-14 h-full flex justify-between items-center">
          <div className="flex items-center gap-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 to-transparent"></div>
                   DV
                </div>
                <div className="flex flex-col leading-none">
                   <span className="text-xl font-black tracking-tighter uppercase text-slate-900">AI <span className="text-blue-600">DeepVera</span></span>
                   <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Autonomous Business Engine</span>
                </div>
             </div>
             
             <div className="hidden lg:flex items-center gap-8 ml-10 border-l border-slate-100 pl-10">
                <a href="#matrix" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">Sektörel Matris</a>
                <a href="#core-engine" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">Otonom Akış</a>
                <a href="#support" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">İletişim</a>
             </div>
          </div>

          <div className="flex items-center gap-8">
            <button onClick={onGetStarted} className="px-10 py-3.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl active:scale-95">SİSTEME GİRİŞ</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden max-w-full">
        <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-600/5 blur-[150px] -z-10 animate-pulse rounded-full"></div>

        <div className="container mx-auto px-6 lg:px-14 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 reveal-left">
            <div className="inline-flex items-center gap-4 px-6 py-2 bg-blue-50 border border-blue-100 rounded-full">
               <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">Otonom Satış Ajanları Aktif</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[80px] font-black uppercase leading-[0.85] tracking-tighter text-slate-900">
              Siz Strateji Kurun, <br/>
              <span className="text-blue-600 italic">Müşteriyi DeepVera <br/>Bulup Getirsin.</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-500 font-medium leading-relaxed max-w-xl">
              DeepVera otonom ajanları pazarınızı tarar, doğru karar vericiyi bulur ve sizin yerinize ilk teması kurarak satışın fitilini ateşler.
            </p>
            
            <div className="flex flex-wrap items-center gap-8 pt-4">
               <button onClick={onGetStarted} className="px-12 md:px-16 py-6 md:py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-slate-900 transition-all shadow-2xl shadow-blue-200 active:scale-95">
                  Operasyonu Başlat
               </button>
               <button onClick={onToggleAssistant} className="px-8 py-6 md:py-8 border-2 border-slate-100 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest hover:border-blue-600 transition-all">Sistemi AI'ya Sor</button>
            </div>
          </div>

          <div className="relative hidden lg:block">
             <div className="w-full aspect-square border-2 border-dashed border-slate-100 rounded-full flex items-center justify-center p-20 animate-[spin_60s_linear_infinite]">
                <div className="w-full h-full border border-blue-100 rounded-full relative">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-xl">🔍</div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-xl">📧</div>
                   <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-xl">🧠</div>
                   <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-xl">🤝</div>
                </div>
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-slate-900 text-white rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-8 text-center animate-bounce">
                   <div className="text-4xl mb-4">🤖</div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">The Machine</span>
                   <p className="text-[11px] font-bold mt-2 leading-relaxed italic">Sizin yerinize iletişime geçiyoruz.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Sektörel Büyüme Matrisi */}
      <section id="matrix" className="py-40 bg-white relative max-w-full">
        <div className="container mx-auto px-6 lg:px-14 text-center">
           <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em] mb-4 block">Sectoral Penetration Matrix</span>
           <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-24">Global <span className="text-blue-600 italic">Müşteri Havuzu</span></h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sectors.map((s, i) => (
                <div key={i} className="group p-12 bg-slate-50/50 rounded-[4rem] border border-transparent hover:border-blue-500/20 hover:bg-white hover:shadow-2xl transition-all duration-500 text-left">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl mb-10 shadow-sm border border-slate-100 group-hover:scale-110 transition-all duration-500">
                      {s.icon}
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">{s.title}</h3>
                   <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 opacity-70 group-hover:opacity-100 transition-opacity">{s.desc}</p>
                   <div className="flex items-center justify-between border-t border-slate-100 pt-8">
                      <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-600 transition-colors">
                        {s.metric} Verimlilik
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* The Core Engine Machine */}
      <section id="core-engine" className="py-40 bg-slate-950 relative overflow-hidden max-w-full">
        <div className="container mx-auto px-6 lg:px-14 relative z-10">
           <div className="text-center mb-32">
              <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.5em] mb-4 block">The Autonomous Workflow</span>
              <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter text-white">Size Nasıl <span className="text-blue-500 italic">Müşteri Buluyoruz?</span></h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {workflowStages.map((stage, i) => (
                <div key={i} className="relative group">
                   <div className="absolute -top-10 left-10 text-[100px] font-black text-white/[0.03] group-hover:text-blue-600/10 transition-colors select-none">{stage.id}</div>
                   <div className="bg-white/5 border border-white/10 p-12 rounded-[3.5rem] relative z-10 h-full flex flex-col hover:border-blue-600/50 transition-all duration-500">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">{stage.title}</h4>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed mb-12 flex-1">{stage.desc}</p>
                      <div className="flex items-center gap-3 border-t border-white/5 pt-8">
                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
                         <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{stage.tech}</span>
                      </div>
                   </div>
                   {i < 2 && (
                     <div className="hidden lg:block absolute top-1/2 -right-10 translate-y-1/2 text-4xl text-blue-600/20 animate-pulse">➔</div>
                   )}
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="support" className="bg-slate-950 text-white py-32 relative overflow-hidden max-w-full">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10"></div>
         <div className="container mx-auto px-6 lg:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
               <div className="space-y-10">
                  <h3 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-none">Global Satışı <br/> <span className="text-blue-600">DeepVera ile Ölçekleyin.</span></h3>
                  <p className="text-slate-400 text-lg font-medium max-w-md">DeepVera Architect (DV-A), şirketiniz için 7/24 çalışan bir satış mühendisi olarak yeni pazarların kapısını sizin yerinize aralar.</p>
               </div>

               <div className="bg-white/5 border border-white/10 p-8 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden">
                  <h4 className="text-3xl font-black uppercase tracking-tighter mb-10 leading-tight italic">Stratejik Mühendislik & İletişim</h4>
                  <div className="space-y-6">
                     <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Resmi Mühendislik Hattı</span>
                        <a href="tel:+902122630900" className="text-2xl font-black hover:text-blue-500 transition-colors tracking-tighter">+90 212 263 09 00</a>
                     </div>
                     <div className="flex flex-col gap-1 pt-6 border-t border-white/5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Yazışma Sinyali</span>
                        <a href="mailto:ai@deepvera.com.tr" className="text-xl font-black hover:text-blue-500 transition-colors tracking-tight">ai@deepvera.com.tr</a>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">© 2024 DEEPVERA AI INTELLIGENCE / ALL SYSTEMS OPERATIONAL</span>
               <div className="flex gap-8">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-not-allowed">Privacy_Policy</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-not-allowed">Terms_of_Service</span>
               </div>
            </div>
         </div>
      </footer>

      {/* AI Assistant Floating Button */}
      <button 
        onClick={onToggleAssistant} 
        className="fixed bottom-10 right-10 z-[110] w-16 h-16 md:w-20 md:h-20 bg-emerald-500 text-white rounded-full flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:scale-110 hover:bg-slate-900 transition-all active:scale-95 group"
      >
        <div className="absolute -inset-2 bg-emerald-400 rounded-full blur opacity-20 group-hover:opacity-40 animate-pulse"></div>
        <div className="text-2xl md:text-3xl relative z-10">🤖</div>
        <span className="text-[7px] font-black uppercase tracking-tighter mt-1 relative z-10">DV_ASSISTANT</span>
      </button>

      <style>{`
        @keyframes revealLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        .reveal-left { animation: revealLeft 1s ease-out forwards; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default LandingPage;
