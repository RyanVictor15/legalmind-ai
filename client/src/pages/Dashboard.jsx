import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument } from '../services/api';
import { Loader2 } from 'lucide-react'; // Ícone de carregamento

const Dashboard = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Função que conecta o Componente de Upload com a API
  const handleAnalyze = async (file) => {
    if (!file) return;

    setLoading(true);
    setAnalysis(null);

    try {
      // 1. Criar o envelope FormData (Essencial para não dar Erro 500)
      const formData = new FormData();
      formData.append('file', file); 

      // 2. Enviar para o Backend
      const response = await analyzeDocument(formData);
      
      // 3. O Backend retorna { status: 'success', data: { ... } }
      // Precisamos pegar o objeto 'data' de dentro da resposta
      if (response.data) {
        setAnalysis(response.data);
      } else {
        setAnalysis(response); // Fallback caso a estrutura mude
      }

    } catch (error) {
      console.error("Erro fatal no dashboard:", error);
      const msg = error.response?.data?.message || "Erro de conexão com o servidor.";
      alert(`Falha na análise: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar Inteligente (Mobile e Desktop) */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0 relative h-screen overflow-y-auto transition-all">
        
        {/* Espaçador para o topo do celular */}
        <div className="md:hidden h-16 w-full shrink-0"></div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 pb-24">
            
            {/* Cabeçalho */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Olá, Dr(a). {user?.firstName || 'Advogado'}
                </h1>
                <p className="text-slate-400 text-sm">Painel de Controle Inteligente</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* Coluna Principal: Upload e Resultados */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-1 shadow-2xl">
                  {/* CORREÇÃO CRÍTICA: O nome da prop é onFileUpload */}
                  <FileUpload onFileUpload={handleAnalyze} isLoading={loading} />
                </div>

                {/* Loading State Visual */}
                {loading && (
                  <div className="text-center py-10 bg-slate-900 rounded-2xl border border-slate-800 border-dashed animate-pulse">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-slate-400">A Inteligência Artificial está lendo seu documento...</p>
                  </div>
                )}

                {/* Exibição do Resultado */}
                {analysis && !loading && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl animate-fade-in-up">
                    <h2 className="text-xl font-semibold text-blue-400 mb-6 flex items-center gap-2">
                      <span className="p-1.5 bg-blue-500/10 rounded-lg">⚖️</span> 
                      Análise Jurídica Concluída
                    </h2>

                    <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-justify leading-relaxed">
                      
                      {/* Resumo */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Resumo do Caso</h3>
                        <p className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                          {analysis.aiSummary || analysis.summary}
                        </p>
                      </div>

                      {/* Veredito e Risco */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                           <span className="text-xs font-bold text-slate-500 uppercase">Probabilidade de Êxito</span>
                           <div className="flex items-baseline gap-2 mt-1">
                             <span className="text-2xl font-bold text-white">
                               {analysis.riskAnalysis || analysis.riskScore || 0}%
                             </span>
                           </div>
                           <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-emerald-400 h-1.5 rounded-full" 
                                style={{ width: `${analysis.riskAnalysis || analysis.riskScore || 0}%` }}
                              ></div>
                           </div>
                        </div>

                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                           <span className="text-xs font-bold text-slate-500 uppercase">Veredito IA</span>
                           <div className="mt-1 font-bold text-lg text-white">
                             {analysis.verdict === 'Favorable' ? '🟢 Favorável' : 
                              analysis.verdict === 'Unfavorable' ? '🔴 Desfavorável' : '🟡 Neutro/Incerto'}
                           </div>
                        </div>
                      </div>

                      {/* Conselho Estratégico */}
                      {analysis.strategicAdvice && (
                        <div>
                          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Conselho Estratégico</h3>
                          <p className="text-slate-300 italic border-l-4 border-blue-500 pl-4">
                            "{analysis.strategicAdvice}"
                          </p>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>

              {/* Coluna Lateral */}
              <div className="space-y-6">
                 <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sticky top-8">
                    <h3 className="font-semibold text-slate-200 mb-4">Painel Rápido</h3>
                    <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
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