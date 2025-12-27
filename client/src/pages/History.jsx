import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { FileText, Clock, Download, Eye, X, ShieldAlert, CheckCircle, Scale } from 'lucide-react';

const History = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null); // Estado para o Modal

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data } = await api.get('/analyze/history');
        setCases(data);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  // Função para gerar e baixar o arquivo de texto
  const handleDownload = (e, item) => {
    e.stopPropagation(); // Impede que o modal abra ao clicar no download

    const content = `
RELATÓRIO DE INTELIGÊNCIA JURÍDICA - LEGALMIND
------------------------------------------------
Arquivo: ${item.filename}
Data: ${new Date(item.createdAt).toLocaleDateString()}
------------------------------------------------

VEREDITO DA IA: ${item.verdict}
PROBABILIDADE DE ÊXITO: ${item.riskScore}%

RESUMO DO CASO:
${item.summary}

CONSELHO ESTRATÉGICO:
${item.strategicAdvice || "Não disponível."}

------------------------------------------------
Gerado automaticamente por LegalMind AI
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_${item.filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative">
        
        <div className="md:hidden h-16 w-full shrink-0"></div>

        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-white flex items-center gap-2">
          <Clock className="text-blue-500" /> Meus Casos
        </h1>

        {loading ? (
          <div className="text-slate-500 animate-pulse">Carregando histórico...</div>
        ) : cases.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center">
            <p className="text-slate-400 mb-2">Nenhum caso analisado ainda.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cases.map((c) => (
              <div 
                key={c._id} 
                onClick={() => setSelectedCase(c)} // Abre o Modal
                className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all shadow-lg cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 group-hover:border-blue-500/30 transition-colors">
                      <FileText className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{c.filename}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString()} às {new Date(c.createdAt).toLocaleTimeString().slice(0,5)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Êxito</span>
                      <p className="text-xl font-bold text-white">{c.riskScore}%</p>
                    </div>

                    <div className={`px-4 py-2 rounded-full text-xs font-bold border ${
                      c.verdict?.includes('Favor') 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {c.verdict || 'Analisado'}
                    </div>

                    {/* Botão de Download na lista */}
                    <button 
                      onClick={(e) => handleDownload(e, c)}
                      className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                      title="Baixar Relatório"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                  <p className="text-sm text-slate-400 line-clamp-2">{c.summary}</p>
                  <p className="text-xs text-blue-400 mt-2 flex items-center gap-1 group-hover:underline">
                    <Eye size={12} /> Clique para ver detalhes completos
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL DE DETALHES --- */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              
              {/* Header do Modal */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-start sticky top-0 bg-slate-900 z-10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Scale className="text-blue-500" /> Detalhes da Análise
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">{selectedCase.filename}</p>
                </div>
                <button 
                  onClick={() => setSelectedCase(null)}
                  className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Corpo do Modal */}
              <div className="p-6 space-y-6">
                
                {/* Score e Veredito */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold">Probabilidade de Êxito</p>
                    <p className="text-3xl font-bold text-white mt-1">{selectedCase.riskScore}%</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Veredito</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      selectedCase.verdict?.includes('Favor') ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'
                    }`}>
                      {selectedCase.verdict}
                    </span>
                  </div>
                </div>

                {/* Resumo */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <FileText size={16} /> Resumo dos Fatos
                  </h3>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 text-sm leading-relaxed text-justify">
                    {selectedCase.summary}
                  </div>
                </div>

                {/* Conselho Estratégico (A parte mais importante) */}
                {selectedCase.strategicAdvice && (
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-blue-400" /> Conselho Estratégico
                    </h3>
                    <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 text-slate-300 text-sm leading-relaxed text-justify">
                      {selectedCase.strategicAdvice}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer do Modal */}
              <div className="p-6 border-t border-slate-800 bg-slate-900 sticky bottom-0 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Fechar
                </button>
                <button 
                  onClick={(e) => handleDownload(e, selectedCase)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors font-medium shadow-lg shadow-blue-900/20"
                >
                  <Download size={18} /> Baixar Relatório
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default History;