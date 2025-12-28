import React, { useState } from 'react';
// REMOVIDO: import Sidebar ... (O Layout cuida disso agora)
import Layout from '../components/Layout'; // <--- ADICIONADO
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument } from '../api'; // Ajuste o import se necessário, seu arquivo original usava '../services/api' ou '../api'
import { Loader2, History } from 'lucide-react';

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

      // Assumindo que analyzeDocument está importado corretamente
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
    // ENVOLVENDO TUDO NO LAYOUT (Responsividade Automática)
    <Layout>
      
      {/* Cabeçalho de Boas Vindas */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Olá, {user?.firstName || 'Doutor(a)'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Selecione um documento para análise jurídica com IA.
          </p>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda (2/3): Upload e Resultado */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Componente de Upload (Mantido Original) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
             <FileUpload onFileUpload={handleAnalyze} isLoading={loading} />
          </div>

          {/* Resultado da Análise (Mantido Lógica Original) */}
          {loading && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
               <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
               <p className="text-slate-600 dark:text-slate-300">Processando documento...</p>
            </div>
          )}

          {analysis && (
             <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-green-500/30 animate-fade-in-up">
                <h2 className="text-xl font-bold text-green-600 mb-4">Análise Concluída</h2>
                <div className="prose dark:prose-invert max-w-none">
                  {/* Exibindo resumo ou dados brutos conforme sua API retorna */}
                  <p>{analysis.summary || JSON.stringify(analysis)}</p>
                </div>
             </div>
          )}
        </div>

        {/* Coluna Direita (1/3): Sidebar de Ações Rápidas / Histórico */}
        <div className="space-y-6">
          
          {/* Card de Histórico Rápido */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <History size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Atividade Recente</p>
                <h3 className="text-lg font-bold">Ver Histórico</h3>
              </div>
            </div>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm font-semibold">
              Acessar lista completa
            </button>
          </div>

          {/* Área de Input Texto Rápido (Mantida do seu original) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
               <h3 className="font-bold text-slate-700 dark:text-slate-200">Análise Rápida (Texto)</h3>
             </div>
             <div className="p-4">
                <textarea 
                  className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-3 text-sm"
                  placeholder="Cole um trecho de jurisprudência aqui..."
                ></textarea>
                <button className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-2 rounded-lg font-medium text-sm transition-colors">
                  Analisar Texto
                </button>
             </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;