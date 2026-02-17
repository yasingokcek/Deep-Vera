
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User } from '../types';

interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const DeepVeraAssistant: React.FC<Props> = ({ user, isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: "Sistemler çevrimiçi. Ben DeepVera'nın Nöral Rehberiyim. Bugün istihbarat operasyonlarınıza nasıl yardımcı olabilirim?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

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
          systemInstruction: `Sen DeepVera AI Asistanısın. Profesyonel, mühendislik odaklı ve yardımsever bir ton kullan. Yanıtları TÜRKÇE ver.`,
          temperature: 0.7,
        }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "İşleniyor..." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Bağlantı hatası." }]);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-32 right-6 z-[250] w-[380px] h-[550px] bg-white border border-slate-100 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in transition-all">
       <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-black shadow-lg animate-pulse">DV</div>
             <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">AI Rehber</h4>
                <p className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter mt-1">ONLINE</p>
             </div>
          </div>
          <button onClick={onClose} className="text-3xl text-white/50 hover:text-white transition-colors">&times;</button>
       </div>
       
       <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-slate-50/20">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] p-5 rounded-[1.8rem] text-[11px] font-medium leading-relaxed shadow-sm ${
                 m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
               }`}>
                  {m.text}
               </div>
            </div>
          ))}
          {isLoading && <div className="text-[9px] font-black text-blue-500 uppercase animate-pulse px-2">Nöral Ağlar Yanıtlıyor...</div>}
       </div>

       <div className="p-6 border-t border-slate-50 bg-white flex gap-3 shrink-0">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Rehberden yardım iste..."
            className="flex-1 h-12 px-5 bg-slate-50 rounded-2xl text-[11px] font-bold outline-none focus:bg-white border border-slate-100 transition-all"
          />
          <button onClick={sendMessage} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-lg shadow-xl hover:bg-blue-600 transition-all">➔</button>
       </div>
    </div>
  );
};

export default DeepVeraAssistant;
