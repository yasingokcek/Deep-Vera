
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
  tokenBalance, 
  onBuyTokens, 
  onOpenSettings,
  onOpenAdmin,
  userLogo,
  role
}) => {
  return (
    <header className="h-16 shrink-0 flex items-center px-6 lg:px-14 bg-white/70 backdrop-blur-3xl sticky top-0 z-[60] border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-sm shadow-xl shadow-slate-200/50">DV</div>
        <div className="flex flex-col leading-none">
          <span className="font-black text-sm tracking-tight text-slate-900 uppercase">AI <span className="text-blue-600">DeepVera</span></span>
          <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.4em] mt-0.5">Global_Intelligence</span>
        </div>
      </div>
      
      <div className="flex-1"></div>

      <div className="flex items-center gap-6">
        {role === 'admin' && (
          <button 
            onClick={onOpenAdmin}
            className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-slate-900 transition-all"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            ADMİN PANELİ
          </button>
        )}

        <div 
          onClick={onBuyTokens}
          className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-xl border border-slate-100 group cursor-pointer hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all"
        >
           <div className="flex flex-col items-end leading-none">
              <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{tokenBalance.toLocaleString()}</span>
              <span className="text-[6px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">DV Token</span>
           </div>
           <div className="w-6 h-6 rounded-full bg-slate-900 group-hover:bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md transition-all">+</div>
        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block mb-0.5 truncate max-w-[100px]">{userName || 'Kullanıcı'}</span>
            <button onClick={onLogout} className="text-[7px] font-black text-red-500 uppercase tracking-widest hover:text-slate-900 transition-all">Sign_Out</button>
          </div>
          <div 
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black shadow-xl border-2 border-white overflow-hidden cursor-pointer hover:scale-105 transition-all"
          >
             {userLogo ? <img src={userLogo} className="w-full h-full object-cover" /> : userName?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
