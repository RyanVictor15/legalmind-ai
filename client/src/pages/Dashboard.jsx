import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import { analyzeDocument } from '../services/api'; // Importa do arquivo acima
import { Loader2, Scale } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (file) => {
    setLoading(true);
    setAnalysis(null);
    try {
      // Cria o envelope que o Multer exige
      const formData = new FormData();
      formData.append('file', file); // O nome TEM que ser 'file'

      const response = await analyzeDocument(formData);
      // Garante que pegamos os dados, venham eles diretos ou aninhados
      setAnalysis(response.data || response);
    } catch (error) {
      console.error("Erro no Dashboard:", error);
      alert("Erro: " + (error.response?.data?.message || "Falha ao conectar com o servidor"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Espaçador para o topo no Mobile (Para não ficar atrás do menu) */}
        <div className="md:hidden h-16 w-full shrink-0"></div>

        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
          
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <LayoutDashboard className="text-blue-500" /> Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Visão geral das suas análises jurídicas.
              </p>
            </div>
            
            {/* Botão de Nova Análise (Fica visível e fácil no mobile) */}
             <button 
               onClick={handleAnalyze} // Supondo que você tenha essa função
               className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
             >
               <FileText size={20} />
               Nova Análise
             </button>
          </header>

          {/* --- AQUI ESTÁ A MÁGICA DO GRID RESPONSIVO --- */}
          {/* Mobile: grid-cols-1 (Um embaixo do outro) */}
          {/* Desktop: grid-cols-3 (Três lado a lado) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Card 1: Análises Realizadas */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                <FileText size={32} />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Análises Feitas</p>
                <h3 className="text-2xl font-bold text-white">12</h3> {/* Valor fixo ou variável */}
              </div>
            </div>

            {/* Card 2: Créditos (Preparando para Fase 4) */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                <LayoutDashboard size={32} />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Créditos Disponíveis</p>
                <h3 className="text-2xl font-bold text-white">5</h3>
              </div>
            </div>

            {/* Card 3: Histórico Recente (Atalho) */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg flex items-center gap-4 cursor-pointer hover:border-blue-500/50 transition-colors">
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                <History size={32} />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Ver Histórico</p>
                <h3 className="text-sm font-bold text-slate-200 mt-1">Acessar lista completa &rarr;</h3>
              </div>
            </div>

          </div>

          {/* Área de Input (Se estiver aqui no Dashboard) */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden">
             <div className="p-4 border-b border-slate-800 bg-slate-900/50">
               <h3 className="font-bold text-white">Análise Rápida</h3>
             </div>
             <div className="p-6">
                {/* Aqui entra o seu formulário de input original */}
                {/* Se o seu código original tiver o input aqui, mantenha-o dentro desta div */}
                <textarea 
                  className="w-full h-40 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-4"
                  placeholder="Cole um trecho curto aqui..."
                ></textarea>
                <button className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Processar Texto
                </button>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;