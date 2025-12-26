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
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* 1. SIDEBAR INTELIGENTE (Já configurada no passo anterior) */}
      <Sidebar />

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 relative">
        
        {/* ESPAÇADOR MOBILE: Empurra o conteúdo para baixo para não ficar atrás do botão de menu */}
        <div className="md:hidden h-16 w-full shrink-0"></div> 

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full space-y-8 pb-20">
            
            {/* CABEÇALHO (Boas-vindas) */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-down">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Olá, Dr(a). {user?.firstName || 'Advogado'}
                </h1>
                <p className="text-slate-400 mt-1 text-sm md:text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Painel de Controle Inteligente
                </p>
              </div>
              
              {/* Botão de Ação Rápida (Exemplo) */}
              <div className="hidden md:block">
                 <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700">
                    + Nova Pasta
                 </button>
              </div>
            </header>

            {/* GRID PRINCIPAL: 
                - Mobile: 1 coluna (tudo empilhado)
                - Desktop (lg): 3 colunas (Upload na esq, Gráficos na dir) 
            */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* COLUNA ESQUERDA (Upload & Resultados) - Ocupa 2/3 no Desktop */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Card de Upload */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-1 shadow-2xl ring-1 ring-white/5">
                  <FileUpload onAnalyze={handleAnalyze} loading={loading} />
                </div>

                {/* Resultado da Análise (Só aparece se tiver análise) */}
                {analysis && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl animate-fade-in-up relative overflow-hidden group">
                    {/* Efeito de brilho no fundo */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <h2 className="text-xl font-semibold text-blue-400 mb-6 flex items-center gap-2 relative z-10">
                      <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                        ⚖️
                      </span> 
                      Análise Jurídica
                    </h2>

                    {/* Conteúdo do Texto */}
                    <div className="prose prose-invert prose-blue max-w-none text-slate-300 leading-relaxed space-y-4">
                      {/* Renderização segura do resumo */}
                      <p className="whitespace-pre-wrap text-sm md:text-base text-justify">
                        {analysis.summary}
                      </p>
                      
                      {/* Exibição da Probabilidade (Se existir) */}
                      {analysis.riskScore !== undefined && (
                        <div className="mt-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-slate-400">Probabilidade de Êxito</span>
                              <span className="text-lg font-bold text-white">{analysis.riskScore}%</span>
                           </div>
                           <div className="w-full bg-slate-800 rounded-full h-2.5">
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-emerald-500 h-2.5 rounded-full transition-all duration-1000" 
                                style={{ width: `${analysis.riskScore}%` }}
                              ></div>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* COLUNA DIREITA (Widgets/Gráficos) - Ocupa 1/3 no Desktop */}
              <div className="space-y-6">
                 
                 {/* Exemplo de Widget Fixo */}
                 <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 h-fit sticky top-8 backdrop-blur-sm">
                    <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                      Estatísticas
                    </h3>
                    
                    {/* Placeholder para gráfico futuro */}
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                      <div className="p-3 bg-slate-800 rounded-full text-slate-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                      </div>
                      <span className="text-sm text-slate-500">Histórico em breve</span>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800">
                       <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Dica Rápida</h4>
                       <p className="text-xs text-slate-400 leading-relaxed">
                         Arraste arquivos PDF ou TXT diretamente para a área de upload para economizar tempo.
                       </p>
                    </div>
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