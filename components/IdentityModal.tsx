
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
  const [activeTab, setActiveTab] = useState<'company' | 'gmail'>('company');
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
    alert("Şirket kimliği başarıyla senkronize edildi.");
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

  const completionRate = () => {
    const fields = [companyForm.companyName, companyForm.globalPitch, companyForm.authorizedPerson, companyForm.companyWebsite];
    const filled = fields.filter(f => f && f.length > 2).length;
    return Math.round((filled / fields.length) * 100);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-slate-950/40 backdrop-blur-2xl animate-fade-in">
      <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[90vh] md:h-[85vh] border border-white/50">
        
        {/* Header Section */}
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl shadow-xl shadow-slate-200">
                ⚙️
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Firma Kimliği & AI Konfigürasyonu</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Hesap Tipi: {user.role?.toUpperCase()}</p>
             </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all text-3xl flex items-center justify-center border border-slate-100">&times;</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-72 bg-slate-50/50 border-r border-slate-100 p-8 hidden lg:flex flex-col gap-8 shrink-0">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profil Doluluğu</span>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-2xl font-black text-slate-900">%{completionRate()}</span>
                  <span className="text-[8px] font-black text-emerald-500 uppercase">Hazır</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${completionRate()}%` }}></div>
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
               <button onClick={() => setActiveTab('company')} className={`px-6 py-4 rounded-xl text-left text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'company' ? 'bg-white shadow-md text-blue-600 border border-slate-100' : 'text-slate-500 hover:bg-white'}`}>
                  🏢 Firma Kimliği
               </button>
               <button onClick={() => setActiveTab('gmail')} className={`px-6 py-4 rounded-xl text-left text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'gmail' ? 'bg-white shadow-md text-blue-600 border border-slate-100' : 'text-slate-500 hover:bg-white'}`}>
                  📧 Gmail Kanalları
               </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8 md:p-14 custom-scrollbar bg-white">
            <div className="max-w-4xl mx-auto">
              {activeTab === 'company' ? (
                <div className="space-y-12 animate-fade-in">
                  
                  {/* Firma Bilgileri */}
                  <div className="space-y-8">
                    <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm">01</span>
                      Kurumsal Bilgiler
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Firma Adı</label>
                        <input 
                          type="text" value={companyForm.companyName}
                          onChange={(e) => setCompanyForm({...companyForm, companyName: e.target.value})}
                          className="w-full h-16 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:border-blue-600 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Yetkili Kişi</label>
                        <input 
                          type="text" value={companyForm.authorizedPerson}
                          onChange={(e) => setCompanyForm({...companyForm, authorizedPerson: e.target.value})}
                          className="w-full h-16 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:border-blue-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Değer Önerisi */}
                  <div className="space-y-8">
                    <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                      <span className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm">02</span>
                      AI Strateji Metni
                    </h4>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Değer Öneriniz (Global Pitch)</label>
                      <textarea 
                        value={companyForm.globalPitch}
                        onChange={(e) => setCompanyForm({...companyForm, globalPitch: e.target.value})}
                        className="w-full h-48 p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-[14px] font-medium leading-relaxed outline-none focus:bg-white focus:border-blue-600 transition-all resize-none shadow-sm"
                        placeholder="Şirketinizin fark yaratan özelliklerini yazın..."
                      />
                    </div>
                  </div>

                  {/* Dijital Adresler */}
                  <div className="space-y-8">
                    <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                      <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-sm">03</span>
                      İletişim Kanalları
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Web Sitesi</label>
                        <input 
                          type="text" value={companyForm.companyWebsite}
                          onChange={(e) => setCompanyForm({...companyForm, companyWebsite: e.target.value})}
                          className="w-full h-16 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:border-blue-600 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ofis Adresi</label>
                        <input 
                          type="text" value={companyForm.officialAddress}
                          onChange={(e) => setCompanyForm({...companyForm, officialAddress: e.target.value})}
                          className="w-full h-16 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:border-blue-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="space-y-12 animate-fade-in">
                  <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl">
                    <h4 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-4">
                       Gmail Entegrasyonu
                       <span className="px-4 py-1.5 bg-blue-600 text-[10px] rounded-full">Güvenli Bağlantı</span>
                    </h4>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 max-w-lg">
                      DeepVera otonom ajanlarının sizin adınıza e-posta gönderebilmesi için kurumsal Gmail hesaplarınızı sisteme bağlayın.
                    </p>
                    <button 
                      onClick={handleLinkGmail}
                      disabled={!isGsiLoaded}
                      className="px-12 py-6 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl disabled:opacity-30"
                    >
                      YENİ GMAIL KANALI BAĞLA ➔
                    </button>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Bağlı Gönderim Kanalları ({user.senderAccounts?.length || 0})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.senderAccounts?.length === 0 ? (
                         <div className="col-span-2 py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center flex flex-col items-center">
                            <span className="text-4xl mb-4 opacity-20">📧</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bağlı kanal bulunamadı</span>
                         </div>
                      ) : user.senderAccounts?.map((acc) => (
                        <div key={acc.id} className="p-8 bg-white border border-slate-100 rounded-[2.2rem] flex items-center justify-between group hover:border-blue-500 hover:shadow-xl transition-all shadow-sm">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors">
                                 <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" className="w-6 h-6" alt="Gmail" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                 <span className="text-[13px] font-black text-slate-900 truncate">{acc.email}</span>
                                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Aktif_Kanal</span>
                              </div>
                           </div>
                           <button 
                             onClick={() => onUpdate({ senderAccounts: user.senderAccounts.filter(a => a.id !== acc.id) })} 
                             className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-red-500 rounded-xl transition-all"
                           >
                             &times;
                           </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-12 py-10 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-5 shrink-0">
           <button 
             onClick={onClose} 
             className="px-12 py-6 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all"
           >
             Kapat
           </button>
           <button 
             onClick={handleSaveCompany} 
             className="px-16 py-6 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all flex items-center gap-4"
           >
             DEĞİŞİKLİKLERİ KAYDET <span className="text-base">⚡</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default IdentityModal;
