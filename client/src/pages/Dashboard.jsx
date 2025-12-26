import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (fileData) => {
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await analyzeDocument(fileData);
      setAnalysis(result);
    } catch (error) {
      console.error("Erro no dashboard:", error);
      alert("Erro ao processar: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* 1. SIDEBAR (Auto-gerenciavel) */}
      <Sidebar />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative transition-all duration-300">
        
        {/* MOBILE HEADER SPACER: Empurra conteúdo para baixo do botão Menu */}
        <div className="md:hidden h-16 w-full shrink-0 bg-slate-950/80 backdrop-blur-sm fixed top-0 left-0 z-30 border-b border-slate-800">
           {/* Opcional: Logo centralizado no mobile */}
           <div className="h-full flex items-center justify-center">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                LegalMind AI
              </span>
           </div>
        </div> 
        <div className="md:hidden h-16 w-full shrink-0"></div> {/* Espaçador físico */}

        <div className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8 pb-24">
            
            {/* HEADER DE BOAS-VINDAS */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Olá, Dr(a). {user?.firstName || 'Advogado'}
                </h1>
                <p className="text-slate-400 mt-1 text-sm md:text-base flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Sistema Operacional
                </p>
              </div>
              
              <div className="hidden md:block">
                 <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700 shadow-sm">
                    + Nova Pasta
                 </button>
              </div>
            </header>

            {/* GRID PRINCIPAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* ESQUERDA: Upload & Resultados (Ocupa 2/3 no desktop) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Área de Upload */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/60 rounded-2xl p-1 shadow-2xl ring-1 ring-white/5">
                  <FileUpload onAnalyze={handleAnalyze} loading={loading} />
                </div>

                {/* Card de Resultado (IA) */}
                {analysis && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden group animate-fade-in-up">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <h2 className="text-xl font-semibold text-blue-400 mb-6 flex items-center gap-2 relative z-10">
                      <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">⚖️</span> 
                      Análise Jurídica
                    </h2>

                    <div className="prose prose-invert prose-blue max-w-none text-slate-300 leading-relaxed space-y-4 relative z-10">
                      <p className="whitespace-pre-wrap text-sm md:text-base text-justify">
                        {analysis.summary}
                      </p>
                      
                      {/* Barra de Probabilidade */}
                      {analysis.riskScore !== undefined && (
                        <div className="mt-8 p-5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-medium text-slate-400">Probabilidade de Êxito</span>
                              <span className="text-xl font-bold text-white">{analysis.riskScore}%</span>
                           </div>
                           <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                  analysis.riskScore > 70 ? 'bg-emerald-500' : 
                                  analysis.riskScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${analysis.riskScore}%` }}
                              ></div>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* DIREITA: Estatísticas (Ocupa 1/3 no desktop, vai para baixo no mobile) */}
              <div className="space-y-6">
                 <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 h-fit sticky top-8 backdrop-blur-sm shadow-lg">
                    <h3 className="font-semibold text-slate-200 mb-6 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                      Painel Rápido
                    </h3>
                    
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 border-2 border-dashed border-slate-800/50 rounded-xl bg-slate-950/30">
                      <div className="p-4 bg-slate-800/50 rounded-full text-slate-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                      </div>
                      <span className="text-sm font-medium text-slate-500">
                        Histórico de casos<br/>será exibido aqui
                      </span>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800">
                       <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Dica Pro</h4>
                       <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-800/50">
                         💡 Para melhores resultados, envie petições completas em formato PDF ou TXT. A IA analisa melhor com contexto detalhado.
                       </p>
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