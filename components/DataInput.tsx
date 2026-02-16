
import React, { useState } from 'react';

interface DataInputProps {
  onStart: (content: string) => void;
  isLoading: boolean;
  isOutOfTokens: boolean;
}

const DataInput: React.FC<DataInputProps> = ({ onStart, isLoading, isOutOfTokens }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) onStart(content);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isOutOfTokens ? "Bakiye yetersiz..." : "Web sitesi URL'sini buraya yapıştırın..."}
            className={`w-full h-24 p-5 bg-white border rounded-[1.5rem] outline-none transition-all text-xs font-bold resize-none leading-relaxed shadow-sm ${
              isOutOfTokens ? 'border-red-100 text-red-300 placeholder-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
            }`}
            disabled={isLoading || isOutOfTokens}
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !content.trim() || isOutOfTokens}
        className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
          isLoading || !content.trim() || isOutOfTokens
          ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
          : 'bg-blue-600 text-white hover:bg-slate-900 shadow-lg shadow-blue-50 hover:-translate-y-0.5 active:translate-y-0'
        }`}
      >
        {isOutOfTokens ? 'BAKİYE YÜKLEYİN' : isLoading ? 'ANALİZ EDİLİYOR...' : 'URL ANALİZİNİ BAŞLAT'}
      </button>
    </form>
  );
};

export default DataInput;
