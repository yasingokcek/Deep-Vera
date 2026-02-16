
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginFormProps {
  onLogin: (user: User, remember: boolean) => void;
  onCancel: () => void;
}

const USERS_DB_KEY = 'deepvera_users_database';
const REMEMBER_ME_KEY = 'deepvera_remembered_username';

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    authorizedPerson: '',
    companyName: '',
    companyDescription: ''
  });

  // Demo Admin Hesabı Oluştur (Eğer veritabanı boşsa veya admin yoksa)
  useEffect(() => {
    const db = getUsersFromDB();
    const adminExists = db.some(u => u.username === 'admin');
    
    if (!adminExists) {
      const adminUser = {
        id: 'u-admin',
        username: 'admin',
        password: 'admin', // Şifre 'admin' olarak güncellendi
        email: 'admin@deepvera.ai',
        authorizedPerson: 'Sistem Yöneticisi',
        companyName: 'DeepVera AI Headquarters',
        companyDescription: 'Ana İstihbarat Yönetimi',
        tokenBalance: 999999,
        isPro: true,
        role: 'admin',
        provider: 'local'
      };
      
      // Eğer başka kullanıcılar varsa admini başa ekle, yoksa direkt kaydet
      const newDb = adminExists ? db : [adminUser, ...db];
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(newDb));
    }
  }, []);

  useEffect(() => {
    const savedUsername = localStorage.getItem(REMEMBER_ME_KEY);
    if (savedUsername && mode === 'login') {
      setFormData(prev => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }
  }, [mode]);

  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  const getUsersFromDB = (): any[] => {
    const data = localStorage.getItem(USERS_DB_KEY);
    return data ? JSON.parse(data) : [];
  };

  const saveUserToDB = (newUser: any) => {
    const db = getUsersFromDB();
    db.push(newUser);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const db = getUsersFromDB();

    if (mode === 'signup') {
      const userExists = db.some(u => u.username === formData.username || u.email === formData.email);
      if (userExists) {
        setStatusMsg({ text: 'Kullanıcı adı veya e-posta zaten kullanımda.', type: 'error' });
        setLoading(false);
        return;
      }

      const newUser = {
        ...formData,
        id: `u-${Date.now()}`,
        tokenBalance: 50,
        isPro: false,
        role: 'user',
        provider: 'local'
      };

      saveUserToDB(newUser);
      
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, newUser.username);
      }

      setStatusMsg({ text: 'Hesabınız oluşturuldu! Sisteme giriş yapılıyor...', type: 'success' });
      
      setTimeout(() => {
        onLogin({
          username: newUser.username,
          name: newUser.authorizedPerson,
          email: newUser.email,
          isPro: false,
          role: 'user',
          provider: 'local',
          tokenBalance: 50,
          companyName: newUser.companyName,
          companyDescription: newUser.companyDescription
        }, rememberMe);
        setLoading(false);
      }, 1500);

    } else if (mode === 'login') {
      const foundUser = db.find(u => u.username === formData.username && u.password === formData.password);
      
      if (foundUser) {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY, foundUser.username);
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }

        setStatusMsg({ text: 'Kimlik doğrulandı. Hoş geldiniz.', type: 'success' });
        
        setTimeout(() => {
          onLogin({
            username: foundUser.username,
            name: foundUser.authorizedPerson || foundUser.username,
            email: foundUser.email,
            isPro: foundUser.isPro || false,
            role: foundUser.role || 'user',
            provider: 'local',
            tokenBalance: foundUser.tokenBalance || 50,
            companyName: foundUser.companyName,
            companyDescription: foundUser.companyDescription
          }, rememberMe);
          setLoading(false);
        }, 1000);
      } else {
        setStatusMsg({ text: 'Hatalı kullanıcı adı veya şifre.', type: 'error' });
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      const user = db.find(u => u.email === formData.email);
      setTimeout(() => {
        if (user) {
          setStatusMsg({ text: 'Sıfırlama e-postası gönderildi (Simülasyon).', type: 'success' });
        } else {
          setStatusMsg({ text: 'E-posta adresi bulunamadı.', type: 'error' });
        }
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50/20 backdrop-blur-3xl flex items-center justify-center p-4 z-[200]">
      <div className={`bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] border border-white flex flex-col p-8 lg:p-12 relative animate-fade-in overflow-hidden ${statusMsg?.type === 'error' ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl mx-auto flex items-center justify-center text-xl font-black mb-6 shadow-xl">DV</div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            {mode === 'login' ? 'Giriş Yap' : mode === 'signup' ? 'Kayıt Ol' : 'Şifre Kurtarma'}
          </h2>
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Neural_Authentication_Gateway</p>
        </div>

        {statusMsg && (
          <div className={`mb-6 p-4 border rounded-xl text-[10px] font-black uppercase tracking-widest text-center ${
            statusMsg.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
          }`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="grid grid-cols-1 gap-3">
              <input type="text" placeholder="Ad Soyad / Yetkili" required value={formData.authorizedPerson} onChange={(e) => setFormData({...formData, authorizedPerson: e.target.value})} className="w-full h-12 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" />
              <input type="text" placeholder="Firma Adı" required value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full h-12 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" />
              <textarea placeholder="Firma İş Özeti (AI Teklifleri için)" required value={formData.companyDescription} onChange={(e) => setFormData({...formData, companyDescription: e.target.value})} className="w-full h-20 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all resize-none" />
              <input type="email" placeholder="Kurumsal E-posta" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-12 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" />
            </div>
          )}

          {mode === 'forgot' ? (
            <input type="email" placeholder="E-posta Adresiniz" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-12 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" />
          ) : (
            <>
              <input type="text" placeholder="Kullanıcı Adı" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full h-12 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" />
              <input type="password" placeholder="Şifre" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full h-12 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" />
            </>
          )}

          <div className="flex items-center justify-between px-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
               <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Beni Hatırla</span>
            </label>
            {mode === 'login' && (
              <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-all">Şifremi Unuttum</button>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full h-14 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 mt-4">
            {loading ? 'İşleniyor...' : mode === 'login' ? 'Giriş Yap' : mode === 'signup' ? 'Kayıt Ol' : 'Bağlantı Gönder'}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-slate-900 transition-all">
            {mode === 'login' ? 'Hesabınız yok mu? Üye Olun' : 'Zaten üyeyim, Giriş Yap'}
          </button>
          <button onClick={onCancel} className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-red-500">Ana Sayfaya Dön</button>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
