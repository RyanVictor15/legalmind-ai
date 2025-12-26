import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
// Certifique-se que você atualizou o api.js no passo anterior para ter essa função:
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
      console.error("Erro dashboard:", error);
      alert("Erro ao processar: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar Responsiva */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0 relative h-screen overflow-y-auto transition-all">
        
        {/* Espaçador Mobile */}
        <div className="md:hidden h-16 w-full shrink-0"></div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 pb-24">
            
            {/* Cabeçalho */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Olá, Dr(a). {user?.firstName || 'Advogado'}
                </h1>
                <p className="text-slate-400 text-sm">Painel Inteligente</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* Coluna Esquerda: Upload */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-1 shadow-2xl">
                  {/* --- A CORREÇÃO ESTÁ AQUI EMBAIXO --- */}
                  {/* Antes estava onAnalyze={handleAnalyze}, agora está onFileUpload */}
                  <FileUpload onFileUpload={handleAnalyze} isLoading={loading} />
                </div>

                {/* Resultado */}
                {analysis && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-blue-400 mb-4">⚖️ Análise Jurídica</h2>
                    <p className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed text-justify">
                      {analysis.summary}
                    </p>
                    
                    {/* Exibir Score se existir */}
                    {analysis.riskScore !== undefined && (
                        <div className="mt-4 p-4 bg-slate-950 rounded-lg">
                           <span className="text-sm text-slate-400">Probabilidade de Êxito: </span>
                           <span className="font-bold text-white">{analysis.riskScore}%</span>
                        </div>
                    )}
                  </div>
                )}
              </div>

              {/* Coluna Direita: Info */}
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