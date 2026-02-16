
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginFormProps {
  onLogin: (user: User, remember: boolean) => void;
  onCancel: () => void;
}

const CLIENT_ID_STORAGE_KEY = 'deepvera_google_client_id';
const USERS_DB_KEY = 'deepvera_users_database';

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [view, setView] = useState<'login' | 'signup' | 'config'>('login');
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState(localStorage.getItem(CLIENT_ID_STORAGE_KEY) || '');
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'error' | 'success' | 'warning' } | null>(null);
  
  const [formData, setFormData] = useState({ username: '', password: '', email: '', name: '' });

  const currentOrigin = window.location.origin;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isHttps = window.location.protocol === 'https:';

  // Handle Google OAuth
  const handleGoogleLogin = () => {
    if (!clientId || clientId.includes('YOUR_GOOGLE')) {
      setStatusMsg({ text: "Lütfen önce Ayarlar (⚙️) ikonundan geçerli bir Google Client ID girin.", type: 'error' });
      setView('config');
      return;
    }

    setLoading(true);
    const google = (window as any).google;
    
    if (!google) {
      setStatusMsg({ text: "Google kütüphanesi yüklenemedi. Sayfayı yenileyin.", type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: (response: any) => {
          if (response.error) {
            setStatusMsg({ text: `Yetki Hatası: ${response.error}`, type: 'error' });
            setLoading(false);
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
          });
        },
      });
      client.requestAccessToken();
    } catch (err) {
      setLoading(false);
    }
  };

  // Handle Local Login
  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const saved = localStorage.getItem(USERS_DB_KEY);
    const db: any[] = saved ? JSON.parse(saved) : [];

    if (view === 'signup') {
      if (db.find(u => u.username === formData.username)) {
        setStatusMsg({ text: 'Bu kullanıcı adı zaten alınmış.', type: 'error' });
        setLoading(false);
        return;
      }
      const newUser = {
        ...formData,
        id: Date.now().toString(),
        tokenBalance: 50,
        isPro: false,
        role: 'user',
        provider: 'local'
      };
      db.push(newUser);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
      setStatusMsg({ text: 'Hesap oluşturuldu! Giriş yapılıyor...', type: 'success' });
      setTimeout(() => onLogin(newUser as any, true), 1000);
    } else {
      // Admin Check
      if (formData.username === 'admin' && formData.password === 'admin') {
        onLogin({ 
          username: 'admin', 
          name: 'Sistem Yöneticisi', 
          email: 'admin@deepvera.ai', 
          isPro: true, 
          role: 'admin', 
          provider: 'demo', 
          tokenBalance: 999999 
        }, true);
        return;
      }

      const found = db.find(u => u.username === formData.username && u.password === formData.password);
      if (found) {
        onLogin({ ...found, provider: 'local' }, true);
      } else {
        // Fallback for demo
        if (formData.username === 'demo' && formData.password === 'demo') {
            onLogin({ username: 'demo', name: 'Ziyaretçi', email: 'demo@deepvera.ai', isPro: true, provider: 'demo', tokenBalance: 50 }, true);
            return;
        }
        setStatusMsg({ text: 'Hatalı kullanıcı adı veya şifre.', type: 'error' });
        setLoading(false);
      }
    }
  };

  const saveConfig = () => {
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId.trim());
    setView('login');
    setStatusMsg({ text: "Google Ayarları Kaydedildi.", type: 'success' });
  };

  return (
    <div className="fixed inset-0 bg-slate-50/20 backdrop-blur-3xl flex items-center justify-center p-4 z-[200]">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-white flex flex-col p-10 relative animate-fade-in overflow-hidden">
        
        {/* Settings Button */}
        <button 
          onClick={() => setView(view === 'config' ? 'login' : 'config')}
          className="absolute top-8 right-8 text-slate-300 hover:text-blue-600 transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] mx-auto flex items-center justify-center text-2xl font-black mb-6 shadow-2xl">DV</div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            {view === 'login' ? 'Giriş Yap' : view === 'signup' ? 'Kayıt Ol' : 'Sistem Ayarları'}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 italic">AI DeepVera Intelligence</p>
        </div>

        {statusMsg && (
          <div className={`mb-6 p-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest text-center ${
            statusMsg.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 
            statusMsg.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' :
            'bg-blue-50 border-blue-100 text-blue-600'
          }`}>
            {statusMsg.text}
          </div>
        )}

        {view === 'config' ? (
          <div className="space-y-6 animate-fade-in">
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block">Origin URL (GCP Console İçin)</label>
                <code className="text-[10px] text-blue-600 font-mono select-all block break-all bg-white p-2 rounded-lg border border-slate-200">{currentOrigin}</code>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Google Client ID</label>
                <input 
                  type="text" 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-mono outline-none focus:border-blue-600"
                  placeholder="...apps.googleusercontent.com"
                />
             </div>
             <button onClick={saveConfig} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">Ayarları Kaydet</button>
             <button onClick={() => setView('login')} className="w-full text-[9px] font-black text-slate-300 uppercase hover:text-slate-900 transition-colors">Vazgeç</button>
          </div>
        ) : (
          <>
            <form onSubmit={handleLocalSubmit} className="space-y-4 mb-8">
              {view === 'signup' && (
                <>
                  <input 
                    type="text" 
                    required 
                    placeholder="Tam Adınız" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-14 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" 
                  />
                  <input 
                    type="email" 
                    required 
                    placeholder="E-posta Adresi" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full h-14 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" 
                  />
                </>
              )}
              <input 
                type="text" 
                required 
                placeholder="Kullanıcı Adı" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full h-14 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" 
              />
              <input 
                type="password" 
                required 
                placeholder="Şifre" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full h-14 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" 
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {view === 'login' ? 'Sisteme Gir' : 'Üyeliği Tamamla'}
              </button>
            </form>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest text-slate-300"><span className="bg-white px-4">VEYA</span></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading || (!isHttps && !isLocalhost)}
              className={`w-full h-16 border rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-sm group ${
                (!isHttps && !isLocalhost) ? 'bg-slate-50 border-slate-100 cursor-not-allowed' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-blue-600">
                {!isHttps && !isLocalhost ? 'SSL Gerekli' : 'Gmail ile Bağlan'}
              </span>
            </button>

            <div className="mt-8 flex flex-col items-center gap-4">
               <button 
                 onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                 className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
               >
                 {view === 'login' ? 'Henüz hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
               </button>
               <button onClick={onCancel} className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-red-500 transition-colors">Vazgeç ve Dön</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
