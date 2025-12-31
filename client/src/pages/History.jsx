import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout'; // <--- Integração com o novo Layout
import api from '../services/api';
import { FileText, Clock, Download, Eye, X, ShieldAlert, CheckCircle, Search, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const History = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data } = await api.get('/analyze/history'); // Certifique-se que essa rota existe no backend
        setCases(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        toast.error("Não foi possível carregar o histórico.");
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  // Filtro de busca local
  const filteredCases = cases.filter(c => 
    c.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.verdict?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gerador de Relatório Simples (.txt)
  const handleDownload = (e, item) => {
    e.stopPropagation();
    
    const content = `
██╗      ███████╗ ██████╗  █████╗ ██╗     ███╗   ███╗██╗███╗   ██╗██████╗ 
██║      ██╔════╝██╔════╝ ██╔══██╗██║     ████╗ ████║██║████╗  ██║██╔══██╗
██║      █████╗  ██║  ███╗███████║██║     ██╔████╔██║██║██╔██╗ ██║██║  ██║
██║      ██╔══╝  ██║   ██║██╔══██║██║     ██║╚██╔╝██║██║██║╚██╗██║██║  ██║
███████╗ ███████╗╚██████╔╝██║  ██║███████╗██║ ╚═╝ ██║██║██║ ╚████║██████╔╝
╚══════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝ 

RELATÓRIO DE INTELIGÊNCIA JURÍDICA
------------------------------------------------------------------
ARQUIVO: ${item.filename}
DATA DA ANÁLISE: ${new Date(item.createdAt).toLocaleDateString('pt-BR')}
ID DO PROCESSO: ${item._id}
------------------------------------------------------------------

1. VEREDITO DA IA
   ${item.verdict || 'Não concluído'}

2. SCORE DE RISCO
   ${item.riskScore}% (0 = Seguro, 100 = Perda Provável)

3. RESUMO DO CASO
   ${item.summary || 'Sem resumo disponível.'}

4. CONSELHO ESTRATÉGICO
   ${item.strategicAdvice || 'Nenhuma estratégia específica gerada.'}

------------------------------------------------------------------
Gerado automaticamente por LegalMind AI.
Este documento é informativo e não substitui consultoria jurídica humana.
    `;

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Relatorio_LegalMind_${item.filename.split('.')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    toast.success("Download iniciado!");
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header da Página */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meus Casos</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie seu histórico de análises jurídicas.</p>
          </div>
          
          {/* Barra de Busca */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Lista de Casos (Grid) */}
        {loading ? (
           <div className="text-center py-20">
             <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
             <p className="text-slate-500">Carregando histórico...</p>
           </div>
        ) : filteredCases.length === 0 ? (
           <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
             <FileText size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-500">Nenhuma análise encontrada.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((item) => (
              <div 
                key={item._id}
                onClick={() => setSelectedCase(item)}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <FileText size={20} />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                    item.riskScore > 70 
                      ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' 
                      : item.riskScore > 30 
                      ? 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-900/30'
                      : 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-900/30'
                  }`}>
                    Risco {item.riskScore}%
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 dark:text-white mb-1 truncate">{item.filename}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <Calendar size={12} />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Ver detalhes</span>
                  <button 
                    onClick={(e) => handleDownload(e, item)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-600 transition-colors"
                    title="Baixar Relatório"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DE DETALHES */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              
              {/* Header Modal */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={20} className="text-blue-500" />
                  Detalhes da Análise
                </h3>
                <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Corpo com Scroll */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 uppercase font-bold">Veredito</span>
                      <p className="font-bold text-slate-800 dark:text-white text-lg">{selectedCase.verdict || 'N/A'}</p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 uppercase font-bold">Risco Calculado</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600" style={{ width: `${selectedCase.riskScore}%` }}></div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">{selectedCase.riskScore}%</span>
                      </div>
                   </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">Resumo</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedCase.summary}
                  </div>
                </div>

                {selectedCase.strategicAdvice && (
                   <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-xl">
                      <h4 className="font-bold text-amber-800 dark:text-amber-500 mb-1 flex items-center gap-2">
                        <ShieldAlert size={16} /> Conselho Estratégico
                      </h4>
                      <p className="text-sm text-amber-900/80 dark:text-amber-200/80">{selectedCase.strategicAdvice}</p>
                   </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
                >
                  Fechar
                </button>
                <button 
                  onClick={(e) => handleDownload(e, selectedCase)}
                  className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors text-sm font-bold flex items-center gap-2"
                >
                  <Download size={16} /> Baixar Relatório
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default History;