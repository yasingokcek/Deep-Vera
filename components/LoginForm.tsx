
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DB_KEY = 'deepvera_local_db';

  const syncLocalUsers = () => {
    try {
      const saved = localStorage.getItem(DB_KEY);
      if (saved) {
        const users = JSON.parse(saved);
        setRegisteredUsers(users);
        return users;
      }
    } catch (e) {
      console.error("DB Okuma Hatası", e);
    }
    return [];
  };

  useEffect(() => {
    syncLocalUsers();
  }, [mode, showDebug]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    companyName: '',
    companyDescription: '',
    companyFixedPhone: '',
    companyMobilePhone: '',
    companyAddress: '',
    authorizedPerson: '',
    companyLogo: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, companyLogo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const inputUser = formData.username.trim().toLowerCase();
    const inputPass = formData.password.trim();

    setTimeout(() => {
      if (inputUser === 'admin' && inputPass === 'admin') {
        onLogin({
          username: 'admin',
          name: 'Sistem Yöneticisi',
          email: 'admin@deepvera.ai',
          isPro: true,
          role: 'admin',
          provider: 'local',
          tokenBalance: 999999,
          companyName: 'DeepVera AI HQ'
        });
        setLoading(false);
        return;
      }

      if (inputUser === 'demo' && inputPass === 'demo') {
        onLogin({
          username: 'demo',
          name: 'Demo Kullanıcı',
          email: 'demo@deepvera.ai',
          isPro: true,
          role: 'user',
          provider: 'demo',
          tokenBalance: 5000,
          companyName: 'DeepVera AI Çözümleri'
        });
        setLoading(false);
        return;
      }

      const currentDB = syncLocalUsers();

      if (mode === 'signup') {
        if (currentDB.some((u: User) => u.username.toLowerCase() === inputUser)) {
          setErrorMessage("Kullanıcı adı zaten mevcut!");
          setLoading(false);
          return;
        }

        const newUser: User = {
          ...formData,
          username: inputUser,
          password: inputPass,
          name: formData.authorizedPerson || formData.username,
          isPro: false,
          role: 'user',
          provider: 'local',
          tokenBalance: 1500
        };
        
        const updatedDB = [...currentDB, newUser];
        localStorage.setItem(DB_KEY, JSON.stringify(updatedDB));
        onLogin(newUser);
      } else {
        const user = currentDB.find((u: User) => u.username.toLowerCase() === inputUser);
        if (!user) {
          setErrorMessage(`Kullanıcı "${inputUser}" bulunamadı!`);
          setShowDebug(true);
        } else if (user.password !== inputPass) {
          setErrorMessage("Hatalı şifre!");
          setShowDebug(true);
        } else {
          onLogin(user);
        }
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
      <div className={`bg-white w-full ${mode === 'signup' ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] rounded-[3rem] shadow-2xl border border-white overflow-hidden flex flex-col transition-all duration-500`}>
        {errorMessage && (
          <div className="bg-red-600 text-white p-3.5 text-center text-[11px] font-black uppercase tracking-widest z-[100] animate-pulse">
             ⚠️ {errorMessage}
          </div>
        )}

        <div className="p-8 pb-4 text-center">
           <div className="w-14 h-14 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center text-white text-xl font-black mb-4">DV</div>
           <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">DeepVera İstihbarat</h2>
           
           <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full max-w-[240px] mx-auto">
              <button onClick={() => setMode('login')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl ${mode === 'login' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>Giriş Yap</button>
              <button onClick={() => setMode('signup')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl ${mode === 'signup' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>Kayıt Ol</button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'login' ? (
              <div className="space-y-4">
                 <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" placeholder="Kullanıcı Adı (demo)" />
                 <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" placeholder="Şifre (demo)" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                 <div className="space-y-4">
                    <input type="text" name="username" placeholder="Kullanıcı Adı" required value={formData.username} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                    <input type="password" name="password" placeholder="Şifre" required value={formData.password} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                    <input type="text" name="companyName" placeholder="Şirket Tam Adı" required value={formData.companyName} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                    <input type="text" name="authorizedPerson" placeholder="Ad Soyad" required value={formData.authorizedPerson} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                    <input type="email" name="email" placeholder="Kurumsal E-posta" required value={formData.email} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                 </div>
                 <div className="space-y-4">
                    <textarea name="companyDescription" required placeholder="İşinizi tanımlayın... AI bunu özel teklifler hazırlamak için kullanır." value={formData.companyDescription} onChange={handleInputChange} className="w-full h-32 p-4 bg-blue-50/20 border border-blue-100 rounded-2xl text-[11px] font-medium resize-none" />
                    <input type="text" name="companyAddress" placeholder="İş Adresi" value={formData.companyAddress} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                 </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95">
              {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : mode === 'login' ? 'Güvenli Giriş' : 'Kaydı Tamamla'}
            </button>

            <div className="flex justify-between items-center px-4">
               <button type="button" onClick={onCancel} className="text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-red-500">← Geri</button>
               <button type="button" onClick={() => { setShowDebug(!showDebug); syncLocalUsers(); }} className="text-[9px] font-black text-blue-600 uppercase tracking-widest underline">Yardım mı lazım? (Demo bilgileri)</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
