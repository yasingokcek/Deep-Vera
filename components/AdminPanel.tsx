
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'agent-handoff' | 'deployment'>('users');
  const DB_KEY = 'deepvera_local_db';

  useEffect(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) setUsers(JSON.parse(saved));
  }, []);

  const agentInstructions = `DEEPVERA PROJECT STRUCTURE & DEPLOYMENT v1.0
--------------------------------------------------
PROJECT ROOT:
├── index.html
├── index.tsx
├── App.tsx
├── types.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── services/
│   └── geminiService.ts
└── components/
    ├── Header.tsx
    ├── DataTable.tsx
    ├── AdminPanel.tsx
    ├── LoginForm.tsx
    └── ... (Diğerleri)

BUILD STEPS:
1. npm install
2. npm run build
3. vercel deploy --prod

Vercel Env: API_KEY=[Gemini_Key]`;

  return (
    <div className="fixed inset-0 z-[500] bg-slate-900 flex flex-col text-white overflow-hidden">
      <div className="h-24 border-b border-white/10 flex items-center justify-between px-12 bg-slate-900/50 backdrop-blur-2xl">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black">DV</div>
            <h2 className="text-white font-black text-2xl uppercase tracking-tighter">DeepVera Deployment Panel</h2>
         </div>
         <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl">
            <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'users' ? 'bg-blue-600' : 'text-slate-400'}`}>Kullanıcılar</button>
            <button onClick={() => setActiveTab('agent-handoff')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'agent-handoff' ? 'bg-purple-600' : 'text-slate-400'}`}>Agent Transferi</button>
            <button onClick={() => setActiveTab('deployment')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'deployment' ? 'bg-emerald-600' : 'text-slate-400'}`}>DNS Setup</button>
         </div>
         <button onClick={onClose} className="px-8 py-3 bg-red-600 text-white rounded-xl text-[11px] font-black uppercase">Kapat</button>
      </div>

      <div className="flex-1 overflow-y-auto p-12">
        {activeTab === 'agent-handoff' && (
          <div className="max-w-4xl mx-auto text-center">
             <h3 className="text-3xl font-black mb-8 text-purple-400 uppercase">Agent Yayınlama Protokolü</h3>
             <div className="bg-black/50 border border-white/10 rounded-3xl p-8 text-left font-mono">
                <pre className="text-emerald-400 text-xs leading-relaxed whitespace-pre-wrap">{agentInstructions}</pre>
             </div>
             <button 
                onClick={() => { navigator.clipboard.writeText(agentInstructions); alert('Kopyalandı!'); }}
                className="mt-8 px-12 py-4 bg-purple-600 rounded-2xl font-black text-xs uppercase"
             >
                YAPIYI KOPYALA
             </button>
          </div>
        )}
        {/* Diğer tablar... */}
      </div>
    </div>
  );
};

export default AdminPanel;
