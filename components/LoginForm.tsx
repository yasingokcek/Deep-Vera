
import React, { useState, useEffect } from 'react';
import { User } from '../types';

const GOOGLE_CLIENT_ID = '932204555026-6b6m6q0n9k9j4j4j4j4j4j4j4j4j4j4j.apps.googleusercontent.com'; 
const USERS_DB_KEY = 'deepvera_users_database';

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'error' | 'success' | 'warning' } | null>(null);
  
  const [formData, setFormData] = useState({ username: '', password: '', email: '', name: '' });

  useEffect(() => {
    const checkGsi = setInterval(() => {
      const google = (window as any).google;
      if (google?.accounts?.oauth2) {
        setIsGsiLoaded(true);
        clearInterval(checkGsi);
      }
    }, 500);
    return () => clearInterval(checkGsi);
  }, []);

  const handleGoogleLogin = () => {
    if (GOOGLE_CLIENT_ID.includes('j4j4j4')) {
      setStatusMsg({ 
        text: "GOOGLE YAPILANDIRMA EKSİK: Kod içerisindeki Client ID henüz tanımlanmamış. Lütfen 'Üye Ol' veya 'Demo' girişini kullanın.", 
        type: 'warning' 
      });
      return;
    }

    if (!isGsiLoaded) {
      setStatusMsg({ text: "Sistem hazırlanıyor, lütfen bekleyin...", type: 'warning' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID.trim(),
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: (response: any) => {
          if (response.error) {
            setLoading(false);
            setStatusMsg({ text: "Google bağlantısı reddedildi.", type: 'error' });
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
              googleAccessToken: response.access_token
            };
            onLogin(googleUser, true);
          })
          .catch(() => {
            setStatusMsg({ text: "Profil bilgileri alınırken hata oluştu.", type: 'error' });
            setLoading(false);
          });
        },
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setLoading(false);
      setStatusMsg({ text: "Giriş işlemi başlatılamadı.", type: 'error' });
    }
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const saved = localStorage.getItem(USERS_DB_KEY);
    const db: any[] = saved ? JSON.parse(saved) : [];

    const normalizedUser = formData.username.trim().toLowerCase();
    const normalizedPass = formData.password.trim();

    if (view === 'signup') {
      if (db.find(u => u.username.trim().toLowerCase() === normalizedUser)) {
        setStatusMsg({ text: 'Bu kullanıcı adı zaten alınmış.', type: 'error' });
        setLoading(false);
        return;
      }
      const newUser = { 
        username: normalizedUser,
        password: normalizedPass,
        email: formData.email,
        name: formData.name || normalizedUser,
        tokenBalance: 100, 
        isPro: false, 
        role: 'user', 
        provider: 'local' 
      };
      db.push(newUser);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
      onLogin(newUser as any, true);
    } else {
      // Robust Admin Check
      if (normalizedUser === 'admin' && normalizedPass === 'admin') {
        onLogin({ 
          username: 'admin', 
          name: 'Yönetici', 
          email: 'admin@deepvera.ai', 
          isPro: true, 
          role: 'admin', 
          provider: 'local', 
          tokenBalance: 999999 
        }, true);
        return;
      }

      const found = db.find(u => u.username.trim().toLowerCase() === normalizedUser && u.password === normalizedPass);
      if (found) {
        onLogin({ ...found, provider: 'local' }, true);
      } else {
        setStatusMsg({ text: 'Kullanıcı adı veya şifre hatalı.', type: 'error' });
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xl flex items-center justify-center p-4 z-[200]">
      <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] border border-white flex flex-col p-10 relative animate-fade-in overflow-hidden">
        
        <div className="text-center mb-10 relative">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] mx-auto flex items-center justify-center text-3xl font-black mb-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent group-hover:from-blue-600/40 transition-all duration-700"></div>
            DV
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            {view === 'login' ? 'Giriş Paneli' : 'Yeni Kayıt'}
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3 italic">DeepVera Global Intelligence</p>
        </div>

        {statusMsg && (
          <div className={`mb-6 p-5 border rounded-3xl text-[10px] font-black uppercase tracking-widest text-center animate-fade-in ${
            statusMsg.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 
            statusMsg.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' :
            'bg-blue-50 border-blue-100 text-blue-600 shadow-sm'
          }`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleLocalSubmit} className="space-y-4 mb-8">
          <input 
            type="text" 
            required 
            placeholder="Kullanıcı Adı (admin)" 
            value={formData.username} 
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full h-16 p-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-400 transition-all placeholder:text-slate-300" 
          />
          
          {view === 'signup' && (
            <input 
              type="email" 
              required 
              placeholder="E-posta Adresi" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full h-16 p-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-400 transition-all placeholder:text-slate-300" 
            />
          )}

          <input 
            type="password" 
            required 
            placeholder="Şifre (admin)" 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full h-16 p-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-400 transition-all placeholder:text-slate-300" 
          />
          
          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className={`flex-1 h-16 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${
                view === 'login' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'İŞLENİYOR...' : (view === 'login' ? 'GİRİŞ YAP' : 'ÜYE OL')}
            </button>
            <button 
              type="button"
              disabled={loading}
              onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setStatusMsg(null); }}
              className="flex-1 h-16 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-slate-900 transition-all active:scale-95"
            >
              {view === 'login' ? 'ÜYE OL' : 'GİRİŞE DÖN'}
            </button>
          </div>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em] text-slate-300"><span className="bg-white px-6">VEYA</span></div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full h-16 border-2 border-slate-100 bg-white rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-sm group hover:border-slate-900 ${loading ? 'opacity-50' : ''}`}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">GMAIL İLE BAĞLAN</span>
          </button>
        </div>

        <div className="mt-10 flex flex-col items-center">
           <button onClick={onCancel} className="text-[9px] font-black text-slate-300 uppercase hover:text-red-500 tracking-[0.2em] transition-colors">Ana Sayfaya Dön</button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

interface LoginFormProps {
  onLogin: (user: User, remember: boolean) => void;
  onCancel: () => void;
}
