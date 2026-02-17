
import React, { useState, useEffect } from 'react';
import { User, SenderAccount } from '../types';

// MÜHENDİSLİK NOTU: Bu ID uygulama geliştiricisi tarafından tanımlanmıştır.
// Google Cloud Console üzerinden "622487947070-dtn0iqveim78kor9l4ljthsimmtndl4l.apps.googleusercontent.com" olarak atanmıştır.
const APP_GOOGLE_CLIENT_ID = "622487947070-dtn0iqveim78kor9l4ljthsimmtndl4l.apps.googleusercontent.com";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (fields: Partial<User>) => void;
}

const IdentityModal: React.FC<Props> = ({ isOpen, onClose, user, onUpdate }) => {
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);

  useEffect(() => {
    const checkGsi = setInterval(() => {
      if ((window as any).google?.accounts?.oauth2) {
        setIsGsiLoaded(true);
        clearInterval(checkGsi);
      }
    }, 500);
    return () => clearInterval(checkGsi);
  }, []);

  if (!isOpen || !user) return null;

  const handleLinkGmail = () => {
    try {
      const google = (window as any).google;
      const client = google.accounts.oauth2.initTokenClient({
        client_id: APP_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.access_token) {
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const profile = await profileRes.json();

            const newAccount: SenderAccount = {
              id: Math.random().toString(36).substr(2, 9),
              email: profile.email,
              accessToken: tokenResponse.access_token,
              status: 'active',
              usageCount: 0
            };

            const updatedAccounts = [...(user.senderAccounts || []).filter(a => a.email !== profile.email), newAccount];
            onUpdate({ senderAccounts: updatedAccounts, isGmailConnected: true });
          }
        },
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      alert("Google Onay Ekranı Başlatılamadı. Lütfen Client ID ve Google Cloud ayarlarını kontrol edin.");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col h-[80vh] border border-white">
        
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl">✉️</div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Gmail İstihbarat Kanalları</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Otonom Gönderici Havuzu</p>
             </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white rounded-xl text-3xl text-slate-300 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
          
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px]"></div>
             <div className="relative z-10 flex justify-between items-center">
                <div className="max-w-md">
                   <h4 className="text-xl font-black uppercase tracking-tighter mb-4">Yeni Kanal Ekle</h4>
                   <p className="text-sm font-medium text-slate-400 leading-relaxed">
                     Aşağıdaki butona basarak Gmail hesabınızı bağlayın. Sistem otomatik olarak "Onay" ekranını açacak ve güvenli bir şekilde izin alacaktır.
                   </p>
                </div>
                <button 
                  onClick={handleLinkGmail}
                  disabled={!isGsiLoaded}
                  className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-30"
                >
                  GMAIL HESABI BAĞLA
                </button>
             </div>
          </div>

          <div className="space-y-6">
             <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-4">Aktif Hesaplar ({user.senderAccounts?.length || 0})</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.senderAccounts?.map((acc) => (
                  <div key={acc.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-blue-400 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">📧</div>
                        <div className="flex flex-col">
                           <span className="text-[12px] font-black text-slate-900">{acc.email}</span>
                           <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1 italic">YETKİ VERİLDİ</span>
                        </div>
                     </div>
                     <button onClick={() => onUpdate({ senderAccounts: user.senderAccounts.filter(a => a.id !== acc.id) })} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all text-2xl">&times;</button>
                  </div>
                ))}
                {(!user.senderAccounts || user.senderAccounts.length === 0) && (
                   <div className="col-span-2 py-20 text-center border-4 border-dashed border-slate-50 rounded-[3rem] opacity-30">
                      <span className="text-[10px] font-black uppercase tracking-widest">Bağlı hesap bulunmuyor.</span>
                   </div>
                )}
             </div>
          </div>
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
           <button onClick={onClose} className="px-16 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95">PANELİ KAPAT</button>
        </div>
      </div>
    </div>
  );
};

export default IdentityModal;
