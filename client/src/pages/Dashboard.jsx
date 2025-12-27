import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument } from '../services/api'; // Importa do arquivo acima
import { Loader2, Scale } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (file) => {
    setLoading(true);
    setAnalysis(null);
    try {
      // Cria o envelope que o Multer exige
      const formData = new FormData();
      formData.append('file', file); // O nome TEM que ser 'file'

      const response = await analyzeDocument(formData);
      // Garante que pegamos os dados, venham eles diretos ou aninhados
      setAnalysis(response.data || response);
    } catch (error) {
      console.error("Erro no Dashboard:", error);
      alert("Erro: " + (error.response?.data?.message || "Falha ao conectar com o servidor"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative h-screen overflow-y-auto transition-all">
        {/* Espaço para menu mobile não tapar o conteúdo */}
        <div className="md:hidden h-16 w-full shrink-0 bg-slate-950/50 backdrop-blur-md border-b border-slate-800"></div>

        <div className="p-4 md:p-10 max-w-6xl mx-auto w-full space-y-8 pb-20">
          <header className="animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Olá, Dr(a). {user?.firstName || 'Advogado'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Painel de Inteligência Jurídica</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-2xl">
                {/* AQUI: Usamos onFileUpload porque é isso que seu componente pede */}
                <FileUpload onFileUpload={handleAnalyze} isLoading={loading} />
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-2xl border border-slate-800 border-dashed animate-pulse">
                  <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                  <p className="text-slate-300 font-medium">Lendo documento e analisando jurisprudência...</p>
                </div>
              )}

              {analysis && !loading && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl animate-fade-in-up">
                  <h2 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                    <Scale size={20} /> Resultado da Análise
                  </h2>
                  <div className="space-y-6 text-slate-300">
                    <p className="whitespace-pre-wrap bg-slate-950/50 p-4 rounded-xl border border-slate-800 leading-relaxed text-justify">
                      {analysis.aiSummary || analysis.summary}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase">Probabilidade de Êxito</p>
                        <p className="text-3xl font-bold text-white mt-1">
                          {analysis.riskAnalysis || analysis.riskScore || 0}%
                        </p>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase">Veredito da IA</p>
                        <p className={`text-lg font-bold mt-2 ${
                          (analysis.verdict === 'Favorable' || analysis.verdict === 'Favorável') ? 'text-green-400' : 
                          (analysis.verdict === 'Unfavorable' || analysis.verdict === 'Desfavorável') ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {analysis.verdict || 'Análise Neutra'}
                        </p>
                      </div>
                    </div>

                    {analysis.strategicAdvice && (
                      <div className="mt-4 p-4 border-l-4 border-blue-500 bg-blue-500/5">
                        <p className="text-sm italic text-slate-300">"{analysis.strategicAdvice}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Direita (Info) */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-6">
                <h3 className="font-bold text-white mb-4">Como funciona?</h3>
                <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                  <li>A IA lê PDFs e imagens de texto.</li>
                  <li>Identifica pedidos e causa de pedir.</li>
                  <li>Cruza com padrões jurídicos gerais.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;