import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument } from '../services/api'; // Agora vai funcionar!

const Dashboard = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (fileData) => {
    setLoading(true);
    setAnalysis(null);
    try {
      // Chama a função que acabamos de corrigir no api.js
      const result = await analyzeDocument(fileData);
      setAnalysis(result);
    } catch (error) {
      console.error("Erro dashboard:", error);
      alert("Erro ao processar: " + (error.response?.data?.error || "Falha na conexão"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative transition-all duration-300">
        
        {/* Espaçador Mobile (Para o botão não ficar em cima do título) */}
        <div className="md:hidden h-16 w-full shrink-0"></div>

        <div className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8 pb-24">
            
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Olá, Dr(a). {user?.firstName || 'Advogado'}
                </h1>
                <p className="text-slate-400 mt-1 text-sm md:text-base">Painel Inteligente</p>
              </div>
            </header>

            {/* Grid Responsivo: 1 coluna no celular, 3 no PC */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* Área de Upload (2/3 da tela no PC) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/60 rounded-2xl p-1 shadow-2xl">
                  <FileUpload onAnalyze={handleAnalyze} loading={loading} />
                </div>

                {/* Resultado da IA */}
                {analysis && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl animate-fade-in-up">
                    <h2 className="text-xl font-semibold text-blue-400 mb-6 flex items-center gap-2">
                      <span className="p-1.5 bg-blue-500/10 rounded-lg">⚖️</span> Análise Jurídica
                    </h2>
                    <div className="prose prose-invert max-w-none text-slate-300 space-y-4 text-justify">
                      <p className="whitespace-pre-wrap">{analysis.summary}</p>
                      
                      {analysis.riskScore !== undefined && (
                        <div className="mt-8 p-5 bg-slate-950/50 rounded-xl border border-slate-800">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-medium text-slate-400">Probabilidade de Êxito</span>
                              <span className="text-xl font-bold text-white">{analysis.riskScore}%</span>
                           </div>
                           <div className="w-full bg-slate-800 rounded-full h-3">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${analysis.riskScore > 70 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                                style={{ width: `${analysis.riskScore}%` }}
                              ></div>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Área Lateral (1/3 da tela no PC) */}
              <div className="space-y-6">
                 <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 h-fit sticky top-8">
                    <h3 className="font-semibold text-slate-200 mb-6">Painel Rápido</h3>
                    <div className="py-10 text-center border-2 border-dashed border-slate-800/50 rounded-xl bg-slate-950/30 text-slate-500 text-sm">
                      Histórico em breve
                    </div>
                 </div>
              </div>

            </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;