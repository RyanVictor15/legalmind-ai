import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument, getAnalysisResult } from '../services/api';
import { FileText, UploadCloud, CheckCircle, AlertTriangle, Activity, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // Estado de envio inicial
  const [analysis, setAnalysis] = useState(null); // Objeto da análise completa
  const [polling, setPolling] = useState(false);  // Controle do "Loop de Pergunta"

  // --- 1. POLLING: O "Espião" que pergunta pro servidor se acabou ---
  useEffect(() => {
    let interval;
    
    // Só roda se o polling estiver ligado e tivermos um ID de documento
    if (polling && analysis?.documentId) {
      interval = setInterval(async () => {
        try {
          console.log("🔍 Verificando status da análise...");
          const result = await getAnalysisResult(analysis.documentId);

          if (result.status === 'completed') {
            // SUCESSO: A IA terminou!
            setAnalysis(result); 
            setPolling(false);   // Para o loop
            setLoading(false);
            toast.success("Análise concluída com sucesso!", { duration: 5000 });
          } 
          else if (result.status === 'failed' || result.status === 'error') {
            // ERRO: A IA falhou
            setAnalysis({ ...result, status: 'failed' });
            setPolling(false); // Para o loop
            setLoading(false);
            toast.error("A IA não conseguiu ler este arquivo.");
          }
          // Se for 'pending', não faz nada e espera o próximo ciclo (3s)
          
        } catch (error) {
          console.error("Erro no polling:", error);
          // Não paramos o polling por erro de rede temporário, tentamos de novo
        }
      }, 3000); // Pergunta a cada 3 segundos
    }

    // Limpa o relógio quando o componente desmonta ou o polling para
    return () => clearInterval(interval);
  }, [polling, analysis?.documentId]);

  // --- 2. HANDLERS ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysis(null); // Reseta a tela anterior
      setPolling(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return toast.error('Por favor, selecione um arquivo.');

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true); // Ativa spinner do botão
    setAnalysis(null); // Limpa tela

    try {
      // 1. Envia o arquivo (Upload)
      const initialResponse = await analyzeDocument(formData);
      
      // 2. Servidor devolve: { message: "Recebido", documentId: "123", status: "pending" }
      setAnalysis(initialResponse);
      
      // 3. Ativa o Polling para começar a vigiar o status
      setPolling(true); 
      toast.success('Arquivo enviado! A IA está analisando...');
      
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar o arquivo. Tente novamente.');
      setLoading(false);
    }
  };

  // --- 3. RENDERIZAÇÃO (O que aparece na tela) ---
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Olá, {user?.firstName || 'Doutor(a)'} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Vamos analisar juridicamente seus documentos hoje?
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* === COLUNA DA ESQUERDA: UPLOAD === */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <UploadCloud className="w-5 h-5" /> Nova Análise
            </h2>
            
            {/* Área de Drop */}
            <div className="border-2 border-dashed border-blue-200 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-blue-50 dark:hover:bg-gray-700/50 transition cursor-pointer relative group">
              <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <FileText className={`w-12 h-12 mb-3 transition ${file ? 'text-blue-600' : 'text-gray-300 group-hover:text-blue-400'}`} />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                  {file ? file.name : "Clique para selecionar PDF"}
                </p>
                {!file && <p className="text-xs text-gray-400 mt-1">Máx 10MB</p>}
              </div>
            </div>

            {/* Botão de Ação */}
            <button
              onClick={handleAnalyze}
              disabled={loading || polling || !file}
              className={`w-full mt-4 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 text-white shadow-lg
                ${(loading || polling) 
                  ? 'bg-blue-400 cursor-wait' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-95'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {(loading || polling) ? (
                <> <RefreshCw className="animate-spin w-5 h-5" /> Processando... </>
              ) : (
                <> <Activity className="w-5 h-5" /> Analisar com IA </>
              )}
            </button>
          </div>
        </div>

        {/* === COLUNA DA DIREITA: RESULTADOS === */}
        <div className="md:col-span-2">
          
          {/* 1. Estado Vazio (Nenhuma análise) */}
          {!analysis && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl min-h-[400px] bg-gray-50/50 dark:bg-gray-800/30">
              <Activity className="w-16 h-16 mb-4 opacity-10" />
              <p>O resultado da análise detalhada aparecerá aqui.</p>
            </div>
          )}

          {/* 2. Estado Carregando (Polling Ativo) */}
          {analysis && analysis.status === 'pending' && (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-blue-50 dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 animate-pulse">
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">A IA está lendo o documento...</h3>
              <p className="text-blue-600 dark:text-blue-400 mt-2 text-center max-w-md">
                Isso geralmente leva de 10 a 20 segundos. Estamos identificando riscos, extraindo dados e gerando recomendações.
              </p>
            </div>
          )}

          {/* 3. Estado Erro */}
          {analysis && analysis.status === 'failed' && (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-bold text-red-700">Falha na Análise</h3>
              <p className="text-red-600 mt-1">Não foi possível processar este arquivo. Tente um PDF mais simples.</p>
            </div>
          )}

          {/* 4. Estado Sucesso (Resultado Final) */}
          {analysis && analysis.status === 'completed' && analysis.analysis && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animation-fade-in">
              
              {/* Cabeçalho do Resultado */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <CheckCircle className="text-green-500 w-6 h-6" /> Análise Jurídica
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{analysis.filename}</p>
                </div>
                
                {/* Score Badge */}
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                   <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold">Viabilidade</p>
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {analysis.analysis.score || 0}/100
                      </span>
                   </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8 space-y-8">
                
                {/* Sentimento e Resumo */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Parecer Geral</h4>
                    <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold border ${
                      analysis.analysis.sentiment === 'Favorável' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : analysis.analysis.sentiment === 'Desfavorável' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {analysis.analysis.sentiment || 'Neutro'}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resumo Executivo</h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      {analysis.analysis.summary || "Sem resumo disponível."}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-gray-700" />

                {/* Riscos e Recomendações */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Riscos */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" /> Pontos de Atenção
                    </h4>
                    <ul className="space-y-3">
                      {analysis.analysis.keyRisks?.length > 0 ? (
                        analysis.analysis.keyRisks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-3 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/20">
                            <span className="text-orange-500 font-bold mt-0.5">•</span> 
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{risk}</span>
                          </li>
                        ))
                      ) : (
                        <p className="text-gray-400 italic text-sm">Nenhum risco crítico identificado.</p>
                      )}
                    </ul>
                  </div>

                  {/* Recomendações */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-500" /> Estratégia Sugerida
                    </h4>
                    <ul className="space-y-3">
                      {analysis.analysis.recommendations?.length > 0 ? (
                        analysis.analysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <span className="text-blue-500 font-bold mt-0.5">✓</span> 
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{rec}</span>
                          </li>
                        ))
                      ) : (
                        <p className="text-gray-400 italic text-sm">Sem recomendações específicas.</p>
                      )}
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