import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { analyzeDocument, getAnalysisResult } from '../services/api';
import { 
  FileText, UploadCloud, CheckCircle, AlertTriangle, Activity, 
  RefreshCw, LayoutDashboard, Briefcase, Gavel, CreditCard, 
  LogOut, Sun, Moon, User as UserIcon, Clock, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [polling, setPolling] = useState(false);

  // --- LOGICA DE ATUALIZAÇÃO AUTOMÁTICA ---
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
            toast.success("Análise Jurídica Concluída!");
          } else if (result.status === 'failed' || result.status === 'error') {
            setPolling(false);
            setLoading(false);
            toast.error("A IA não conseguiu processar este arquivo.");
          }
        } catch (error) { console.error("Erro ao atualizar:", error); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [polling, analysis?.documentId]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return toast.error('Selecione um arquivo.');
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await analyzeDocument(formData);
      setAnalysis(res);
      setPolling(true);
      toast.success('Arquivo enviado! Aguarde a IA...');
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || "Erro de conexão com o servidor.";
      toast.error(msg);
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans">
      {/* 1. SIDEBAR (MENU LATERAL) */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col shadow-lg z-20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg"><Activity className="text-white w-6 h-6" /></div>
            <span className="text-xl font-bold dark:text-white">LegalMind</span>
          </div>
          <nav className="space-y-2">
            <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"><LayoutDashboard size={20}/> Dashboard</button>
            <button className="flex items-center gap-3 w-full p-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"><Briefcase size={20}/> Meus Casos</button>
            <button className="flex items-center gap-3 w-full p-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"><Gavel size={20}/> Jurisprudência</button>
            <button className="flex items-center gap-3 w-full p-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"><CreditCard size={20}/> Assinatura</button>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={toggleTheme} className="flex items-center gap-3 w-full p-3 mb-2 text-gray-500 dark:text-gray-400">
            {theme === 'dark' ? <><Sun size={20}/> Modo Claro</> : <><Moon size={20}/> Modo Escuro</>}
          </button>
          <button onClick={logout} className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition"><LogOut size={20}/> Sair</button>
        </div>
      </aside>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold dark:text-white">Olá, {user?.firstName} 👋</h2>
            <p className="text-xs text-gray-400">Plano Gratuito • 5 créditos restantes</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold dark:text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm"><UserIcon size={20}/></div>
          </div>
        </header>

        {/* ÁREA DE TRABALHO */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {/* CARD DE UPLOAD */}
            <div className="md:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold mb-4 dark:text-white">Nova Análise</h3>
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center hover:border-blue-500 transition cursor-pointer relative group">
                <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition" />
                <p className="text-sm text-gray-500 font-medium">{file ? file.name : "Arraste seu PDF aqui"}</p>
              </div>
              <button onClick={handleAnalyze} disabled={loading || !file} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                {loading ? <><RefreshCw className="animate-spin" /> Analisando...</> : <><Activity size={20} /> Analisar com IA</>}
              </button>
            </div>

            {/* CARD DE RESULTADOS */}
            <div className="md:col-span-2">
              {!analysis ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-400">
                  <FileText size={48} className="mb-4 opacity-10" />
                  <p className="font-medium">Sua análise detalhada aparecerá aqui</p>
                </div>
              ) : analysis.status === 'pending' ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                  <RefreshCw size={48} className="text-blue-500 animate-spin mb-4" />
                  <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">A IA está processando seu arquivo</h3>
                  <p className="text-blue-600/60 dark:text-blue-400/60 text-sm mt-2">Isso costuma levar 15 segundos...</p>
                </div>
              ) : (
                /* EXIBIÇÃO DO RESULTADO FINAL */
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-bold flex items-center gap-2 dark:text-white"><CheckCircle className="text-green-500"/> Laudo da IA Concluído</h3>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-black">Score de Viabilidade</p>
                      <p className="text-2xl font-black text-blue-600">{analysis.analysis?.score}/100</p>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl"><h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Resumo</h4><p className="dark:text-gray-300 text-sm leading-relaxed">{analysis.analysis?.summary}</p></div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div><h4 className="text-xs font-bold text-orange-500 uppercase mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Riscos</h4><ul className="space-y-2">{analysis.analysis?.keyRisks?.map((r, i) => <li key={i} className="text-xs dark:text-gray-400 flex items-start gap-2"><span>•</span>{r}</li>)}</ul></div>
                      <div><h4 className="text-xs font-bold text-blue-500 uppercase mb-3 flex items-center gap-2"><CheckCircle size={14}/> Sugestões</h4><ul className="space-y-2">{analysis.analysis?.recommendations?.map((r, i) => <li key={i} className="text-xs dark:text-gray-400 flex items-start gap-2"><span>•</span>{r}</li>)}</ul></div>
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