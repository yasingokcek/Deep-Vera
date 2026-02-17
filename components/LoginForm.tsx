
import React, { useState, useEffect } from 'react';
import { User } from '../types';

/** 
 * KRİTİK: Google Cloud Console'dan aldığınız Client ID'yi buraya yapıştırın.
 * Müşteri bu ayarı görmeyecek, sistem bunu arka planda kullanacaktır.
 */
const GOOGLE_CLIENT_ID = '932204555026-6b6m6q0n9k9j4j4j4j4j4j4j4j4j4j4j.apps.googleusercontent.com'; 

const USERS_DB_KEY = 'deepvera_users_database';

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'error' | 'success' | 'warning' } | null>(null);
  
  const [formData, setFormData] = useState({ username: '', password: '', email: '', name: '' });

  // Google SDK'nın hazır olup olmadığını kontrol et
  useEffect(() => {
    const checkGsi = setInterval(() => {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.oauth2) {
        setIsGsiLoaded(true);
        clearInterval(checkGsi);
      }
    }, 500);
    return () => clearInterval(checkGsi);
  }, []);

  const handleGoogleLogin = () => {
    // Client ID kontrolü (Geliştirici uyarısı)
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
      setStatusMsg({ 
        text: "Sistem henüz yapılandırılmadı. Lütfen yönetici ile iletişime geçin.", 
        type: 'error' 
      });
      return;
    }

    if (!isGsiLoaded) {
      setStatusMsg({ text: "Bağlantı kuruluyor, lütfen bekleyin...", type: 'warning' });
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
            setStatusMsg({ 
              text: "Google bağlantısı reddedildi. Lütfen tekrar deneyin.", 
              type: 'error' 
            });
            console.error("Auth Error:", response.error);
            return;
          }

          // Profil bilgilerini çek
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
            setStatusMsg({ text: "Profil verileri alınırken bir hata oluştu.", type: 'error' });
            setLoading(false);
          });
        },
        error_callback: (err: any) => {
          setLoading(false);
          setStatusMsg({ text: "Google servislerine şu an ulaşılamıyor.", type: 'error' });
          console.error("GSI Error:", err);
        }
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      setLoading(false);
      setStatusMsg({ text: "Sistem hatası: Bağlantı başlatılamadı.", type: 'error' });
    }
  };

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
      const newUser = { ...formData, id: Date.now().toString(), tokenBalance: 50, isPro: false, role: 'user', provider: 'local' };
      db.push(newUser);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
      onLogin(newUser as any, true);
    } else {
      // Demo Admin
      if (formData.username === 'admin' && formData.password === 'admin') {
        onLogin({ username: 'admin', name: 'Yönetici', email: 'admin@deepvera.ai', isPro: true, role: 'admin', provider: 'local', tokenBalance: 999999 }, true);
        return;
      }
      const found = db.find(u => u.username === formData.username && u.password === formData.password);
      if (found) {
        onLogin({ ...found, provider: 'local' }, true);
      } else {
        setStatusMsg({ text: 'Hatalı giriş bilgileri.', type: 'error' });
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-3xl flex items-center justify-center p-4 z-[200]">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border border-white flex flex-col p-10 relative animate-fade-in overflow-hidden">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] mx-auto flex items-center justify-center text-2xl font-black mb-6 shadow-2xl">DV</div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            {view === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 italic">DeepVera Global Intelligence</p>
        </div>

        {statusMsg && (
          <div className={`mb-6 p-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-fade-in ${
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
            placeholder="Kullanıcı Adı" 
            value={formData.username} 
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full h-14 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold outline-none focus:bg-white focus:border-slate-400 transition-all" 
          />
          <input 
            type="password" 
            required 
            placeholder="Şifre" 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full h-14 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold outline-none focus:bg-white focus:border-slate-400 transition-all" 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {view === 'login' ? 'ERİŞİMİ BAŞLAT' : 'KAYDI TAMAMLA'}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest text-slate-300"><span className="bg-white px-5">VEYA</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full h-16 border-2 border-slate-100 bg-white rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-sm group hover:border-slate-900 ${loading ? 'opacity-50' : ''}`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">
            GMAIL İLE DEVAM ET
          </span>
        </button>

        <div className="mt-8 flex flex-col items-center gap-4">
           <button 
             onClick={() => setView(view === 'login' ? 'signup' : 'login')}
             className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
           >
             {view === 'login' ? 'Yeni Hesap Oluştur' : 'Zaten hesabım var'}
           </button>
           <button onClick={onCancel} className="text-[9px] font-black text-slate-300 uppercase hover:text-red-500">Kapat</button>
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
