
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User } from '../types';

interface Props {
  user: User | null;
}

const DeepVeraAssistant: React.FC<Props> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: "Sistemler çevrimiçi. Ben DeepVera'nın Nöral Rehberiyim. Bugün istihbarat operasyonlarınıza nasıl yardımcı olabilirim?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    const badWords = ['fuck', 'shit', 'piss', 'cunt', 'asshole', 'küfür', 'aptal', 'salak', 'şerefsiz', 'piç'];
    if (badWords.some(w => userText.toLowerCase().includes(w))) {
      setMessages(prev => [...prev, { role: 'ai', text: "SİSTEM HATASI: Topluluk standartlarının ihlali tespit edildi. Güvenlik nedeniyle bu görüşme sonlandırılmıştır." }]);
      setIsLoading(false);
      setTimeout(() => setIsOpen(false), 3000);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: `Sen DeepVera AI Asistanısın, bu B2B istihbarat platformunun Kıdemli Yazılım Mühendisisin.
          DEEPVERA ÖZELLİKLERİ:
          - Nöral tarama kullanarak dünya çapında şirket verisi ayıklama.
          - Avustralya pazarında (NSW, Victoria, vb.) uzmanlaşmıştır.
          - AI tarafından oluşturulan e-postalar ve buzkıranlarla soğuk erişimi otomatikleştirir.
          - Krediler: 1 Kredi = 1 derin tarama.
          - Sıfırlama Aracı: Havuzu yeni operasyonlar için temizler.
          - Dışa Aktarma: Yüksek yoğunluklu CSV raporlama.
          
          TON: Profesyonel, mühendislik odaklı, yardımsever ama ciddi.
          İLETİŞİM: contact@deepvera.ai adresinden destek alınabilir.
          GÜVENLİK: Kötüye kullanıma tolerans gösterme. Kullanıcı kaba davranırsa sohbeti sonlandır. Yanıtları TÜRKÇE ver.`,
          temperature: 0.7,
        }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Tarama yapılıyor... Anında yanıt alınamadı." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "İletişim rölesi başarısız oldu. Ağınızı kontrol edin." }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {isOpen ? (
        <div className="w-[380px] h-[500px] bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in">
           <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-black shadow-lg animate-pulse">DV</div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Kıdemli Mühendis</h4>
                    <p className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter">AI Rehber Aktif</p>
                 </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-xl text-white/50 hover:text-white">&times;</button>
           </div>
           
           <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm ${
                     m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                   }`}>
                      {m.text}
                   </div>
                </div>
              ))}
              {isLoading && <div className="text-[9px] font-black text-blue-500 uppercase animate-pulse">AI Düşünüyor...</div>}
           </div>

           <div className="p-4 border-t border-slate-50 bg-white flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="DeepVera rehberine sorun..."
                className="flex-1 h-11 px-4 bg-slate-50 rounded-xl text-[11px] font-bold outline-none focus:bg-white border border-slate-100"
              />
              <button onClick={sendMessage} className="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center text-sm shadow-lg">➔</button>
           </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 hover:bg-slate-900 transition-all active:scale-95 group relative"
        >
          <div className="absolute -inset-1 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 animate-pulse"></div>
          <span className="relative z-10">💬</span>
        </button>
      )}
    </div>
  );
};

export default DeepVeraAssistant;
