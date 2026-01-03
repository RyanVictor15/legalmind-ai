import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument, getAnalysisResult } from '../services/api'; // 📍 Importamos a nova função
import { FileText, UploadCloud, CheckCircle, AlertTriangle, Activity, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [polling, setPolling] = useState(false); // Controle do Polling

  // --- EFEITO DE POLLING (Auto-Update) ---
  useEffect(() => {
    let interval;
    if (polling && analysis?.documentId) {
      interval = setInterval(async () => {
        try {
          const result = await getAnalysisResult(analysis.documentId);
          console.log("Checando status...", result.status);

          if (result.status === 'completed') {
            setAnalysis(result); // Atualiza com o resultado final
            setPolling(false);   // Para de perguntar
            setLoading(false);
            toast.success("Análise Jurídica Concluída!");
          } else if (result.status === 'failed') {
            setPolling(false);
            setLoading(false);
            toast.error("Erro ao processar o arquivo.");
          }
          // Se for 'pending', continua rodando...
        } catch (error) {
          console.error("Erro no polling:", error);
        }
      }, 3000); // Pergunta a cada 3 segundos
    }
    return () => clearInterval(interval);
  }, [polling, analysis]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAnalysis(null); // Limpa análise anterior
  };

  const handleAnalyze = async () => {
    if (!file) return toast.error('Selecione um arquivo PDF ou TXT');

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      // 1. Envia o arquivo
      const initialResponse = await analyzeDocument(formData);
      
      // 2. Mostra estado inicial (Pending)
      setAnalysis(initialResponse);
      
      // 3. Inicia o Polling para buscar o resultado final
      setPolling(true); 
      toast.success('Arquivo enviado! Processando IA...');
      
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar documento.');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Olá, {user?.firstName} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400">Pronto para analisar seus processos hoje?</p>
      </header>

      {/* ÁREA DE UPLOAD */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <h2 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">Nova Análise</h2>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer relative">
            <input 
              type="file" 
              accept=".pdf,.txt" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {file ? file.name : "Clique ou arraste um PDF aqui"}
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !file}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <> <RefreshCw className="animate-spin w-5 h-5" /> Processando... </>
            ) : (
              <> <Activity className="w-5 h-5" /> Analisar com IA </>
            )}
          </button>
        </div>

        {/* ÁREA DE RESULTADO */}
        <div className="md:col-span-2">
          {!analysis && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl min-h-[300px]">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p>O resultado da análise aparecerá aqui.</p>
            </div>
          )}

          {/* ESTADO: PENDING / PROCESSANDO */}
          {analysis && analysis.status === 'pending' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800 text-center animate-pulse">
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">A IA está lendo seu documento...</h3>
              <p className="text-blue-600 dark:text-blue-400">Isso leva cerca de 10 a 20 segundos. Aguarde.</p>
            </div>
          )}

          {/* ESTADO: COMPLETED (MOSTRA O JSON BONITO) */}
          {analysis && analysis.status === 'completed' && analysis.analysis && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <CheckCircle className="text-green-500" /> Análise Concluída
                </h3>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                  Score: {analysis.analysis.score}/100
                </span>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Sentimento</h4>
                  <div className={`inline-block px-4 py-2 rounded-lg font-bold ${
                    analysis.analysis.sentiment === 'Favorável' ? 'bg-green-100 text-green-700' :
                    analysis.analysis.sentiment === 'Desfavorável' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {analysis.analysis.sentiment}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Resumo</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    {analysis.analysis.summary}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" /> Riscos
                    </h4>
                    <ul className="space-y-2">
                      {analysis.analysis.keyRisks?.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <span className="text-orange-500 mt-1">•</span> {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" /> Recomendações
                    </h4>
                    <ul className="space-y-2">
                      {analysis.analysis.recommendations?.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <span className="text-blue-500 mt-1">•</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;