import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useDropzone } from 'react-dropzone';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import { UploadCloud, FileText, Zap, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar'; // <--- IMPORTAR A NOVA SIDEBAR

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (location.state && location.state.document) {
      setResult(location.state.document);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      alert("⚠️ Arquivo muito grande! Limite de 10MB.");
      return; 
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const { data } = await api.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.data); 
    } catch (error) {
      console.error("Erro na análise", error);
      // Tratamento de erro do Limite Gratuito
      const msg = error.response?.data?.message || "Erro ao processar documento.";
      alert(msg);
      if (error.response?.data?.code === 'LIMIT_REACHED') {
          navigate('/pricing');
      }
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] } 
  });

  // Dados para gráficos (placeholder se não houver resultado)
  const chartData = result ? {
    labels: ['Positivo', 'Negativo'],
    datasets: [{
      data: [
        result.keywords?.positive?.length || 0,
        result.keywords?.negative?.length || 0,
      ],
      backgroundColor: ['#10B981', '#EF4444'],
      borderWidth: 0,
    }]
  } : null;

  const riskScore = result?.riskAnalysis || 0;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-inter relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* SIDEBAR UNIFICADA */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto w-full">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-slate-400">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                Olá, Dr(a). {user?.lastName || 'Advogado'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 hidden md:block">
                Painel de Controle Inteligente
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {user?.isPro ? (
                <span className="hidden md:flex bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-4 py-2 rounded-full text-sm font-bold items-center gap-2">
                  👑 Enterprise
                </span>
             ) : (
                <button onClick={() => navigate('/pricing')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 transition">
                  💎 Fazer Upgrade ({user?.usageCount || 0}/3 Usos)
                </button>
             )}
          </div>
        </header>

        {/* UPLOAD BOX */}
        {!result ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-10 text-center animate-fade-in transition-colors duration-300">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 md:p-12 transition-all cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-slate-500'}`}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-5">
                <div className="bg-slate-100 dark:bg-slate-900 p-5 rounded-full text-blue-600 dark:text-blue-500"><UploadCloud size={32} /></div>
                <div>
                  <p className="text-lg font-medium text-slate-700 dark:text-white">Arraste sua Petição ou Documento aqui</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Suporta PDF & TXT (Max 10MB)</p>
                </div>
                <button className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition shadow-lg">
                  {loading ? "Analisando com IA..." : "Selecionar Arquivo"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // RESULTADOS (Resumo simplificado para caber na resposta, use o seu layout bonito aqui se preferir)
          <div className="animate-fade-in-up space-y-6 pb-10">
             <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{result.metadata?.filename || "Documento Analisado"}</h3>
                    <span className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold">Relatório Gerado</span>
                </div>
                <button onClick={() => setResult(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline">Nova Análise</button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h4 className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-lg mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                        <FileText size={20} className="text-blue-600 dark:text-blue-500"/> Análise Jurídica
                    </h4>
                    <div className="text-slate-600 dark:text-slate-300 prose prose-slate dark:prose-invert max-w-none">
                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                            {result.aiSummary || result.analysis}
                        </ReactMarkdown>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                        <h4 className="flex items-center justify-center gap-2 text-slate-800 dark:text-white font-bold mb-4">
                            <Zap size={18} className="text-yellow-500"/> Probabilidade de Êxito
                        </h4>
                        <span className="text-5xl font-bold text-slate-800 dark:text-white">{riskScore}%</span>
                    </div>
                    
                    {chartData && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                             <h4 className="text-slate-800 dark:text-white font-bold mb-4 text-center">Palavras-Chave</h4>
                             <div className="h-40 relative"><Doughnut data={chartData} options={{ maintainAspectRatio: false }} /></div>
                        </div>
                    )}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;