import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- A CORREÇÃO ESTÁ NESTA FUNÇÃO ---
  const handleAnalyze = async (file) => {
    setLoading(true);
    setAnalysis(null);
    try {
      // 1. Criamos um objeto FormData (O "envelope" que o servidor entende)
      const formData = new FormData();
      
      // 2. Colocamos o arquivo dentro com o nome 'file' 
      // (Isso é OBRIGATÓRIO porque no backend está upload.single('file'))
      formData.append('file', file);

      // 3. Enviamos o envelope completo
      const result = await analyzeDocument(formData);
      
      setAnalysis(result);
    } catch (error) {
      console.error("Erro dashboard:", error);
      // Melhora a mensagem de erro para o usuário
      const msg = error.response?.data?.message || error.message || "Erro desconhecido";
      alert("Falha na análise: " + msg);
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
                  {/* Passamos a função corrigida aqui */}
                  <FileUpload onFileUpload={handleAnalyze} isLoading={loading} />
                </div>

                {/* Resultado da Análise */}
                {analysis && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl animate-fade-in-up">
                    <h2 className="text-xl font-semibold text-blue-400 mb-6 flex items-center gap-2">
                      <span className="p-1.5 bg-blue-500/10 rounded-lg">⚖️</span> 
                      Análise Jurídica
                    </h2>

                    <div className="prose prose-invert max-w-none text-slate-300 space-y-4 text-justify leading-relaxed">
                      {/* Resumo do Texto */}
                      <p className="whitespace-pre-wrap">{analysis.summary}</p>
                      
                      {/* Veredito e Conselho (Se houver) */}
                      {analysis.verdict && (
                        <div className="mt-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                          <strong className="text-white block mb-1">Veredito da IA:</strong>
                          <span className={
                            analysis.verdict === 'Favorable' ? 'text-green-400' : 
                            analysis.verdict === 'Unfavorable' ? 'text-red-400' : 'text-yellow-400'
                          }>
                            {analysis.verdict}
                          </span>
                        </div>
                      )}

                      {/* Probabilidade de Êxito */}
                      {analysis.riskScore !== undefined && (
                        <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-slate-400">Probabilidade de Êxito</span>
                              <span className="text-lg font-bold text-white">{analysis.riskScore}%</span>
                           </div>
                           <div className="w-full bg-slate-800 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full transition-all duration-1000 ${
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