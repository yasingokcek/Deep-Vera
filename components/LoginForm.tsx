
import React, { useState, useEffect } from 'react';
import { User } from '../types';

const USERS_DB_KEY = 'deepvera_users_database';
const CONFIG_KEY = 'deepvera_google_config';

// ADIM 6: Client ID'yi Koda Yaz
const GOOGLE_CLIENT_ID = '622487947070-dtn0iqveim78kor9l4ljthsimmtndl4l.apps.googleusercontent.com';

interface LoginFormProps {
  onLogin: (user: User, remember: boolean) => void;
  onCancel: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'error' | 'success' | 'warning' | 'info' } | null>(null);
  
  const [clientId, setClientId] = useState(() => localStorage.getItem(CONFIG_KEY) || GOOGLE_CLIENT_ID);
  const [formData, setFormData] = useState({ username: '', password: '', email: '', name: '' });

  const handleSimulateGoogle = () => {
    setLoading(true);
    setTimeout(() => {
      const mockUser: User = {
        username: 'google_user_' + Math.floor(Math.random() * 1000),
        name: 'Google Sync Kullanıcısı',
        email: 'user@gmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff',
        isPro: true,
        role: 'user',
        provider: 'google',
        tokenBalance: 250,
        isGmailConnected: true,
        googleAccessToken: 'mock_token_' + Date.now(),
        senderAccounts: [],
        currentSenderIndex: 0
      };
      onLogin(mockUser, true);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    if (!clientId || clientId.length < 10) {
      setStatusMsg({ 
        text: "GOOGLE YAPILANDIRMASI EKSİK: Gerçek Google Cloud bağlantısı için Client ID gereklidir. Uygulamayı Gmail özellikleriyle denemek için 'BYPASS ET' modunu kullanabilirsiniz.", 
        type: 'info' 
      });
      return;
    }

    setLoading(true);
    try {
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        throw new Error("GSI Not Loaded");
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: (response: any) => {
          if (response.error) {
            setLoading(false);
            setStatusMsg({ text: "Google erişim izni verilmedi veya yapılandırma hatalı.", type: 'error' });
            return;
          }

          fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` }
          })
          .then(res => res.json())
          .then(profile => {
            const googleUser: User = {
              username: profile.email.split('@')[0],
              name: profile.name,
              email: profile.email,
              avatar: profile.picture,
              isPro: true,
              role: 'user',
              provider: 'google',
              tokenBalance: 500,
              isGmailConnected: true,
              googleAccessToken: response.access_token,
              senderAccounts: [],
              currentSenderIndex: 0
            };
            onLogin(googleUser, true);
          })
          .catch(() => {
            setStatusMsg({ text: "Google profil bilgileri alınamadı.", type: 'error' });
            setLoading(false);
          });
        },
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setLoading(false);
      setStatusMsg({ text: "Google API yüklenemedi. İnternet bağlantınızı kontrol edin.", type: 'error' });
    }
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const normalizedUser = formData.username.trim().toLowerCase();
    const normalizedPass = formData.password.trim();

    if (normalizedUser === 'admin' && normalizedPass === 'admin') {
      onLogin({ 
        username: 'admin', 
        name: 'DeepVera Admin', 
        email: 'admin@deepvera.ai', 
        isPro: true, 
        role: 'admin', 
        provider: 'local', 
        tokenBalance: 999999,
        senderAccounts: [],
        currentSenderIndex: 0
      }, true);
      return;
    }

    const saved = localStorage.getItem(USERS_DB_KEY);
    const db: any[] = saved ? JSON.parse(saved) : [];

    if (view === 'signup') {
      const newUser = { 
        id: Math.random().toString(36).substr(2, 9),
        username: normalizedUser,
        password: normalizedPass,
        email: formData.email,
        name: formData.name || normalizedUser,
        tokenBalance: 100, 
        isPro: false, 
        role: 'user' as const, 
        provider: 'local' as const,
        senderAccounts: [],
        currentSenderIndex: 0
      };
      db.push(newUser);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
      onLogin(newUser as any, true);
    } else {
      const found = db.find(u => u.username.trim().toLowerCase() === normalizedUser && u.password === normalizedPass);
      if (found) onLogin({ ...found, provider: 'local' }, true);
      else {
        setStatusMsg({ text: 'Geçersiz kullanıcı adı veya şifre.', type: 'error' });
        setLoading(false);
      }
    }
  };

  const saveConfig = () => {
    localStorage.setItem(CONFIG_KEY, clientId);
    setShowConfig(false);
    setStatusMsg({ text: "Google Client ID kaydedildi. Gmail bağlantısını deneyebilirsiniz.", type: 'success' });
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center p-4 z-[200] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600 rounded-full blur-[150px] animate-pulse delay-700"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-3xl w-full max-w-lg rounded-[4.5rem] shadow-[0_60px_150px_-30px_rgba(0,0,0,0.6)] border border-white/50 flex flex-col p-14 relative animate-fade-in overflow-hidden">
        
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="absolute top-10 right-10 w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all z-20 shadow-sm"
        >
          ⚙️
        </button>

        {showConfig ? (
          <div className="space-y-8 animate-fade-in">
             <div className="text-center mb-4">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Google Entegrasyonu</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Google Cloud Console 'Client ID' Ayarı</p>
             </div>
             <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Müşteri Kimliği (Client ID)</label>
                <textarea 
                  value={clientId} 
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="...apps.googleusercontent.com"
                  className="w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-3xl text-[11px] font-bold outline-none resize-none focus:border-blue-500 transition-all"
                />
             </div>
             <button onClick={saveConfig} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-500/20">KONFİGÜRASYONU KAYDET</button>
             <button onClick={() => setShowConfig(false)} className="w-full text-[10px] font-black text-slate-400 uppercase hover:text-slate-900 transition-colors">GERİ DÖN</button>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <div className="w-28 h-28 bg-slate-900 text-white rounded-[3rem] mx-auto flex items-center justify-center text-5xl font-black mb-8 shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 to-transparent group-hover:from-blue-600/60 transition-all duration-1000"></div>
                DV
              </div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">DeepVera</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-4 italic opacity-80">Artificial Intelligence Hub</p>
            </div>

            {statusMsg && (
              <div className={`mb-10 p-8 border rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest text-center animate-fade-in flex flex-col gap-5 ${
                statusMsg.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 
                statusMsg.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                statusMsg.type === 'info' ? 'bg-indigo-50 border-indigo-100 text-indigo-600 shadow-xl shadow-indigo-500/10' :
                'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm'
              }`}>
                <span>{statusMsg.text}</span>
                {statusMsg.type === 'info' && (
                  <button 
                    onClick={handleSimulateGoogle}
                    className="h-12 bg-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-widest hover:bg-slate-900 transition-all shadow-lg"
                  >
                    🚀 BYPASS ET VE SİSTEME GİR
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleLocalSubmit} className="space-y-4 mb-10">
              <input 
                type="text" required placeholder="KULLANICI ADI (admin)" value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full h-18 p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-[13px] font-black outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300" 
              />
              <input 
                type="password" required placeholder="ŞİFRE (admin)" value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full h-18 p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-[13px] font-black outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300" 
              />
              <button 
                type="submit" disabled={loading}
                className="w-full h-18 bg-slate-900 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'ANALİZ EDİLİYOR...' : (view === 'login' ? 'GİRİŞ YAP' : 'HESAP OLUŞTUR')}
              </button>
            </form>

            <div className="relative mb-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.6em] text-slate-300"><span className="bg-white px-8">STREATEJİK BAĞLANTI</span></div>
            </div>

            <button 
              type="button" onClick={handleGoogleLogin} disabled={loading}
              className="w-full h-18 border-2 border-slate-100 bg-white rounded-[1.5rem] flex items-center justify-center gap-5 transition-all active:scale-95 shadow-sm group hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                 <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </div>
              <span className="text-[12px] font-black uppercase tracking-widest text-slate-700">GMAIL İLE BAĞLAN</span>
            </button>

            <div className="mt-14 flex justify-center gap-10">
               <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-[10px] font-black text-blue-600 uppercase hover:underline tracking-[0.2em]">{view === 'login' ? 'ÜYE OL' : 'GİRİŞ YAP'}</button>
               <button onClick={onCancel} className="text-[10px] font-black text-slate-300 uppercase hover:text-red-500 tracking-[0.2em] transition-colors">Vazgeç</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
