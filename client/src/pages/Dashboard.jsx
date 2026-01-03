import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { analyzeDocument, getAnalysisResult } from '../services/api';
import { 
  FileText, UploadCloud, CheckCircle, AlertTriangle, Activity, 
  RefreshCw, LayoutDashboard, Briefcase, Gavel, CreditCard, 
  LogOut, Sun, Moon, User as UserIcon, Clock, ChevronRight, Menu, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [polling, setPolling] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Controle da barra lateral

  // --- LOGICA DE ATUALIZAÇÃO ---
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
            toast.success("Análise concluída!");
          } else if (result.status === 'failed' || result.status === 'error') {
            setPolling(false);
            setLoading(false);
            toast.error("A IA falhou neste arquivo.");
          }
        } catch (error) { console.error("Erro no polling:", error); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [polling, analysis?.documentId]);

  const handleAnalyze = async () => {
    if (!file) return toast.error('Selecione um arquivo.');
    setLoading(true);
    setAnalysis(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await analyzeDocument(formData);
      setAnalysis(res);
      setPolling(true);
      toast.success('Enviado com sucesso!');
    } catch (error) {
      setLoading(false);
      toast.error("Erro ao falar com o servidor.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      
      {/* 1. SIDEBAR - COM Z-INDEX CORRIGIDO */}
      <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col z-30 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'hidden'}`}>
            <div className="bg-blue-600 p-1.5 rounded-lg"><Activity className="text-white w-5 h-5" /></div>
            <span className="text-xl font-black dark:text-white">LegalMind</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg dark:text-gray-400">
            {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button className="flex items-center gap-4 w-full p-3.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-bold">
            <LayoutDashboard size={22}/> {sidebarOpen && "Dashboard"}
          </button>
          
          {/* Botões com feedback visual ao clicar */}
          <button onClick={() => toast("Em breve: Meus Casos")} className="flex items-center gap-4 w-full p-3.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition group">
            <Briefcase size={22} className="group-hover:text-blue-500"/> {sidebarOpen && "Meus Casos"}
          </button>
          
          <button onClick={() => toast("Em breve: Jurisprudência")} className="flex items-center gap-4 w-full p-3.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition group">
            <Gavel size={22} className="group-hover:text-blue-500"/> {sidebarOpen && "Jurisprudência"}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <button onClick={toggleTheme} className="flex items-center gap-4 w-full p-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {theme === 'dark' ? <><Sun size={20}/> {sidebarOpen && "Modo Claro"}</> : <><Moon size={20}/> {sidebarOpen && "Modo Escuro"}</>}
          </button>
          <button onClick={logout} className="flex items-center gap-4 w-full p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition font-bold">
            <LogOut size={20}/> {sidebarOpen && "Sair"}
          </button>
        </div>
      </aside>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 z-20">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg">Área de Análise</h2>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold dark:text-white leading-none">{user?.firstName}</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">Plano Free</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center text-white font-bold">
              {user?.firstName?.charAt(0)}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-8">
            
            {/* CARD UPLOAD - Z-INDEX CORRIGIDO */}
            <div className="lg:col-span-4 bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col">
              <h3 className="text-lg font-bold mb-6 dark:text-white">Analisar Documento</h3>
              
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 transition relative bg-gray-50/50 dark:bg-gray-800/50 flex-1 flex flex-col justify-center min-h-[200px]">
                <input 
                  type="file" 
                  accept=".pdf,.txt" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {file ? file.name : "Clique ou arraste um PDF"}
                </p>
                <p className="text-xs text-gray-400 mt-2">Formatos aceitos: PDF e TXT</p>
              </div>

              <button 
                onClick={handleAnalyze} 
                disabled={loading || !file} 
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 disabled:opacity-50 z-20"
              >
                {loading || polling ? <><RefreshCw className="animate-spin" /> Processando...</> : <><Activity size={18} /> Iniciar IA</>}
              </button>
            </div>

            {/* CARD RESULTADOS */}
            <div className="lg:col-span-8">
              {!analysis ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 text-gray-300">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-full mb-4">
                    <FileText size={40} className="opacity-20" />
                  </div>
                  <p className="font-bold text-gray-400">Aguardando seu documento...</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in duration-500">
                  {/* ... Cabeçalho de Resultado ... */}
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-bold dark:text-white flex items-center gap-2"><CheckCircle className="text-green-500"/> Análise Concluída</h3>
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black">{analysis.analysis?.score || 0}/100</div>
                  </div>
                  
                  {/* ... Corpo do Resultado ... */}
                  <div className="p-8 space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Resumo Jurídico</h4>
                      <p className="dark:text-gray-300 text-sm leading-relaxed">{analysis.analysis?.summary}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-orange-500 uppercase flex items-center gap-2"><AlertTriangle size={16}/> Riscos Identificados</h4>
                        <div className="space-y-2">
                           {analysis.analysis?.keyRisks?.map((r, i) => (
                             <div key={i} className="text-xs p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20 dark:text-gray-300 flex gap-2">
                               <span className="text-orange-500">•</span> {r}
                             </div>
                           ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-blue-500 uppercase flex items-center gap-2"><CheckCircle size={16}/> Sugestões de Ação</h4>
                        <div className="space-y-2">
                           {analysis.analysis?.recommendations?.map((r, i) => (
                             <div key={i} className="text-xs p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20 dark:text-gray-300 flex gap-2">
                               <span className="text-blue-500">✓</span> {r}
                             </div>
                           ))}
                        </div>
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