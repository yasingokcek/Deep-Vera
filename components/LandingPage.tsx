
import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectors = [
    { title: "Sigorta Şirketleri", desc: "Acente ağınızı genişletin ve kurumsal portföy yönetimini otonom hale getirin.", metric: "+%35 Verimlilik", icon: "🛡️" },
    { title: "Horeka Tedarikçileri", desc: "Otel, restoran ve kafelere özel tekliflerinizi otonom ajanlarla ulaştırın.", metric: "4X Daha Hızlı", icon: "🍽️" },
    { title: "Sağlık Turizmi", desc: "Uluslararası hasta potansiyelini ve partner ajansları otonom analiz edin.", metric: "+%30 Yeni Lead", icon: "🏥" },
    { title: "Lojistik & Nakliye", desc: "Küresel tedarik zinciri ağındaki karar vericilerle stratejik bağ kurun.", metric: "-%65 Manuel Efor", icon: "🚚" },
    { title: "Kurumsal Danışmanlık", desc: "Büyük ölçekli şirketlerin güncel ihtiyaçlarını yapay zeka ile tespit edin.", metric: "+%40 Dönüşüm", icon: "👔" },
    { title: "E-Ticaret & Perakende", desc: "Tedarikçi ağınızı genişletin ve toptan satış kanallarınızı yönetin.", metric: "+%40 Satış Hacmi", icon: "🛒" },
    { title: "Üretim & Sanayi", desc: "Endüstriyel parça ve hammadde ihtiyaçları için global üreticilere ulaşın.", metric: "-%50 Tedarik Süresi", icon: "🏭" },
    { title: "Enerji & Altyapı", desc: "Yeşil enerji projeleri için küresel yatırımcıları tarayın.", metric: "%100 İsabet", icon: "🔋" }
  ];

  const navLinks = [
    { label: "Neden Biz?", href: "#why-us" },
    { label: "Biz Kimiz?", href: "#who-we-are" },
    { label: "Nasıl Çalışır?", href: "#how-it-works" },
    { label: "İletişim", href: "#footer" }
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden relative">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-3xl h-20 border-b border-slate-100 shadow-sm' : 'h-24 bg-transparent'}`}>
        <div className="container mx-auto px-6 lg:px-14 h-full flex justify-between items-center">
          <div className="flex items-center gap-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg">DV</div>
                <div className="flex flex-col leading-none">
                   <span className="text-xl font-black tracking-tighter uppercase text-slate-900">AI <span className="text-blue-600">DeepVera</span></span>
                   <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Otonom Satış Ajanları</span>
                </div>
             </div>
             
             {/* Desktop Nav Links */}
             <div className="hidden lg:flex items-center gap-8 border-l border-slate-100 pl-10">
                {navLinks.map(link => (
                  <a key={link.label} href={link.href} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                    {link.label}
                  </a>
                ))}
             </div>
          </div>

          <div className="flex items-center gap-8">
            <button onClick={onGetStarted} className="px-8 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Giriş Yap</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-slate-50/50 blur-[120px] -z-10 opacity-30"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 blur-[150px] -z-10 animate-pulse"></div>

        <div className="container mx-auto px-6 lg:px-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-10 reveal-left">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-50 border border-blue-100 rounded-full">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">Otonom Satış Ajanları Aktif</span>
            </div>
            
            <h1 className="text-5xl lg:text-[100px] font-black uppercase leading-[0.85] tracking-tighter text-slate-900">
              Siz Strateji Kurun, <br/>
              <span className="text-blue-600 italic">Satışı DeepVera Başlatsın.</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-500 font-medium leading-relaxed max-w-xl">
              Hedeflerinizi belirleyin, otonom ajanlarımız dünyayı tarasın. Manuel aramalarla vakit kaybetmeyin; sadece masanıza düşen reddedilemez teklifleri yönetin.
            </p>
            
            <div className="flex items-center gap-6">
               <button onClick={onGetStarted} className="px-14 py-7 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-2xl shadow-blue-200 active:scale-95">
                  Sistemi Başlat
               </button>
            </div>
          </div>

          <div className="relative group perspective">
             <div className="relative w-full aspect-square max-w-2xl mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
                <div className="w-80 h-80 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-[3rem] rotate-12 group-hover:rotate-45 transition-all duration-[2s] shadow-2xl relative flex items-center justify-center border-4 border-white/20">
                   <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-[3rem]"></div>
                   <div className="relative z-10 text-white text-9xl font-black">AI</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Sektörel Çözümler */}
      <section id="sectors" className="py-40 bg-white border-t border-slate-50">
        <div className="container mx-auto px-6 lg:px-14 text-center">
           <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">Nerede Kullanılır?</span>
           <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-24">Global <span className="text-blue-600 italic">Büyüme Matrisi</span></h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sectors.map((s, i) => (
                <div key={i} className="group relative p-10 bg-slate-50 rounded-[3rem] border border-transparent hover:border-blue-500/20 transition-all duration-500 text-left">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      {s.icon}
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">{s.title}</h3>
                   <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8 opacity-80">{s.desc}</p>
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                      {s.metric}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer / Kurumsal İletişim */}
      <footer id="footer" className="bg-slate-900 text-white py-24 relative overflow-hidden">
         <div className="container mx-auto px-6 lg:px-14 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div>
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center font-black text-xl">DV</div>
                     <span className="text-2xl font-black tracking-tighter uppercase">AI <span className="text-blue-500">DeepVera</span></span>
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter leading-tight mb-6">Satışın Geleceğini <br/> <span className="text-blue-500">Birlikte İnşa Edelim.</span></h3>
                  <p className="text-white/40 text-lg font-medium max-w-md">DeepVera otonom ajanları, şirketinizin büyüme hedeflerini saniyeler içinde analiz eder ve harekete geçer.</p>
               </div>

               <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8">
                     <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Kurumsal Destek Hattı</span>
                        <a href="tel:+902122630900" className="text-3xl font-black hover:text-blue-500 transition-colors tracking-tighter">+90 212 263 09 00</a>
                     </div>
                     <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">WhatsApp İletişim</span>
                        <a href="https://wa.me/902122630900" target="_blank" rel="noopener noreferrer" className="text-3xl font-black hover:text-emerald-500 transition-colors tracking-tighter">Hızlı Mesaj Gönder</a>
                     </div>
                  </div>
                  <div className="flex justify-between items-center px-6">
                     <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">DeepVera Intelligence Systems © 2024</span>
                     <div className="flex gap-6">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white transition-colors cursor-pointer">KVKK</span>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white transition-colors cursor-pointer">Gizlilik</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      </footer>

      {/* Persistent WhatsApp FAB for Landing Page */}
      <a 
        href="https://wa.me/902122630900" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-10 right-10 z-[110] w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl shadow-2xl shadow-emerald-200 hover:scale-110 hover:bg-emerald-600 transition-all active:scale-95 group"
      >
        <div className="absolute -inset-1 bg-emerald-400 rounded-full blur opacity-20 group-hover:opacity-40 animate-pulse"></div>
        <span className="relative z-10">💬</span>
        <div className="absolute right-20 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl">
           WhatsApp İletişim Hattı
        </div>
      </a>

      <style>{`
        @keyframes revealLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .reveal-left { animation: revealLeft 1s ease-out forwards; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default LandingPage;
