
import React from 'react';
import { Participant } from '../types';

interface Props {
  participant: Participant | null;
  onClose: () => void;
  userLogo?: string;
}

const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
);

const XIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

const CompanyDetail: React.FC<Props> = ({ participant, onClose, userLogo }) => {
  if (!participant) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openGmail = () => {
    if (!participant.email || !participant.email.includes('@')) return;
    const subject = encodeURIComponent(participant.emailSubject || '');
    const body = encodeURIComponent(participant.emailDraft || '');
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${participant.email}&su=${subject}&body=${body}`, '_blank');
  };

  const openWhatsApp = () => {
    if (!participant.phone || participant.phone === '...') return;
    let cleanPhone = participant.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '61' + cleanPhone.substring(1);
    else if (cleanPhone.length === 9) cleanPhone = '61' + cleanPhone;
    const greeting = `${participant.name} ekibi merhaba, `;
    const message = encodeURIComponent(`${greeting}\n\n${participant.icebreaker || ''}`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const renderEmailContent = (text: string) => {
    if (!text) return 'İstihbarat Oluşturuluyor...';
    const parts = text.split('[COMPANY_LOGO]');
    return (
      <div className="space-y-4">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <p className="whitespace-pre-wrap">{part}</p>
            {index < parts.length - 1 && (
              <div className="pt-6 border-t border-slate-100 mt-6">
                {userLogo ? (
                  <img src={userLogo} alt="Logo" className="h-10 w-auto object-contain grayscale" />
                ) : (
                  <div className="w-20 h-10 bg-slate-50 border border-dashed rounded-lg flex items-center justify-center text-[7px] font-black text-slate-400">[LOGO]</div>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[580px] bg-white shadow-[-40px_0_100px_rgba(0,0,0,0.15)] z-[100] flex flex-col fade-in border-l border-slate-100">
      <div className="p-8 border-b border-slate-50 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black shadow-lg shrink-0">
               {participant.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase truncate">{participant.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <span className="px-2 py-0.5 bg-blue-600 text-white text-[7px] font-black uppercase rounded-full tracking-widest">{participant.industry}</span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">📍 {participant.location}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-xl flex items-center justify-center transition-all text-slate-400">
            &times;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
           <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">İletişim Kanalı</label>
              <p className="text-[11px] font-black text-slate-900 truncate">{participant.email || 'E-posta Korumalı'}</p>
           </div>
           <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Telefon Kimliği</label>
              <p className="text-[11px] font-black text-slate-900 truncate">{participant.phone || 'Ulaşılamıyor'}</p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <div className="flex gap-3">
           <button onClick={openGmail} disabled={!participant.email?.includes('@')} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all disabled:opacity-20 shadow-lg shadow-blue-100">E-posta Gönder</button>
           <button onClick={openWhatsApp} disabled={!participant.phone || participant.phone === '...'} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all disabled:opacity-20 shadow-lg shadow-emerald-100">WhatsApp Sohbet</button>
        </div>

        <div className="flex gap-2">
          {participant.linkedin && (
            <a href={participant.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#0077B5] hover:border-[#0077B5] hover:bg-[#0077B5]/5 transition-all">
              <LinkedInIcon />
            </a>
          )}
          {participant.instagram && (
            <a href={participant.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#E4405F] hover:border-[#E4405F] hover:bg-[#E4405F]/5 transition-all">
              <InstagramIcon />
            </a>
          )}
          {participant.twitter && (
            <a href={participant.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-black hover:border-black hover:bg-slate-50 transition-all">
              <XIcon />
            </a>
          )}
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden">
           <div className="absolute inset-0 scan-line opacity-20"></div>
           <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                 <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.3em]">Nöral Analiz</span>
              </div>
              <p className="text-base font-bold text-white leading-relaxed italic">"{participant.icebreaker || 'Bağlantı noktaları taranıyor...'}"</p>
           </div>
        </div>

        <div className="space-y-6">
           <div className="flex justify-between items-end">
              <div>
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Satış Taslağı</span>
                 <p className="text-[8px] font-bold text-slate-400 uppercase italic">© 2025 DeepVera Intel</p>
              </div>
              <button onClick={() => { copyToClipboard(participant.emailDraft || ''); alert('Kopyalandı!'); }} className="text-[9px] font-black text-blue-600 uppercase border-b border-blue-600 pb-0.5">Taslağı Kopyala</button>
           </div>
           <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 space-y-6">
              <div className="space-y-2">
                 <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Konu</label>
                 <div className="text-xs font-black text-slate-900">{participant.emailSubject || 'İş Teklifi'}</div>
              </div>
              <div className="space-y-2">
                 <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Mesaj Gövdesi</label>
                 <div className="text-[12px] font-medium leading-relaxed text-slate-600">{renderEmailContent(participant.emailDraft || '')}</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
