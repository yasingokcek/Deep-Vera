
import React from 'react';

interface HeaderProps {
  onLogout: () => void;
  userName?: string;
  isPro?: boolean;
  role?: string;
  tokenBalance: number;
  onBuyTokens: () => void;
  onOpenAdmin?: () => void;
  onOpenSettings: () => void;
  onOpenGmail: () => void;
  onOpenWorker: () => void;
  userLogo?: string;
  isGmailConnected?: boolean;
  queuedCount?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  onLogout, 
  userName, 
  tokenBalance, 
  onBuyTokens, 
  onOpenSettings,
  onOpenAdmin,
  onOpenGmail,
  onOpenWorker,
  role,
  queuedCount
}) => {
  return (
    <header className="h-28 shrink-0 flex items-center px-4 lg:px-8 bg-[#f8fafc] sticky top-0 z-[100] w-full">
      <div className="w-full flex items-center justify-between gap-6">
        
        {/* Sol: Logo & Marka */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl border-2 border-white/10">
            DV
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-slate-950 uppercase italic leading-none">DEEPVERA</span>
            <div className="flex items-center gap-1.5 mt-1">
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">CORE_ENGINE</span>
               <span className="text-[9px] font-black text-slate-300 uppercase">V3.1</span>
            </div>
          </div>
        </div>

        {/* Orta: Bütünleşik Kontrol Ünitesi (Blue Glass Tasarım) */}
        <div className="flex items-center bg-[#3b82f6] p-1.5 rounded-[1.8rem] shadow-[0_25px_60px_-15px_rgba(59,130,246,0.5)] border border-white/20">
          
          {/* Durum & Kuyruk Bilgisi */}
          <div className="px-6 py-2 flex items-center gap-8 border-r border-white/15">
             <div className="flex items-center gap-3">
                <div className="w-11 h-5.5 bg-white/20 rounded-full relative flex items-center px-1">
                   <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[7px] font-black text-white/50 uppercase tracking-widest leading-none mb-0.5">DURUM</span>
                   <span className="text-[10px] font-black text-white uppercase leading-none">HAZIR</span>
                </div>
             </div>
             <div className="flex flex-col">
                <span className="text-[7px] font-black text-white/50 uppercase tracking-widest leading-none mb-0.5">KUYRUK</span>
                <div className="flex items-center gap-1">
                   <span className="text-[12px] font-black text-white leading-none">{queuedCount || 0}</span>
                   <span className="text-[8px] font-bold text-white/40 uppercase leading-none">ÜNİTE</span>
                </div>
             </div>
          </div>

          {/* Otonom & Gmail Butonları */}
          <div className="flex items-center gap-1.5 ml-1.5">
            <button 
              onClick={onOpenWorker}
              className="h-12 px-5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2.5 group"
            >
              OTONOM_YÖNET <span className="text-sm opacity-50 group-hover:rotate-12 transition-transform">⚙️</span>
            </button>
            <button 
              onClick={onOpenGmail}
              className="h-12 px-5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2.5 group"
            >
              GMAİL_MERKEZİ <span className="text-sm opacity-50 group-hover:scale-110 transition-transform">📧</span>
            </button>
          </div>
        </div>

        {/* Sağ: Ekonomi & Profil (Görseldeki Tam Yerleşim) */}
        <div className="flex items-center gap-5 shrink-0">
          
          {/* Bakiye Paneli (Görseldeki Stil) */}
          <div className="bg-[#eff6ff] border border-blue-100 rounded-[1.8rem] px-6 py-2 flex items-center gap-4 shadow-sm group">
             <div className="flex flex-col items-start">
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-0.5">BAKİYENİZ</span>
                <div className="flex items-center gap-1.5">
                   <span className="text-xl font-black text-blue-600 tabular-nums">{tokenBalance.toLocaleString().replace(/,/g, '.')}</span>
                   <span className="text-[9px] font-black text-blue-400 uppercase">DV</span>
                </div>
             </div>
             <button 
               onClick={onBuyTokens}
               className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold hover:bg-slate-900 transition-all shadow-md active:scale-95"
             >
               +
             </button>
          </div>

          {/* Profil, Admin Rozeti & Kimlik Bilgisi */}
          <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
             
             {/* Profil Harf İkonu */}
             <div 
               onClick={onOpenSettings}
               className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center text-xl font-black cursor-pointer hover:scale-105 transition-all shadow-xl border-2 border-white ring-4 ring-blue-50 relative overflow-hidden group"
             >
               <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
               {userName?.charAt(0) || 'D'}
             </div>

             {/* Admin Siyah Badge */}
             {role === 'admin' && onOpenAdmin && (
               <button 
                 onClick={onOpenAdmin} 
                 className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
               >
                 ADMIN
               </button>
             )}

             {/* İsim ve Güvenli Çıkış (Görseldeki talep) */}
             <div className="flex flex-col items-start">
                <span className="text-[12px] font-black text-slate-950 uppercase tracking-tighter leading-none mb-1">
                  {role === 'admin' ? 'DEEPVERA ADMIN' : (userName || 'KULLANICI')}
                </span>
                <button 
                  onClick={onLogout}
                  className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 hover:text-red-700 transition-colors border-b border-transparent hover:border-red-500 pb-0.5"
                >
                  GÜVENLİ_ÇIKIŞ ➔
                </button>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
