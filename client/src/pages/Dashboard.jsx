import React, { useState } from 'react';
import Layout from '../components/Layout';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument } from '../services/api';
import { Loader2, FileText, CheckCircle2, Zap, BrainCircuit, Clock } from 'lucide-react'; // 📍 Adicionei Clock
import toast from 'react-hot-toast';
import OnboardingModal from '../components/OnboardingModal';
import { useNavigate } from 'react-router-dom'; // 📍 Para redirecionar
import posthog from 'posthog-js';

const Dashboard = () => {
  const { user } = useAuth(); // refreshUser se necessário
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async (file) => {
    setLoading(true);
    setAnalysis(null);

    // 📍 RASTREAR EVENTO
    posthog.capture('document_analysis_started', {
        file_type: file.type,
        file_size: file.size,
        is_pro: user?.isPro
    });
    
    const toastId = toast.loading('Enviando para a fila de processamento...');

    try {
      const formData = new FormData();
      formData.append('file', file); 

      const response = await analyzeDocument(formData);
      
      // Tratamento da resposta (Pode ser direta ou objeto axios)
      const data = response.data || response;

      // 📍 LÓGICA DA FASE 3: Verifica se foi para a Fila
      if (response.status === 202 || data.status === 'processing') {
        toast.success('Recebido! A IA está processando.', { id: toastId });
        
        // Criamos um estado visual de "Processando"
        setAnalysis({
            processing: true,
            summary: "Seu documento está na fila de análise da Inteligência Artificial.\n\nVocê será notificado pelo sininho e por e-mail assim que o veredito estiver pronto.",
            verdict: "Em andamento..."
        });
      } else {
        // Fallback (caso o backend responda direto algum dia)
        setAnalysis(data);
        toast.success('Análise concluída!', { id: toastId });
      }

    } catch (error) {
      console.error("Erro Dashboard:", error);
      const msg = error.response?.data?.message || "Falha na conexão.";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {user && !user.hasOnboarded && (
        <OnboardingModal onComplete={() => window.location.reload()} /> 
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* CABEÇALHO */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Olá, {user?.firstName || 'Doutor(a)'}
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Pronto para analisar seus processos hoje?
            </p>
          </div>
          
          {!user?.isPro && (
             <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-lg text-sm font-medium border border-amber-200 dark:border-amber-800 flex items-center gap-2">
               <Zap size={16} /> Restam {3 - (user?.usageCount || 0)} análises gratuitas
             </div>
          )}
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Upload */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                   <FileText size={24} />
                 </div>
                 <div>
                   <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nova Análise</h2>
                   <p className="text-sm text-slate-500 dark:text-slate-400">Suporta PDF e TXT (Max 5MB)</p>
                 </div>
               </div>
               <FileUpload onFileUpload={handleAnalyze} isLoading={loading} />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center animate-pulse">
                 <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                 </div>
                 <h3 className="text-lg font-medium text-slate-900 dark:text-white">Enviando para o Servidor...</h3>
              </div>
            )}

            {/* Resultado / Status */}
            {analysis && (
               <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                  
                  {/* 📍 CABEÇALHO CONDICIONAL (Azul para Processando, Verde para Pronto) */}
                  {analysis.processing ? (
                     <div className="bg-blue-50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30 p-4 px-6 flex items-center gap-3">
                        <Clock className="text-blue-600 dark:text-blue-400 animate-pulse" size={24} />
                        <h2 className="font-bold text-blue-800 dark:text-blue-400">Análise em Andamento</h2>
                     </div>
                  ) : (
                     <div className="bg-green-50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/30 p-4 px-6 flex items-center gap-3">
                        <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
                        <h2 className="font-bold text-green-800 dark:text-green-400">Análise Concluída</h2>
                     </div>
                  )}
                  
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Scores (Só mostra se NÃO estiver processando) */}
                    {!analysis.processing && analysis.riskScore !== undefined && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <span className="text-xs text-slate-500 uppercase font-bold">Risco</span>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{analysis.riskScore}%</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <span className="text-xs text-slate-500 uppercase font-bold">Veredito</span>
                                <p className="text-xl font-bold text-slate-800 dark:text-white truncate">{analysis.verdict || 'N/A'}</p>
                            </div>
                        </div>
                    )}

                    <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">Status</h3>
                      <div className="whitespace-pre-line p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                        {typeof analysis.summary === 'string' ? analysis.summary : JSON.stringify(analysis, null, 2)}
                      </div>
                    </div>

                    {/* Botão para ver histórico se estiver processando */}
                    {analysis.processing && (
                        <div className="flex justify-center mt-4">
                            <button 
                                onClick={() => navigate('/history')}
                                className="text-blue-600 hover:underline text-sm font-medium"
                            >
                                Acompanhar em "Meus Casos"
                            </button>
                        </div>
                    )}

                  </div>
               </div>
            )}
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
               <div className="flex items-center gap-2 mb-4">
                 <BrainCircuit size={18} className="text-purple-500" />
                 <h3 className="font-bold text-slate-800 dark:text-white text-sm">IA Rápida</h3>
               </div>
               <textarea 
                  className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  placeholder="Cole um texto aqui..."
               ></textarea>
               <button className="mt-3 w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide">
                  Processar
               </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;