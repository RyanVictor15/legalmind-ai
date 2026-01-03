import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { analyzeDocument, getAnalysisResult } from '../services/api';
import { 
  FileText, UploadCloud, CheckCircle, AlertTriangle, Activity, 
  RefreshCw, LayoutDashboard, Briefcase, Gavel, CreditCard, 
  LogOut, Sun, Moon, User as UserIcon, Menu, X 
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

  // --- 1. FUNÇÃO QUE FALTAVA (Correção do Erro) ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysis(null); // Limpa análise anterior
      setPolling(false);
    }
  };

  // --- 2. LOGICA DE ATUALIZAÇÃO AUTOMÁTICA ---
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
            setAnalysis({ ...result, status: 'failed' });
            setPolling(false);
            setLoading(false);
            toast.error("A IA não conseguiu ler este arquivo.");
          }
        } catch (error) { 
          console.error("Erro no polling:", error); 
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [polling, analysis?.documentId]);

  // --- 3. ENVIAR PARA ANÁLISE ---
  const handleAnalyze = async () => {
    if (!file) return toast.error('Selecione um arquivo primeiro.');
    
    setLoading(true);
    setAnalysis(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await analyzeDocument(formData);
      setAnalysis(res);
      setPolling(true); // Começa a vigiar o status
      toast.success('Enviado! A IA está processando...');
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Erro ao conectar com o servidor.");
    }
  };

  // --- 4. RENDERIZAÇÃO (O Visual) ---
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans text-gray-900 dark:text-gray-100">
      
      {/* SIDEBAR (Menu Lateral) */}
      <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col z-30 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'hidden'}`}>
            <div className="bg-blue-600 p-1.5 rounded-lg"><Activity className="text-white w-5 h-5" /></div>
            <span className="text-xl font-black">LegalMind</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button className="flex items-center gap-4 w-full p-3.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-bold">
            <LayoutDashboard size={22}/> {sidebarOpen && "Dashboard"}
          </button>
          <button className="flex items-center gap-4 w-full p-3.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <Briefcase size={22}/> {sidebarOpen && "Meus Casos"}
          </button>
          <button className="flex items-center gap-4 w-full p-3.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <Gavel size={22}/> {sidebarOpen && "Jurisprudência"}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <button onClick={toggleTheme} className="flex items-center gap-4 w-full p-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {theme === 'dark' ? <><Sun size={20}/> {sidebarOpen && "Claro"}</> : <><Moon size={20}/> {sidebarOpen && "Escuro"}</>}
          </button>
          <button onClick={logout} className="flex items-center gap-4 w-full p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition font-bold">
            <LogOut size={20}/> {sidebarOpen && "Sair"}
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* HEADER (Topo) */}
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 z-20">
          <h2 className="font-bold text-lg">Área de Análise</h2>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold leading-none">{user?.firstName}</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">Free Plan</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-bold">
              <UserIcon size={20}/>
            </div>
          </div>
        </header>

        {/* CONTEÚDO (Cards) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">
            
            {/* CARD UPLOAD */}
            <div className="lg:col-span-4 bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-fit">
              <h3 className="text-lg font-bold mb-6">Novo Documento</h3>
              
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 transition relative bg-gray-50/50 dark:bg-gray-800/50 group cursor-pointer">
                <input 
                  type="file" 
                  accept=".pdf,.txt" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {file ? file.name : "Clique ou arraste PDF"}
                </p>
              </div>

              <button 
                onClick={handleAnalyze} 
                disabled={loading || !file} 
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading || polling ? <><RefreshCw className="animate-spin" /> Processando...</> : <><Activity size={18} /> Analisar Agora</>}
              </button>
            </div>

            {/* CARD RESULTADOS */}
            <div className="lg:col-span-8">
              {!analysis ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 text-gray-400">
                  <FileText size={48} className="mb-4 opacity-10" />
                  <p>Selecione um arquivo para ver a análise.</p>
                </div>
              ) : analysis.status === 'pending' ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 animate-pulse">
                  <RefreshCw size={48} className="text-blue-500 animate-spin mb-4" />
                  <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">A IA está lendo...</h3>
                  <p className="text-sm text-blue-600/60 dark:text-blue-400/60">Aguarde alguns segundos.</p>
                </div>
              ) : (
                /* RESULTADO FINAL */
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-bold flex items-center gap-2"><CheckCircle className="text-green-500"/> Análise Completa</h3>
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl font-black">{analysis.analysis?.score || 0}/100</div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3">Resumo</h4>
                      <p className="text-sm leading-relaxed">{analysis.analysis?.summary}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xs font-black text-orange-500 uppercase mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Riscos</h4>
                        <ul className="space-y-2">{analysis.analysis?.keyRisks?.map((r, i) => <li key={i} className="text-xs flex gap-2"><span className="text-orange-500">•</span>{r}</li>)}</ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-blue-500 uppercase mb-3 flex items-center gap-2"><CheckCircle size={14}/> Sugestões</h4>
                        <ul className="space-y-2">{analysis.analysis?.recommendations?.map((r, i) => <li key={i} className="text-xs flex gap-2"><span className="text-blue-500">•</span>{r}</li>)}</ul>
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