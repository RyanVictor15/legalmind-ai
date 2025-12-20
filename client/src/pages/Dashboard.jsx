import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../services/api'; // Usa a API centralizada (COM token)
import { LogOut, FileText, BarChart2, Shield, UploadCloud, AlertCircle, User, Zap, Menu, X, ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Usa o contexto de autenticação

// Registro dos Gráficos
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Pega dados do contexto global

  // Carrega dados se vier do Histórico
  useEffect(() => {
    if (location.state && location.state.document) {
      setResult(location.state.document);
      // Limpa o estado para não ficar recarregando se der F5
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Função de Upload
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    
    // Validação de Tamanho (10MB)
    const MAX_SIZE = 10 * 1024 * 1024; 
    if (file.size > MAX_SIZE) {
      alert("⚠️ Arquivo muito grande! O limite para análise é de 10MB.");
      return; 
    }

    const formData = new FormData();
    formData.append('document', file);

    setLoading(true);
    try {
      // Usa a API centralizada (Token injetado automaticamente)
      const { data } = await api.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(data);
    } catch (error) {
      console.error("Erro ao analisar", error);
      if (error.response?.data?.error === 'LIMIT_REACHED') {
         alert("Limite atingido! Faça upgrade.");
         navigate('/pricing');
      } else {
         const msg = error.response?.data?.message || "Erro ao processar documento.";
         alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] } });

  // Configuração dos Gráficos
  const chartData = result ? {
    labels: ['Positivo', 'Negativo', 'Neutro'],
    datasets: [{
      data: [
        result.keywords?.positive?.length || 0,
        result.keywords?.negative?.length || 0,
        Math.max(0, 10 - ((result.keywords?.positive?.length || 0) + (result.keywords?.negative?.length || 0)))
      ],
      backgroundColor: ['#10B981', '#EF4444', '#94A3B8'],
      borderWidth: 0,
    }]
  } : null;

  const getRiskColor = (score) => {
      if (score >= 70) return 'bg-green-500'; 
      if (score >= 40) return 'bg-yellow-500'; 
      return 'bg-red-500'; 
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-inter relative overflow-hidden">
      
      {/* OVERLAY PARA MOBILE */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR RESPONSIVA */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:flex flex-col h-screen
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Legal<span className="text-blue-500">Mind</span> AI</h1>
            <p className="text-xs text-slate-400 mt-1">Enterprise Edition</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="flex items-center gap-3 p-3 bg-blue-600 rounded-lg cursor-pointer transition shadow-lg shadow-blue-900/50">
            <BarChart2 size={20} /> <span className="font-medium">Dashboard</span>
          </div>
          
          <div onClick={() => navigate('/history')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <FileText size={20} /> <span>Meus Processos</span>
          </div>

          <div onClick={() => navigate('/jurisprudence')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <Shield size={20} /> <span>Jurisprudência</span>
          </div>

          <div onClick={() => navigate('/profile')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <User size={20} /> <span>Meu Perfil</span>
          </div>

          {/* BOTÃO ADMIN - SÓ APARECE SE FOR ADMIN */}
          {user?.isAdmin && (
            <div onClick={() => navigate('/admin')} className="flex items-center gap-3 p-3 text-red-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition mt-4 border-t border-slate-800 pt-4">
                <ShieldAlert size={20} /> <span>Painel Admin</span>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition text-sm w-full">
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto w-full">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Olá, Dr(a). {user?.lastName || 'Advogado'}
              </h2>
              <p className="text-sm text-slate-500 hidden md:block">
                Painel de Controle
              </p>
            </div>
          </div>
          
          <div className="hidden md:block">
             {user?.isPro ? (
                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  👑 Membro Enterprise
                </span>
             ) : (
                <button onClick={() => navigate('/pricing')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition">
                  💎 Fazer Upgrade
                </button>
             )}
          </div>
        </header>

        {/* ÁREA DE UPLOAD (Se não tiver resultado) */}
        {!result ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 text-center animate-fade-in">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 md:p-12 transition-all duration-300 cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="bg-blue-100 p-4 rounded-full text-blue-600"><UploadCloud size={32} /></div>
                <div>
                  <p className="text-lg font-medium text-slate-700">Arraste sua Petição ou Documento aqui</p>
                  <p className="text-sm text-slate-400 mt-1">Suporta PDF e TXT (Max 10MB)</p>
                </div>
                <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
                  {loading ? "Carregando..." : "Selecionar Arquivo"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-6 pb-10">
             {/* HEADER DO RESULTADO */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 break-all">{result.filename}</h3>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Relatório Gerado via IA</span>
                </div>
                <button onClick={() => setResult(null)} className="text-slate-500 hover:text-slate-800 text-sm underline whitespace-nowrap">Nova Análise</button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUNA ESQUERDA: TEXTO */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border-l-4 border-blue-600">
                        <h4 className="flex items-center gap-2 text-slate-800 font-bold text-lg mb-4 border-b pb-2">
                            <FileText size={20} className="text-blue-600"/> Análise Jurídica Detalhada
                        </h4>
                        
                        <div className="text-slate-600 leading-relaxed text-justify mb-6 prose prose-slate max-w-none">
                            <ReactMarkdown 
                              components={{
                                h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-slate-900" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 text-blue-700" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-semibold text-slate-800" {...props} />,
                              }}
                            >
                              {result.aiSummary || "Resumo indisponível."}
                            </ReactMarkdown>
                        </div>
                        
                        {result.strategicAdvice && result.strategicAdvice.length > 10 && (
                          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                              <h5 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase mb-2">
                                  <AlertCircle size={14}/> Nota Estratégica
                              </h5>
                              <p className="text-sm text-amber-900 italic">
                                  "{result.strategicAdvice}"
                              </p>
                          </div>
                        )}
                    </div>
                </div>

                {/* COLUNA DIREITA: GRÁFICOS */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h4 className="flex items-center justify-center gap-2 text-slate-800 font-bold mb-4 text-center">
                            <Zap size={18} className="text-yellow-500"/> Probabilidade de Êxito
                        </h4>
                        
                        <div className="flex justify-center items-end gap-1 mb-2">
                            <span className="text-5xl font-bold text-slate-800">{result.riskAnalysis || 50}%</span>
                            <span className="text-sm text-slate-400 mb-1">de chance</span>
                        </div>

                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${getRiskColor(result.riskAnalysis || 50)}`} 
                                style={{ width: `${result.riskAnalysis || 50}%` }}
                            ></div>
                        </div>
                        
                        <p className="text-xs text-center text-slate-400 mt-3">Estimativa baseada em IA.</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h4 className="text-slate-800 font-bold mb-4 text-center">Tom Emocional</h4>
                        <div className="h-48 relative">
                            <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
                        </div>
                        <div className="text-center mt-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                result.verdict === 'Favorável' ? 'bg-green-100 text-green-700' :
                                result.verdict === 'Desfavorável' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {result.verdict}
                            </span>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* FEEDBACK DE LOADING */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
               <div className="relative mb-4 mx-auto w-16 h-16">
                 <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Analisando Documento...</h3>
               <p className="text-slate-500 text-sm">Nossa IA está lendo cada cláusula.</p>
               <p className="text-slate-400 text-xs mt-4 animate-pulse">Isso pode levar até 30 segundos.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;