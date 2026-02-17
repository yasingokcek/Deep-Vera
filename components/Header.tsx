
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
  userLogo,
  role,
  isGmailConnected,
  queuedCount
}) => {
  return (
    <header className="h-24 shrink-0 flex items-center px-8 lg:px-16 bg-white/80 backdrop-blur-xl border-b border-slate-100/80 sticky top-0 z-[100] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Sol: Logo Bölümü */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center font-black text-base shadow-2xl shadow-slate-300/50 group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
            DV
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-slate-900 uppercase italic leading-none">DeepVera</span>
            <div className="flex items-center gap-2 mt-1.5">
               <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.4em]">Core_Engine</span>
               <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">v3.1</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orta: Teknoloji Odaklı Otonom Köşesi (HUD) */}
      <div className="flex-1 flex justify-center">
         {isGmailConnected && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/60 p-1.5 rounded-[2rem] shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] group transition-all hover:border-blue-100">
               {/* Durum Monitörü */}
               <div className="flex items-center gap-4 px-5 py-2.5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm">
                  <div className="relative flex items-center justify-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${queuedCount && queuedCount > 0 ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-slate-300'} transition-all`}></div>
                    {queuedCount && queuedCount > 0 && <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>}
                  </div>
                  <div className="flex flex-col border-r border-slate-100 pr-5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sistem Durumu</span>
                    <span className={`text-[10px] font-black uppercase ${queuedCount && queuedCount > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {queuedCount && queuedCount > 0 ? 'İşleniyor' : 'Hazır'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Kuyrukta</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-slate-900 leading-none">{queuedCount || 0}</span>
                      <span className="text-[8px] font-bold text-slate-400">Ünite</span>
                    </div>
                  </div>
               </div>

               {/* Aksiyon Paneli */}
               <div className="flex items-center gap-1.5 px-2">
                  <button 
                    onClick={onOpenWorker} 
                    className="h-11 px-6 bg-blue-600 text-white rounded-[1.2rem] text-[9px] font-black uppercase tracking-[0.15em] hover:bg-slate-900 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                  >
                    <span>Otonom_Yönet</span>
                    <span className="text-xs opacity-50">⚙️</span>
                  </button>
                  <button 
                    onClick={onOpenGmail} 
                    className="h-11 px-6 bg-white text-slate-600 border border-slate-200 rounded-[1.2rem] text-[9px] font-black uppercase tracking-[0.15em] hover:border-slate-900 hover:text-slate-900 transition-all active:scale-95"
                  >
                    Gmail_Merkezi
                  </button>
               </div>
            </div>
         )}
      </div>

      {/* Sağ: Bakiye ve Profil */}
      <div className="flex items-center gap-8">
        {role === 'admin' && (
          <button 
            onClick={onOpenAdmin}
            className="hidden xl:flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all group"
          >
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:animate-ping"></span>
            ADMİN_KONSOL
          </button>
        )}

        {/* Token Bakiye Kartı */}
        <div 
          onClick={onBuyTokens}
          className="flex items-center gap-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 px-6 py-3 rounded-[1.5rem] border border-blue-100 group cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 transition-all active:scale-95"
        >
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 leading-none mb-1">Bakiyeniz</span>
              <span className="text-base font-black text-blue-600 group-hover:text-slate-900 transition-colors tabular-nums">{tokenBalance.toLocaleString()} <span className="text-[10px] opacity-60">DV</span></span>
           </div>
           <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-500/30 group-hover:rotate-90 transition-transform duration-500">+</div>
        </div>

        {/* Kullanıcı Profili */}
        <div className="flex items-center gap-5 pl-8 border-l border-slate-100">
          <div className="text-right hidden sm:flex flex-col items-end">
            <span className="text-[12px] font-black text-slate-900 uppercase tracking-tighter leading-none mb-1.5">{userName || 'Kullanıcı'}</span>
            <button 
              onClick={onLogout} 
              className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all flex items-center gap-1.5"
            >
              GÜVENLİ_ÇIKIŞ <span className="text-xs">➔</span>
            </button>
          </div>
          <div 
            onClick={onOpenSettings}
            className="w-14 h-14 rounded-[1.5rem] bg-slate-900 p-0.5 border-2 border-white shadow-2xl shadow-slate-300/50 cursor-pointer hover:scale-105 transition-all relative group overflow-hidden"
          >
             {userLogo ? (
               <img src={userLogo} className="w-full h-full object-cover rounded-[1.3rem]" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-white font-black text-lg uppercase">
                 {userName?.charAt(0)}
               </div>
             )}
             <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-all"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
