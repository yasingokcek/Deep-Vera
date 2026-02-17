
import React, { useState, useEffect } from 'react';
import { User, SenderAccount } from '../types';

const APP_GOOGLE_CLIENT_ID = "622487947070-dtn0iqveim78kor9l4ljthsimmtndl4l.apps.googleusercontent.com";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (fields: Partial<User>) => void;
}

const IdentityModal: React.FC<Props> = ({ isOpen, onClose, user, onUpdate }) => {
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'gmail' | 'company'>('company');
  const [companyForm, setCompanyForm] = useState({
    companyName: user?.companyName || '',
    globalPitch: user?.globalPitch || '',
    authorizedPerson: user?.authorizedPerson || '',
    officialAddress: user?.officialAddress || '',
    companyWebsite: user?.companyWebsite || ''
  });

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

  const handleSaveCompany = () => {
    onUpdate(companyForm);
    alert("Şirket tanıtım ayarları kaydedildi. AI artık bu verileri kullanacak.");
  };

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
      alert("Google Onay Ekranı Başlatılamadı.");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-white">
        
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl">⚙️</div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Profil & AI Yazım Merkezi</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Kurumsal Kimlik Yönetimi</p>
             </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white rounded-xl text-3xl text-slate-300 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">&times;</button>
        </div>

        <div className="flex bg-slate-100 p-2 mx-10 mt-6 rounded-3xl shrink-0">
          <button onClick={() => setActiveTab('company')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'company' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-400'}`}>Firma Tanıtım & AI Ayarı</button>
          <button onClick={() => setActiveTab('gmail')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'gmail' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-400'}`}>Gmail Kanalları</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'company' ? (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Şirketinizin Adı</label>
                  <input 
                    type="text" value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({...companyForm, companyName: e.target.value})}
                    placeholder="Örn: DeepVera Teknoloji"
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">İletişim Kuracak Yetkili</label>
                  <input 
                    type="text" value={companyForm.authorizedPerson}
                    onChange={(e) => setCompanyForm({...companyForm, authorizedPerson: e.target.value})}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Global Değer Önerisi (Pitch)</label>
                <textarea 
                  value={companyForm.globalPitch}
                  onChange={(e) => setCompanyForm({...companyForm, globalPitch: e.target.value})}
                  placeholder="Şirketiniz ne yapar? Hangi sorunu çözer? AI bu metni kullanarak e-postaları kişiselleştirir."
                  className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-[12px] font-medium leading-relaxed outline-none focus:bg-white focus:border-blue-500 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Resmi Web Sitesi</label>
                  <input 
                    type="text" value={companyForm.companyWebsite}
                    onChange={(e) => setCompanyForm({...companyForm, companyWebsite: e.target.value})}
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Ofis Adresi</label>
                  <input 
                    type="text" value={companyForm.officialAddress}
                    onChange={(e) => setCompanyForm({...companyForm, officialAddress: e.target.value})}
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveCompany}
                className="w-full h-16 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all"
              >
                AYARLARI VE ŞİRKET KİMLİĞİNİ KAYDET
              </button>
            </div>
          ) : (
            <div className="space-y-12 animate-fade-in">
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px]"></div>
                <div className="relative z-10 flex justify-between items-center">
                  <div className="max-w-md">
                    <h4 className="text-xl font-black uppercase tracking-tighter mb-4">Yeni Kanal Ekle</h4>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed">Gmail hesabınızı bağlayarak otonom gönderim havuzuna dahil edin.</p>
                  </div>
                  <button 
                    onClick={handleLinkGmail}
                    disabled={!isGsiLoaded}
                    className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-xl disabled:opacity-30"
                  >
                    GMAIL HESABI BAĞLA
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">Aktif Hesaplar ({user.senderAccounts?.length || 0})</h4>
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
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
           <button onClick={onClose} className="px-16 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95">AYARLARI KAPAT</button>
        </div>
      </div>
    </div>
  );
};

export default IdentityModal;
