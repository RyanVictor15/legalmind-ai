import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { FileText, Clock, AlertCircle } from 'lucide-react';

const History = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data } = await api.get('/analyze/history');
        setCases(data);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative">
        
        {/* Espaçador Mobile */}
        <div className="md:hidden h-16 w-full shrink-0"></div>

        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-white">Meus Casos</h1>

        {loading ? (
          <div className="text-slate-500 animate-pulse">Carregando histórico...</div>
        ) : cases.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center">
            <p className="text-slate-400 mb-2">Nenhum caso analisado ainda.</p>
            <p className="text-xs text-slate-600">Vá para o Dashboard e envie um documento.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cases.map((c) => (
              <div key={c._id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all shadow-lg">
                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <FileText className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{c.filename}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={12} className="text-slate-500" />
                        <span className="text-xs text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString('pt-BR')} às {new Date(c.createdAt).toLocaleTimeString('pt-BR').slice(0,5)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Êxito</span>
                      <p className="text-xl font-bold text-white">{c.riskScore}%</p>
                    </div>

                    <div className={`px-4 py-2 rounded-full text-xs font-bold border ${
                      c.verdict === 'Favorável' || c.verdict === 'Favorable' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {c.verdict || 'Analisado'}
                    </div>
                  </div>

                </div>
                
                {c.summary && (
                  <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <p className="text-sm text-slate-400 line-clamp-2">{c.summary}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;