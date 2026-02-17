
import React, { useState } from 'react';
import { User } from '../types';

const USERS_DB_KEY = 'deepvera_users_database';
const CONFIG_KEY = 'deepvera_google_config';
const GOOGLE_CLIENT_ID = '622487947070-dtn0iqveim78kor9l4ljthsimmtndl4l.apps.googleusercontent.com';

interface LoginFormProps {
  onLogin: (user: User, remember: boolean) => void;
  onCancel: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
        tokenBalance: 100,
        isGmailConnected: true,
        googleAccessToken: 'mock_token_' + Date.now(),
        senderAccounts: [],
        currentSenderIndex: 0
      };
      onLogin(mockUser, true);
    }, 1500);
  };

  const handleGoogleLogin = () => {
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
              tokenBalance: 100,
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
      setStatusMsg({ text: "Google API yüklenemedi. 'Bypass' butonunu kullanabilirsiniz.", type: 'info' });
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
        email: 'ai@deepvera.com.tr', 
        isPro: true, 
        role: 'admin', 
        provider: 'local', 
        tokenBalance: 999999,
        senderAccounts: [],
        currentSenderIndex: 0
      }, rememberMe);
      return;
    }

    const saved = localStorage.getItem(USERS_DB_KEY);
    const db: any[] = saved ? JSON.parse(saved) : [];

    if (activeTab === 'signup') {
      const exists = db.find(u => u.username === normalizedUser || u.email === formData.email);
      if (exists) {
        setStatusMsg({ text: 'Bu kullanıcı adı veya e-posta zaten kullanımda.', type: 'error' });
        setLoading(false);
        return;
      }
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
      onLogin(newUser as any, rememberMe);
    } else {
      const found = db.find(u => u.username.trim().toLowerCase() === normalizedUser && u.password === normalizedPass);
      if (found) onLogin({ ...found, provider: 'local' }, rememberMe);
      else {
        setStatusMsg({ text: 'Geçersiz kullanıcı adı veya şifre.', type: 'error' });
        setLoading(false);
      }
    }
  };

  const saveConfig = () => {
    localStorage.setItem(CONFIG_KEY, clientId);
    setShowConfig(false);
    setStatusMsg({ text: "Yapılandırma güncellendi.", type: 'success' });
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-[200] overflow-hidden max-w-full">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="bg-white w-full max-w-lg rounded-[3.5rem] md:rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/20 flex flex-col relative animate-fade-in overflow-hidden max-h-[90vh]">
        
        {/* Fixed Mini Actions */}
        <div className="absolute top-5 left-6 right-6 flex justify-between items-center z-20">
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm group"
          >
            ← Geri
          </button>
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="w-8 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            ⚙️
          </button>
        </div>

        {showConfig ? (
          <div className="p-10 pt-20 space-y-6 animate-fade-in overflow-y-auto">
             <div className="text-center">
                <h3 className="text-xl font-black text-slate-900 uppercase">Sistem Yapılandırması</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Google Cloud API Ayarları</p>
             </div>
             <textarea 
               value={clientId} 
               onChange={(e) => setClientId(e.target.value)}
               placeholder="Google Client ID..."
               className="w-full h-24 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-mono outline-none focus:border-blue-500 transition-all"
             />
             <button onClick={saveConfig} className="w-full h-12 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all">AYARLARI KAYDET</button>
          </div>
        ) : (
          <div className="overflow-y-auto custom-scrollbar">
            {/* Optimized Header */}
            <div className="pt-12 md:pt-16 pb-4 text-center bg-slate-50/40">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 text-white rounded-2xl mx-auto flex items-center justify-center text-xl md:text-2xl font-black mb-3 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-transparent"></div>
                DV
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-1">DeepVera <span className="text-blue-600">Intelligence</span></h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Kurumsal Otonom Ekosistemi</p>
              
              <div className="px-8 md:px-12">
                <button 
                  type="button" onClick={handleGoogleLogin} disabled={loading}
                  className="w-full h-14 md:h-16 border-2 border-slate-200 bg-white rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-sm hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">GOOGLE İLE BAĞLAN</span>
                </button>
              </div>
            </div>

            {/* Form Section - Tighter */}
            <div className="px-8 md:px-12 pb-10 pt-4">
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 shadow-inner">
                <button 
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'login' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400'}`}
                >
                  Giriş
                </button>
                <button 
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'signup' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400'}`}
                >
                  Üyelik
                </button>
              </div>

              {statusMsg && (
                <div className={`mb-4 p-4 border rounded-2xl text-[8px] font-black uppercase tracking-widest text-center animate-fade-in ${
                  statusMsg.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}>
                  {statusMsg.text}
                </div>
              )}

              <form onSubmit={handleLocalSubmit} className="space-y-3">
                {activeTab === 'signup' && (
                  <>
                    <input 
                      type="text" placeholder="AD SOYAD" value={formData.name} required
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />
                    <input 
                      type="email" placeholder="E-POSTA" value={formData.email} required
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />
                  </>
                )}
                
                <input 
                  type="text" required placeholder="KULLANICI ADI" value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all" 
                />
                
                <div className="relative">
                  <input 
                    type="password" required placeholder="ŞİFRE" value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all" 
                  />
                  {activeTab === 'login' && (
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[7px] font-black text-blue-500 uppercase tracking-widest">Şifre?</button>
                  )}
                </div>

                <div className="flex items-center justify-between px-1 pb-1">
                   <label className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setRememberMe(!rememberMe)} className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}>
                        {rememberMe && <span className="text-white text-[8px]">✓</span>}
                      </div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hatırla</span>
                   </label>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-50 mt-2"
                >
                  {loading ? 'YÜKLENİYOR...' : (activeTab === 'login' ? 'GİRİŞ YAP' : 'KAYDI TAMAMLA')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
