import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { analyzeDocument, getAnalysisResult } from '../services/api';
import { 
  FileText, UploadCloud, CheckCircle, AlertTriangle, Activity, 
  RefreshCw, LayoutDashboard, Briefcase, Gavel, CreditCard, 
  LogOut, Sun, Moon, User as UserIcon, Menu, X, Zap, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Estados
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [polling, setPolling] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // CRÉDITOS (Começa com o valor do usuário ou 5)
  const [credits, setCredits] = useState(user?.credits || 5);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysis(null);
      setPolling(false);
    }
  };

  // Atualização Automática do Resultado
  useEffect(() => {
    let interval;
    if (polling && analysis?.documentId) {
      interval = setInterval(async () => {
        try {
          const result = await getAnalysisResult(analysis.documentId);
          if (result.status === 'completed') {
            setAnalysis(result);
            setPolling(false);
            setLoading(false);
            toast.success("Análise concluída!", { icon: '⚖️' });
          } else if (result.status === 'failed') {
            setAnalysis({ ...result, status: 'failed' });
            setPolling(false);
            setLoading(false);
            toast.error("Erro na leitura do arquivo.");
          }
        } catch (error) { console.error(error); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [polling, analysis?.documentId]);

  const handleAnalyze = async () => {
    if (credits <= 0) {
      return toast.error("Seus créditos acabaram! Aguarde o próximo mês.", { icon: '🚫' });
    }
    if (!file) return toast.error('Selecione um arquivo.');
    
    setLoading(true);
    setAnalysis(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await analyzeDocument(formData);
      
      // ATUALIZA O CONTADOR COM O VALOR QUE O SERVIDOR DEVOLVEU
      if (res.remainingCredits !== undefined) {
        setCredits(res.remainingCredits);
      } else {
        // Fallback visual se o servidor não mandar
        setCredits(prev => prev - 1);
      }

      setAnalysis(res);
      setPolling(true);
      toast.success('Arquivo enviado! Descontamos 1 crédito.');
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || "Erro ao conectar.";
      toast.error(msg);
    }
  };

  // Funções de Navegação (Placeholder Funcional)
  const navigateTo = (page) => {
    toast(`Abrindo módulo: ${page}... (Em breve)`, { icon: '🚧' });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col z-30 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'hidden'}`}>
            <div className="bg-blue-600 p-1.5 rounded-lg"><Activity className="text-white w-5 h-5" /></div>
            <span className="text-xl font-black tracking-tight">LegalMind</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2">
          {/* CARTÃO DE CRÉDITOS FUNCIONAL */}
          {sidebarOpen && (
            <div className={`mb-6 mx-2 rounded-2xl p-5 text-white shadow-lg transition-all ${credits > 0 ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/20' : 'bg-gray-700'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase opacity-80">{credits > 0 ? 'Plano Ativo' : 'Limite Atingido'}</span>
                {credits > 0 ? <Zap size={16} className="text-yellow-300 fill-yellow-300" /> : <Lock size={16} className="text-gray-400" />}
              </div>
              <p className="text-3xl font-black">{credits}</p>
              <p className="text-sm opacity-90">análises restantes</p>
            </div>
          )}

          <button onClick={() => navigateTo('Dashboard')} className="flex items-center gap-4 w-full p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800">
            <LayoutDashboard size={22}/> {sidebarOpen && "Dashboard"}
          </button>
          <button onClick={() => navigateTo('Meus Casos')} className="flex items-center gap-4 w-full p-3.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition group">
            <Briefcase size={22} className="group-hover:text-blue-500"/> {sidebarOpen && "Meus Casos"}
          </button>
          <button onClick={() => navigateTo('Jurisprudência')} className="flex items-center gap-4 w-full p-3.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition group">
            <Gavel size={22} className="group-hover:text-blue-500"/> {sidebarOpen && "Jurisprudência"}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <button onClick={toggleTheme} className="flex items-center gap-4 w-full p-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {theme === 'dark' ? <><Sun size={20}/> {sidebarOpen && "Modo Claro"}</> : <><Moon size={20}/> {sidebarOpen && "Modo Escuro"}</>}
          </button>
          <button onClick={logout} className="flex items-center gap-4 w-full p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition font-bold">
            <LogOut size={20}/> {sidebarOpen && "Sair da Conta"}
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <header className="h-24 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Olá, {user?.firstName} 👋</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {credits > 0 ? 'Vamos acelerar seus processos hoje?' : 'Renove seus créditos para continuar.'}
            </p>
          </div>
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-700 shadow-sm">
            {user?.firstName?.charAt(0)}
          </div>
        </header>

        {/* CONTEÚDO */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">
            
            {/* UPLOAD */}
            <div className="lg:col-span-4 bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-fit">
              <h3 className="text-lg font-bold mb-6 dark:text-white">Nova Análise</h3>
              
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 transition relative bg-gray-50/50 dark:bg-gray-800/50 group cursor-pointer min-h-[200px] flex flex-col justify-center items-center">
                <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={credits <= 0} />
                <UploadCloud className={`w-14 h-14 mb-4 transition ${credits > 0 ? 'text-blue-500 group-hover:scale-110' : 'text-gray-400'}`} />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {file ? file.name : (credits > 0 ? "Clique ou arraste PDF" : "Créditos Esgotados")}
                </p>
                {credits > 0 && <p className="text-xs text-gray-400 mt-2">Suporta PDF e TXT</p>}
              </div>

              <button 
                onClick={handleAnalyze} 
                disabled={loading || !file || credits <= 0} 
                className={`w-full mt-6 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-3 shadow-lg 
                  ${credits > 0 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
              >
                {loading || polling 
                  ? <><RefreshCw className="animate-spin" /> Processando...</> 
                  : credits > 0 
                    ? <><Activity size={18} /> Analisar com IA</> 
                    : <><Lock size={18} /> Limite Atingido</>
                }
              </button>
            </div>

            {/* RESULTADOS */}
            <div className="lg:col-span-8">
              {!analysis ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 text-gray-400 border-dashed">
                  <FileText size={64} className="mb-6 opacity-10" />
                  <p className="text-lg font-medium">O resultado aparecerá aqui.</p>
                </div>
              ) : analysis.status === 'pending' ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 animate-pulse">
                  <RefreshCw size={56} className="text-blue-500 animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400">A IA está trabalhando...</h3>
                  <p className="text-blue-600/60 dark:text-blue-400/60 mt-2">Isso leva uns 15 a 30 segundos.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h3 className="font-bold text-xl flex items-center gap-2 mb-1 dark:text-white"><CheckCircle className="text-green-500"/> Análise Concluída</h3>
                        <p className="text-sm text-gray-400">{analysis.filename}</p>
                    </div>
                    <div className="text-center">
                        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score</span>
                        <div className={`text-white px-5 py-2 rounded-xl font-black text-xl shadow-lg 
                          ${(analysis.analysis?.score || 0) > 70 ? 'bg-green-500 shadow-green-500/30' : (analysis.analysis?.score || 0) < 40 ? 'bg-red-500 shadow-red-500/30' : 'bg-yellow-500 shadow-yellow-500/30'}`}>
                          {analysis.analysis?.score || 0}
                        </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <h4 className="text-xs font-black text-gray-400 uppercase mb-3 tracking-widest">Resumo Executivo</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{analysis.analysis?.summary}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-black text-orange-500 uppercase mb-4 flex items-center gap-2"><AlertTriangle size={16}/> Riscos</h4>
                        <ul className="space-y-3">{analysis.analysis?.keyRisks?.map((r, i) => <li key={i} className="text-xs flex gap-3 text-gray-600 dark:text-gray-400 leading-relaxed bg-orange-50/50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/20"><span className="text-orange-500 font-bold">•</span>{r}</li>)}</ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-blue-500 uppercase mb-4 flex items-center gap-2"><CheckCircle size={16}/> Sugestões</h4>
                        <ul className="space-y-3">{analysis.analysis?.recommendations?.map((r, i) => <li key={i} className="text-xs flex gap-3 text-gray-600 dark:text-gray-400 leading-relaxed bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/20"><span className="text-blue-500 font-bold">✓</span>{r}</li>)}</ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;