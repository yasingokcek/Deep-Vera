
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

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: `radial-gradient(#2563eb 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-3xl h-20 border-b border-slate-100 shadow-sm' : 'h-24 bg-transparent'}`}>
        <div className="container mx-auto px-6 lg:px-12 h-full flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                <span className="relative z-10">DV</span>
             </div>
             <div className="flex flex-col leading-none text-left">
                <span className="text-xl font-black tracking-tighter uppercase text-slate-900">AI <span className="text-blue-600">DeepVera</span></span>
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Küresel İstihbarat</span>
             </div>
          </div>
          <div className="flex items-center gap-10">
             <div className="hidden lg:flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <a href="#how-it-works" className="hover:text-blue-600 transition-colors">Süreç</a>
                <a href="#features" className="hover:text-blue-600 transition-colors">Yetenekler</a>
                <a href="#sectors" className="hover:text-blue-600 transition-colors">Sektörler</a>
             </div>
             <button onClick={onGetStarted} className="px-8 py-3 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl">Giriş Yap</button>
          </div>
        </div>
      </nav>

      <header className="relative pt-48 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-50 border border-blue-100 rounded-full mb-10">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">Yeni Nesil B2B Satış Otomasyonu</span>
            </div>
            
            <h1 className="text-6xl lg:text-[110px] font-black uppercase leading-[0.9] tracking-tighter mb-10 text-slate-900">
              Manuel Arama <br/>
              <span className="text-blue-600 italic">Devrine Son.</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto mb-16">
              DeepVera, tek bir URL veya sektör komutuyla hedefleri belirler. Otonom ajanlarımız web'i tarar, karar vericileri bulur ve reddedilemez teklifler hazırlar.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-md mx-auto">
               <button onClick={onGetStarted} className="flex-1 px-12 py-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-2xl shadow-blue-200">
                  Sistemi Başlat
               </button>
               <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({behavior: 'smooth'})} className="flex-1 px-12 py-6 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-50 transition-all">
                  Nasıl Çalışır?
               </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-slate-900 py-10 overflow-hidden relative border-y border-white/5">
         <div className="flex animate-marquee whitespace-nowrap gap-20 items-center">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-10">
                <span className="text-white/20 font-black text-3xl uppercase tracking-tighter">250M+ Kurumsal Veri</span>
                <span className="text-blue-500 font-black text-3xl uppercase tracking-tighter">Gerçek Zamanlı Arama</span>
                <span className="text-white/20 font-black text-3xl uppercase tracking-tighter">AI Soğuk Erişim</span>
                <span className="text-emerald-500 font-black text-3xl uppercase tracking-tighter">%98 Doğrulama Oranı</span>
              </div>
            ))}
         </div>
      </div>

      <section id="how-it-works" className="py-32 bg-slate-50/50 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-24">
             <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">İstihbarat Akışı</span>
             <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter">DeepVera Nasıl <span className="text-blue-600">Düşünür?</span></h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
             <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-0"></div>
             
             {[
               { step: "01", title: "Hedef Belirleme", desc: "Bir fuar URL'si yapıştırın veya 'Sidney'deki Oteller' gibi bir komut verin.", icon: "🎯" },
               { step: "02", title: "Derin Tarama", desc: "AI ajanlarımız anında web sitelerini, sosyal ağları ve dijital ayak izlerini tarar.", icon: "🔍" },
               { step: "03", title: "İstihbarat", desc: "Karar verici isimleri, doğrulanmış e-postalar ve rakip analizleri listelenir.", icon: "🧠" },
               { step: "04", title: "Özel Teklif", desc: "AI, hizmetlerinizi hedefin hedefleriyle ilişkilendiren 1:1 bir teklif hazırlar.", icon: "✉️" }
             ].map((item, i) => (
               <div key={i} className="relative z-10 p-10 bg-white border border-slate-100 rounded-[3rem] shadow-xl hover:border-blue-500 transition-all group">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">{item.step} / ADIM</span>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-4">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                 <div className="space-y-4">
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">Derin Yetenekler</span>
                    <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-none">Sadece Bir Liste Değil, <br/><span className="text-blue-600">Bir Satış Silahı.</span></h2>
                 </div>
                 
                 <div className="space-y-8">
                    <div className="flex gap-6 group cursor-default">
                       <div className="w-12 h-12 bg-slate-900 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xl group-hover:bg-blue-600 transition-colors">🔥</div>
                       <div>
                          <h4 className="text-lg font-black uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors">Buzkıran Motoru</h4>
                          <p className="text-slate-500 text-sm font-medium">Gerçek zamanlı hedef verilerine dayalı kişiselleştirilmiş giriş cümleleri oluşturur.</p>
                       </div>
                    </div>
                    <div className="flex gap-6 group cursor-default">
                       <div className="w-12 h-12 bg-slate-900 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xl group-hover:bg-blue-600 transition-colors">⚔️</div>
                       <div>
                          <h4 className="text-lg font-black uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors">Rakip İstihbaratı</h4>
                          <p className="text-slate-500 text-sm font-medium">Rakipleri analiz ederek satış stratejinizi otomatik olarak optimize eder.</p>
                       </div>
                    </div>
                    <div className="flex gap-6 group cursor-default">
                       <div className="w-12 h-12 bg-slate-900 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xl group-hover:bg-blue-600 transition-colors">🚀</div>
                       <div>
                          <h4 className="text-lg font-black uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors">Otonom Pilot</h4>
                          <p className="text-slate-500 text-sm font-medium">Potansiyel müşterileri CRM veya e-posta sisteminizle otomatik senkronize etmek için Webhook desteği.</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="relative group">
                 <div className="absolute -inset-20 bg-blue-600/10 blur-[120px] rounded-full group-hover:bg-blue-600/20 transition-all duration-1000"></div>
                 <div className="relative bg-[#0a0c10] rounded-[4rem] p-8 lg:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden min-h-[620px] flex flex-col text-left">
                    <div className="relative z-10 flex justify-between items-center mb-10">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                       </div>
                       <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                          <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.3em] animate-pulse">Nöral Sistem Aktif</span>
                       </div>
                    </div>
                    <div className="relative z-20 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                       <div className="flex items-center gap-6 mb-8">
                          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl">🏢</div>
                          <div className="space-y-2">
                             <div className="h-4 w-48 bg-white/20 rounded-full"></div>
                             <div className="h-2 w-32 bg-white/10 rounded-full"></div>
                          </div>
                       </div>
                       <div className="space-y-6">
                          <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                             <label className="text-[7px] font-black text-blue-400 uppercase tracking-widest block mb-2">Oluşturulan Buzkıran</label>
                             <p className="text-[11px] text-white/70 italic leading-relaxed">
                                "Yeni Güney Galler'deki son genişlemeniz, enerji optimizasyonu çözümlerimizle mükemmel bir uyum sağlıyor..."
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <section className="py-40 relative overflow-hidden">
         <div className="absolute inset-0 bg-blue-600 z-0"></div>
         <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center">
            <h2 className="text-5xl lg:text-[100px] font-black text-white uppercase tracking-tighter leading-[0.9] mb-16">
               Veriyi Güce, <br/> Gücü Satışa Dönüştürün.
            </h2>
            <button onClick={onGetStarted} className="px-20 py-8 bg-white text-blue-600 rounded-[2.5rem] font-black text-xl uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-900 hover:text-white transition-all">
               Şimdi Ücretsiz Deneyin
            </button>
            <p className="text-white/60 font-bold uppercase tracking-widest mt-12">Kredi kartı gerekmez • 1500 Ücretsiz Kredi Dahil</p>
         </div>
      </section>

      <footer className="py-20 border-t border-slate-100 bg-white">
         <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black">DV</div>
               <span className="text-lg font-black uppercase tracking-tighter">AI DeepVera</span>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">© 2025 DEEPVERA İSTİHBARAT SİSTEMİ</p>
         </div>
      </footer>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; width: 200%; animation: marquee 30s linear infinite; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default LandingPage;
