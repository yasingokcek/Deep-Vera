
import React, { useState } from 'react';
import { User } from '../types';
import { analyzeOwnWebsite } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (fields: Partial<User>) => void;
}

const IdentityModal: React.FC<Props> = ({ isOpen, onClose, user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'strategy' | 'pitch' | 'technical'>('basic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  if (!isOpen || !user) return null;

  // Profil doluluk oranı
  const fields = [
    user.companyName, user.companyWebsite, user.authorizedPerson, 
    user.mainActivity, user.targetAudience, user.globalPitch
  ];
  const completionPercent = Math.round((fields.filter(f => !!f).length / fields.length) * 100);

  const handleAIScan = async () => {
    if (!user.companyWebsite || !user.companyWebsite.includes('.')) {
      alert("Lütfen geçerli bir web sitesi URL'si girin.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeOwnWebsite(user.companyWebsite);
      onUpdate(result);
    } catch (e) {
      alert("AI Analizi sırasında bir hata oluşti. Lütfen URL'yi kontrol edin.");
    }
    setIsAnalyzing(false);
  };

  const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
        activeTab === id 
        ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
      }`}
    >
      <span className="text-xl">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl border border-white overflow-hidden flex flex-col scale-in">
        
        {/* Top Header HUD */}
        <div className="p-10 border-b border-slate-50 bg-white/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-xl">⚙️</div>
             <div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Profil Komut Merkezi</h3>
                <div className="flex items-center gap-3 mt-1">
                   <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${completionPercent}%` }}></div>
                   </div>
                   <span className="text-[9px] font-black text-blue-600 uppercase">%{completionPercent} VERİ DERİNLİĞİ</span>
                </div>
             </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all text-slate-300 text-3xl font-light hover:rotate-90"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation */}
          <div className="w-64 border-r border-slate-50 p-6 flex flex-col gap-2 shrink-0 bg-slate-50/20">
             <TabButton id="basic" label="Kurumsal Kimlik" icon="🏢" />
             <TabButton id="strategy" label="AI Stratejisi" icon="🧠" />
             <TabButton id="pitch" label="Global Pitch" icon="✉️" />
             <TabButton id="technical" label="Entegrasyonlar" icon="⚙️" />
             
             <div className="mt-auto p-6 bg-slate-900 rounded-[2rem] border border-blue-500/20">
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block mb-2">Sistem Notu</span>
                <p className="text-[9px] text-white/40 font-bold leading-relaxed italic">
                  "Bu bilgiler AI ajanlarınızın potansiyel müşterilere karşı 'Sizmiş' gibi konuşmasını sağlar."
                </p>
             </div>
          </div>

          {/* Right Form Area */}
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-10">
            {activeTab === 'basic' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Şirket Web Sitesi</label>
                    <div className="relative group">
                       <input 
                         type="text" 
                         value={user.companyWebsite || ''} 
                         onChange={(e) => onUpdate({ companyWebsite: e.target.value })} 
                         className="w-full h-14 pl-6 pr-40 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all" 
                         placeholder="https://sirketiniz.com" 
                       />
                       <button 
                         onClick={handleAIScan}
                         disabled={isAnalyzing}
                         className={`absolute right-2 top-2 bottom-2 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                           isAnalyzing ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-slate-900 shadow-lg'
                         }`}
                       >
                         {isAnalyzing ? 'Taranıyor...' : 'AI Analiz Et'}
                       </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Temsilci / İmza</label>
                    <input 
                      type="text" 
                      value={user.authorizedPerson || ''} 
                      onChange={(e) => onUpdate({ authorizedPerson: e.target.value })} 
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all" 
                      placeholder="Örn: Mehmet Yılmaz" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Resmi Şirket Adı</label>
                  <input 
                    type="text" 
                    value={user.companyName || ''} 
                    onChange={(e) => onUpdate({ companyName: e.target.value })} 
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all" 
                    placeholder="Şirket isminiz" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Kurumsal Özet</label>
                  <textarea 
                    value={user.companyDescription || ''} 
                    onChange={(e) => onUpdate({ companyDescription: e.target.value })} 
                    className="w-full h-32 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-[12px] font-medium leading-relaxed outline-none focus:bg-white focus:border-blue-500 transition-all resize-none" 
                    placeholder="Şirket vizyonu ve ne yaptığınız (AI tarafından otomatik doldurulabilir)..." 
                  />
                </div>
              </div>
            )}

            {activeTab === 'strategy' && (
              <div className="space-y-8 animate-fade-in">
                <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-100 mb-10">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🚀</div>
                      <h4 className="text-xl font-black uppercase tracking-tight leading-none">AI Satış Motorunu Besle</h4>
                   </div>
                   <p className="text-[11px] font-medium text-blue-100 leading-relaxed">Hedef şirketlerle konuşurken odaklanılması gereken ana çözümünüz nedir?</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Temel Çözüm ve Teknoloji</label>
                  <textarea 
                    value={user.mainActivity || ''} 
                    onChange={(e) => onUpdate({ mainActivity: e.target.value })} 
                    className="w-full h-24 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-[12px] font-medium outline-none focus:bg-white focus:border-blue-500 transition-all resize-none" 
                    placeholder="Hangi problemi çözüyorsunuz?" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">İdeal Müşteri (Persona)</label>
                    <input 
                      type="text" 
                      value={user.targetAudience || ''} 
                      onChange={(e) => onUpdate({ targetAudience: e.target.value })} 
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all" 
                      placeholder="Örn: KOBİ Sahipleri, Satın Alma Müdürleri" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Rakipleriniz</label>
                    <input 
                      type="text" 
                      value={user.competitorsInfo || ''} 
                      onChange={(e) => onUpdate({ competitorsInfo: e.target.value })} 
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all" 
                      placeholder="Sizi onlardan ayıran fark nedir?" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pitch' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[3rem]">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">🎯</div>
                       <div>
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Global Satış Teklifi</h4>
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">DeepVera Global Pitch v1.0</p>
                       </div>
                    </div>
                    
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed mb-8">
                      Buradaki metin, DeepVera'nın her şirket için üreteceği e-postalarda sizin "Ana Vaadinizi" temsil eder. Yapay zeka bu metni hedefin ihtiyacına göre harmanlar.
                    </p>
                    
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-900 uppercase ml-1">Reddedilemez Değer Öneriniz</label>
                       <textarea 
                         value={user.globalPitch || ''} 
                         onChange={(e) => onUpdate({ globalPitch: e.target.value })} 
                         className="w-full h-56 p-8 bg-white border border-emerald-200 rounded-[2.5rem] text-[13px] font-medium leading-relaxed outline-none focus:border-emerald-500 shadow-inner transition-all"
                         placeholder="Örn: 'Bizim geliştirdiğimiz X sistemi sayesinde yıllık maliyetlerinizi %30 düşürürken, verimliliğinizi iki katına çıkarıyoruz...'"
                       />
                       <p className="text-[8px] font-black text-slate-400 uppercase text-center mt-4">AI ANALİZİ BU METNİ WEB SİTENİZDEN OTOMATİK GELİŞTİREBİLİR.</p>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-slate-900 rounded-[3rem] p-12 border border-blue-500/20 shadow-2xl">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">⚡</div>
                      <div>
                         <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Otomasyon Köprüsü</h4>
                         <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-2">Webhook & CRM Entegrasyonu</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">n8n / Zapier Webhook URL</label>
                      <input 
                        type="text" 
                        value={user.n8nWebhookUrl || ''} 
                        onChange={(e) => onUpdate({ n8nWebhookUrl: e.target.value })} 
                        className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-[12px] font-mono text-blue-400 outline-none focus:border-blue-500 transition-all" 
                        placeholder="https://..." 
                      />
                      <p className="text-[9px] font-bold text-slate-500 px-4 leading-relaxed mt-4">
                         Bu URL tanımlandığında şirket kartlarındaki "CRM Senkron" butonu aktifleşir ve veriler otomatik akar.
                      </p>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-10 bg-white border-t border-slate-50 flex items-center justify-between shrink-0">
           <button onClick={onClose} className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-red-500 transition-colors">Vazgeç</button>
           <button 
             onClick={onClose} 
             className="px-20 py-7 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
           >
             Yapılandırmayı Kaydet
           </button>
        </div>
      </div>
    </div>
  );
};

export default IdentityModal;
