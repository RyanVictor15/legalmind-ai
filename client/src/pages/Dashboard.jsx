import React, { useState } from 'react';
import Layout from '../components/Layout';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument } from '../services/api';
import { Loader2, FileText, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (file) => {
    setLoading(true);
    setAnalysis(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await analyzeDocument(formData);
      setAnalysis(response.data || response);
    } catch (error) {
      console.error("Erro no Dashboard:", error);
      alert("Erro: " + (error.response?.data?.message || "Falha ao conectar com o servidor"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Container Centralizado - Resolve a sensação de "Desorganizado" */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Cabeçalho Simples */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Olá, {user?.firstName}. Comece uma nova análise abaixo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ÁREA PRINCIPAL (Upload e Resultado) - Ocupa mais espaço */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Card de Upload */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
               <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                 <FileText size={20} className="text-blue-500" />
                 Nova Análise de Documento
               </h2>
               <FileUpload onFileUpload={handleAnalyze} isLoading={loading} />
            </div>

            {/* Loading */}
            {loading && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center animate-pulse">
                 <Loader2 className="animate-spin mx-auto text-blue-600 mb-3" size={32} />
                 <p className="text-slate-600 dark:text-slate-300">A IA está lendo seu documento...</p>
              </div>
            )}

            {/* Resultado da Análise */}
            {analysis && (
               <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-md border border-green-500/50">
                  <div className="flex items-center gap-2 mb-4 text-green-600 dark:text-green-400">
                    <CheckCircle2 size={24} />
                    <h2 className="text-lg font-bold">Análise Concluída</h2>
                  </div>
                  
                  <div className="prose prose-slate dark:prose-invert max-w-none text-sm bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg">
                    {/* Exibe o resumo ou JSON se for objeto */}
                    <p className="whitespace-pre-line">
                      {typeof analysis.summary === 'string' ? analysis.summary : JSON.stringify(analysis, null, 2)}
                    </p>
                  </div>
               </div>
            )}
          </div>

          {/* SIDEBAR LATERAL (Widgets Rápidos) - Ocupa menos espaço */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Widget de Texto Rápido */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
               <h3 className="font-semibold text-slate-800 dark:text-white mb-3 text-sm">
                 Colar Texto Rápido
               </h3>
               <textarea 
                  className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-300 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Cole um parágrafo de jurisprudência..."
               ></textarea>
               <button className="mt-3 w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors">
                  Analisar Texto
               </button>
            </div>

            {/* Banner Pro (Opcional - Visual clean) */}
            {!user?.isPro && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg">
                <h3 className="font-bold mb-1">Seja Premium</h3>
                <p className="text-xs text-blue-100 mb-3 opacity-90">
                  Desbloqueie análises ilimitadas e IA mais rápida.
                </p>
                <button className="w-full bg-white text-blue-700 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition">
                  Ver Planos
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;