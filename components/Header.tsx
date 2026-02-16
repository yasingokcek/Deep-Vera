
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
  userLogo?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onLogout, 
  userName, 
  isPro, 
  role, 
  tokenBalance, 
  onBuyTokens, 
  onOpenAdmin, 
  onOpenSettings,
  userLogo 
}) => {
  return (
    <header className="h-20 shrink-0 flex items-center px-12 border-b border-slate-100 bg-white sticky top-0 z-[60] shadow-sm shadow-slate-50">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-xl shadow-slate-200 transform hover:scale-105 transition-transform cursor-pointer relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative z-10">DV</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">AI <span className="text-blue-600">DeepVera</span></span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Intelligence System</span>
        </div>
      </div>
      
      <div className="flex-1"></div>

      <div className="flex items-center gap-6">
        {role === 'admin' && (
           <button 
             onClick={onOpenAdmin}
             className="px-6 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-200 hover:bg-slate-900 transition-all animate-pulse"
           >
             🚨 ADMIN CONSOLE
           </button>
        )}

        <div className="flex items-center gap-4 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 group">
           <div className="flex flex-col items-end leading-none">
              <span className="text-base font-black text-blue-600">{tokenBalance.toLocaleString()}</span>
              <span className="text-[7px] font-black uppercase tracking-[0.1em] text-slate-400 mt-0.5">CREDITS</span>
           </div>
           <button 
             onClick={onBuyTokens}
             className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold hover:scale-110 transition-all shadow-md"
           >
             +
           </button>
        </div>

        <button 
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
        >
          ⚙️ Settings
        </button>

        <div className="flex items-center gap-4 cursor-pointer group" onClick={onLogout}>
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest group-hover:text-red-500 transition-colors">{userName || 'USER'}</span>
            <p className={`text-[8px] font-black uppercase tracking-tighter ${isPro ? 'text-amber-500' : 'text-slate-300'}`}>
              Logout
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm overflow-hidden">
             {userLogo ? (
               <img src={userLogo} className="w-full h-full object-cover" alt="User Logo" />
             ) : (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7"/>
               </svg>
             )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
