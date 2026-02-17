
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User } from '../types';

interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const DeepVeraAssistant: React.FC<Props> = ({ user, isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // İlk mesajı asenkron olarak değil, bileşen açıldığında (eğer boşsa) set edelim
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: 'ai', 
          text: `Merhaba ${user?.name || 'Ziyaretçi'}, ben DeepVera'nın Nöral Mimarı. Küresel pazarda 250 milyondan fazla şirket verisini sizin için saniyeler içinde tarayabilir, otonom satış ajanlarımızı Gmail veya LinkedIn üzerinden harekete geçirebilirim. Size nasıl müşteri bulabileceğimiz konusunda stratejik bir rehberlik ister misiniz?` 
        }
      ]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: `Sen DeepVera Intelligence platformunun Sanal Mimarı ve Baş Stratejistisin (DV-Architect).
          
          DEEPVERA NEDİR VE NASIL ÇALIŞIR?:
          1. VERİ MADENCİLİĞİ: 250 milyondan fazla gerçek zamanlı şirket verisine erişiriz. Fuar listeleri, LinkedIn profilleri ve global ticaret sicilleri ana kaynağımızdır.
          2. OTONOM AJANLAR: Sizin adınıza Gmail veya LinkedIn üzerinden iletişime geçeriz. Sadece bir e-posta taslağı değil, otonom bir iletişim süreci yönetiriz.
          3. AKILLI ANALİZ: Hedef firmanın acı noktalarını, rakiplerini ve prestij notlarını Gemini AI ile analiz ederiz.
          
          DİYALOG KURALLARI:
          - TON: Son derece profesyonel, teknoloji odaklı, çözüm üretici ve kurumsal.
          - HEDEF: Kullanıcının DeepVera'yı "Sizin adınıza sahada sıcak satış fırsatı kovalayan bir yapay zeka gücü" olarak görmesini sağlamak.
          - YASAKLAR: "Ben bir dil modeliyim" gibi ifadeler kullanma. Kendini her zaman DV-Architect olarak tanıt.
          - DİL: Her zaman Türkçe konuş.
          - KULLANICI BİLGİSİ: Kullanıcı adı: ${user?.name || 'Bilinmiyor'}, Şirketi: ${user?.companyName || 'Belirtilmedi'}.`,
          temperature: 0.8,
          topP: 0.95,
        }
      });

      const aiText = response.text || "Şu an nöral ağlarda bir senkronizasyon sorunu yaşıyorum. Lütfen tekrar sorar mısınız?";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (e) {
      console.error("AI Error:", e);
      setMessages(prev => [...prev, { role: 'ai', text: "Bağlantı sinyali zayıf. Nöral motor yanıt vermedi." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1001] w-[90vw] sm:w-[420px] h-[600px] bg-white/95 backdrop-blur-3xl border border-slate-200 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-fade-in ring-1 ring-black/5">
       
       {/* Assistant Header */}
       <div className="p-8 bg-slate-950 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 blur-[60px] animate-pulse"></div>
          <div className="flex items-center gap-5 relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
                DV
             </div>
             <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">DV-Architect</h4>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                   <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest italic">Core Engine Linked</span>
                </div>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-all text-2xl relative z-10"
          >
            &times;
          </button>
       </div>
       
       {/* Chat Area */}
       <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-white/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
               <div className={`max-w-[85%] p-6 rounded-[2rem] text-[12px] font-medium leading-[1.6] shadow-sm ${
                 m.role === 'user' 
                 ? 'bg-slate-900 text-white rounded-tr-none' 
                 : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
               }`}>
                  {m.text}
               </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-4 px-4 py-2">
               <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] italic">Ajanlar Analiz Ediyor...</span>
            </div>
          )}
       </div>

       {/* Input Area */}
       <div className="p-6 border-t border-slate-100 bg-white flex gap-4 shrink-0">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Müşteri bulma sürecini sor..."
            className="flex-1 h-14 px-6 bg-slate-50 rounded-2xl text-[12px] font-bold outline-none focus:bg-white border border-slate-100 focus:border-blue-500 transition-all shadow-inner"
          />
          <button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-xl transition-all ${
              !input.trim() || isLoading ? 'bg-slate-100 text-slate-300' : 'bg-slate-950 text-white hover:bg-blue-600 active:scale-90'
            }`}
          >
            ➔
          </button>
       </div>
    </div>
  );
};

export default DeepVeraAssistant;
