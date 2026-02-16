
import React, { useState } from 'react';
import { User } from '../types';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    authorizedPerson: '',
    companyName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      onLogin({
        username: formData.username || 'user',
        name: formData.authorizedPerson || formData.username || 'Yeni Üye',
        email: formData.email || 'user@deepvera.ai',
        isPro: false,
        role: 'user',
        provider: 'local',
        tokenBalance: 1500,
        companyName: formData.companyName
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-50/20 backdrop-blur-3xl flex items-center justify-center p-4 z-[200]">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white flex flex-col p-10 relative animate-fade-in overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl mx-auto flex items-center justify-center text-lg font-black mb-6 shadow-xl">DV</div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
            {mode === 'login' ? 'Tekrar Hoş Geldiniz' : 'Aramıza Katılın'}
          </h2>
          <p className="text-slate-400 text-[8px] font-bold uppercase tracking-[0.3em] mt-2">Global_Neural_Network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <input type="text" name="authorizedPerson" placeholder="Ad Soyad" required value={formData.authorizedPerson} onChange={(e) => setFormData({...formData, authorizedPerson: e.target.value})} className="w-full h-12 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" />
              <input type="email" name="email" placeholder="Kurumsal E-posta" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-12 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" />
            </>
          )}
          <input type="text" name="username" placeholder="Kullanıcı Adı" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full h-12 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" />
          <input type="password" name="password" placeholder="Şifre" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full h-12 p-4 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold outline-none focus:bg-white focus:border-blue-400 transition-all" />
          
          <button type="submit" disabled={loading} className="w-full h-14 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 mt-4">
            {loading ? 'SİNYAL ALINIYOR...' : mode === 'login' ? 'KİMLİK DOĞRULA' : 'ÜYE OL VE BAŞLA'}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-slate-900 transition-all">
            {mode === 'login' ? 'Hesabınız yok mu? Üye Olun' : 'Zaten üyeyim, Giriş Yap'}
          </button>
          <button onClick={onCancel} className="text-[8px] font-black text-slate-300 uppercase tracking-widest hover:text-red-500">Ana Sayfaya Dön</button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
