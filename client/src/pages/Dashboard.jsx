import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { LogOut, FileText, BarChart2, Shield, UploadCloud, AlertCircle, User, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setUser(userInfo);
    } else {
      navigate('/');
    }

    if (location.state && location.state.document) {
      setResult(location.state.document);
      // Limpa o estado para não ficar recarregando se der F5
      window.history.replaceState({}, document.title);
    }
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('document', file);

    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('http://localhost:5000/api/analyze', formData, config);
      setResult(data);
    } catch (error) {
      console.error("Erro ao analisar", error);
      if (error.response?.data?.error === 'LIMIT_REACHED') {
         alert("Limite atingido! Faça upgrade.");
         navigate('/pricing');
      } else {
         alert("Erro ao processar documento.");
      }
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] } });

  // Dados do Gráfico de Sentimento (Baseado em palavras-chave)
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

  // Cor da Barra de Risco
  const getRiskColor = (score) => {
      if (score >= 70) return 'bg-green-500'; // Chance Alta
      if (score >= 40) return 'bg-yellow-500'; // Chance Média
      return 'bg-red-500'; // Chance Baixa
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-inter">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight">Legal<span className="text-blue-500">Mind</span> AI</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Edition</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
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
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition text-sm">
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 md:ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Olá, Dr(a). {user?.lastName || 'Advogado'}
            </h2>
            <p className="text-slate-500">
              Painel de Controle - {user?.firstName} {user?.lastName}
            </p>
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

        {!result ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="bg-blue-100 p-4 rounded-full text-blue-600"><UploadCloud size={32} /></div>
                <div>
                  <p className="text-lg font-medium text-slate-700">Arraste sua Petição ou Documento aqui</p>
                  <p className="text-sm text-slate-400 mt-1">Suporta PDF e TXT (Max 10MB)</p>
                </div>
                <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">{loading ? "Analisando..." : "Selecionar Arquivo"}</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-6">
             {/* HEADER DO RESULTADO */}
             <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{result.filename}</h3>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Relatório Gerado via IA</span>
                </div>
                <button onClick={() => setResult(null)} className="text-slate-500 hover:text-slate-800 text-sm underline">Nova Análise</button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUNA DA ESQUERDA: TEXTO E ESTRATÉGIA */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-blue-600">
                        <h4 className="flex items-center gap-2 text-slate-800 font-bold text-lg mb-3">
                            <FileText size={20} className="text-blue-600"/> Resumo Executivo
                        </h4>
                        <p className="text-slate-600 leading-relaxed text-justify mb-6">
                            {result.aiSummary || "Resumo indisponível."}
                        </p>
                        
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                            <h5 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase mb-2">
                                <AlertCircle size={14}/> Estratégia Sugerida
                            </h5>
                            <p className="text-sm text-amber-900 italic">
                                "{result.strategicAdvice || "Sem sugestões."}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* COLUNA DA DIREITA: GRÁFICOS E MÉTRICAS */}
                <div className="space-y-6">
                    
                    {/* NOVO: CARD DE PROBABILIDADE DE ÊXITO */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h4 className="flex items-center justify-center gap-2 text-slate-800 font-bold mb-4 text-center">
                            <Zap size={18} className="text-yellow-500"/> Probabilidade de Êxito
                        </h4>
                        
                        <div className="flex justify-center items-end gap-1 mb-2">
                            <span className="text-5xl font-bold text-slate-800">{result.riskAnalysis || 50}%</span>
                            <span className="text-sm text-slate-400 mb-1">de chance</span>
                        </div>

                        {/* BARRA DE PROGRESSO */}
                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${getRiskColor(result.riskAnalysis || 50)}`} 
                                style={{ width: `${result.riskAnalysis || 50}%` }}
                            ></div>
                        </div>
                        
                        <p className="text-xs text-center text-slate-400 mt-3">
                            Estimativa baseada em análise preditiva de jurisprudência.
                        </p>
                    </div>

                    {/* CARD DE SENTIMENTO */}
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
      </main>
    </div>
  );
};

export default Dashboard;