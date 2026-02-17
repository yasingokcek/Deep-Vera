
import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  isPro?: boolean;
  onClose: () => void;
  onSuccess: (tokens: number) => void;
  onUpgrade: () => void;
}

const packages = [
  { id: '1', tokens: 100, price: '299 TL' },
  { id: '2', tokens: 500, price: '1299 TL', popular: true },
  { id: '3', tokens: 1000, price: '1999 TL' },
];

const PaymentModal: React.FC<Props> = ({ isOpen, isPro, onClose, onSuccess, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'subscription'>('tokens');
  const [selectedPkg, setSelectedPkg] = useState(packages[1]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm fade-in">
      <div className="bg-white max-w-2xl w-full rounded-[3rem] overflow-hidden flex flex-col p-10 lg:p-14 shadow-2xl border border-slate-100 text-left">
        <div className="flex justify-between items-start mb-10">
           <div className="flex flex-col">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">DV Token Satın Al</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">DeepVera Nöral Ağ Kredisi</p>
           </div>
           <button onClick={onClose} className="text-slate-300 hover:text-slate-900 text-4xl leading-none">&times;</button>
        </div>

        <div className="flex gap-4 mb-8 bg-slate-50 p-1.5 rounded-2xl">
           <button onClick={() => setActiveTab('tokens')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl ${activeTab === 'tokens' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Token Ekle</button>
           <button onClick={() => setActiveTab('subscription')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl ${activeTab === 'subscription' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>PRO Plan</button>
        </div>

        {activeTab === 'tokens' ? (
          <div className="space-y-6">
            <div className="space-y-3">
              {packages.map((pkg) => (
                <button key={pkg.id} onClick={() => setSelectedPkg(pkg)} className={`w-full p-6 rounded-2xl border flex items-center justify-between transition-all ${selectedPkg.id === pkg.id ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-100'}`}>
                  <div className="flex flex-col items-start">
                     <span className={`text-[12px] font-black uppercase tracking-widest ${selectedPkg.id === pkg.id ? 'text-blue-600' : 'text-slate-900'}`}>{pkg.tokens.toLocaleString()} DV TOKEN</span>
                     {pkg.popular && <span className="text-[8px] font-black text-blue-500 uppercase mt-1 italic">EN POPÜLER SEÇİM</span>}
                  </div>
                  <span className="text-base font-black text-slate-900">{pkg.price}</span>
                </button>
              ))}
            </div>
            <button onClick={() => onSuccess(selectedPkg.tokens)} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all">ÖDEMEYİ TAMAMLA</button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className={`p-8 rounded-3xl border-2 relative overflow-hidden transition-all ${isPro ? 'border-amber-500 bg-amber-50/20' : 'border-blue-600 bg-white'}`}>
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h4 className="text-2xl font-black text-slate-900 uppercase">PRO Üyelik</h4>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Operasyonel Avantajlar</p>
                     </div>
                     <div className="text-right">
                        <span className="text-3xl font-black text-slate-900">1490 TL</span>
                        <p className="text-[9px] font-black text-slate-400 uppercase">/ Aylık</p>
                     </div>
                  </div>
                  <ul className="space-y-4 mb-10 text-xs font-bold text-slate-600">
                     <li>✓ Tüm token paketlerinde %50 indirim</li>
                     <li>✓ Öncelikli tarama sırası</li>
                     <li>✓ Gelişmiş Otomasyon özellikleri</li>
                     <li>✓ Sınırsız CSV Dışa Aktarma</li>
                  </ul>
                  {isPro ? (
                    <div className="w-full py-5 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] text-center">PRO AKTİF</div>
                  ) : (
                    <button onClick={onUpgrade} className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em]">PRO'YA YÜKSELT</button>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
