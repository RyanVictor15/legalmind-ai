import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api'; 
import { Search, ChevronRight, Scale, AlertCircle, BookOpen, X, Copy, Check, Gavel } from 'lucide-react';
import toast from 'react-hot-toast';

const Jurisprudence = () => {
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  // Estado para o Modal de Detalhes
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchJurisprudence = async (term = '') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = term 
        ? `/jurisprudence?search=${encodeURIComponent(term)}` 
        : '/jurisprudence';
      
      const response = await api.get(endpoint);

      if (response.data && Array.isArray(response.data.data)) {
        setItems(response.data.data);
      } else if (Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        setItems([]); 
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setItems([]);
      } else {
        setError("Erro de conexão com a base de dados.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJurisprudence();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJurisprudence(searchTerm);
  };

  // Função para Copiar Ementa
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Ementa copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <div className="md:hidden h-16 w-full shrink-0"></div>

        <div className="p-4 md:p-8 w-full max-w-6xl mx-auto">
          
          <header className="mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Scale className="text-blue-500" /> Jurisprudência
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Pesquise precedentes, súmulas e julgados recentes.
            </p>
          </header>

          {/* Barra de Busca */}
          <form onSubmit={handleSearch} className="relative mb-8 group z-10">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Pesquise por tema, tribunal ou número (ex: Dano Moral)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-lg"
            />
            <button 
              type="submit"
              className="absolute inset-y-2 right-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white px-4 rounded-lg transition-all font-medium"
            >
              Buscar
            </button>
          </form>

          {/* Lista de Resultados */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <p>Carregando base jurídica...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
              <AlertCircle size={20} /> {error}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
              <BookOpen className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <p className="text-slate-400 font-medium">Nenhum resultado encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-4 animate-fade-in-up pb-10">
              {items.map((item) => (
                <div 
                  key={item._id} 
                  onClick={() => setSelectedItem(item)} // AQUI: Abre o Modal
                  className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/10 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    item.category?.includes('Penal') ? 'bg-red-500' : 
                    item.category?.includes('Trabalho') ? 'bg-amber-500' : 
                    'bg-blue-500'
                  }`}></div>

                  <div className="flex flex-col md:flex-row justify-between gap-4 md:items-start pl-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-1 rounded border border-slate-700">
                          {item.court || 'TJ'}
                        </span>
                        <span className="text-slate-500 text-xs font-mono">
                          {item.processNumber}
                        </span>
                        <span className="ml-auto md:ml-0 text-slate-500 text-xs">
                           {item.date ? new Date(item.date).toLocaleDateString('pt-BR') : 'Data n/d'}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      
                      <div className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                        {item.description || item.summary}
                      </div>

                      {item.tags && (
                        <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag, idx) => (
                                <span key={idx} className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="hidden md:flex flex-col items-center justify-center self-center pl-4 border-l border-slate-800">
                       <ChevronRight className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- MODAL DE DETALHES (POPUP) --- */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative">
              
              {/* Cabeçalho do Modal */}
              <div className="p-6 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {selectedItem.court}
                    </span>
                    <span className="text-slate-400 text-sm font-mono">
                      {selectedItem.processNumber}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white leading-tight">
                    {selectedItem.title}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Corpo do Modal */}
              <div className="p-6 space-y-6">
                
                {/* Data e Tags */}
                <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-slate-400 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Gavel size={16} /> 
                    <span>Julgado em: <strong className="text-slate-200">{new Date(selectedItem.date).toLocaleDateString('pt-BR')}</strong></span>
                  </div>
                  <div className="flex gap-2">
                     {selectedItem.tags?.map(t => (
                        <span key={t} className="bg-slate-800 px-2 py-1 rounded text-xs">{t}</span>
                     ))}
                  </div>
                </div>

                {/* Ementa / Descrição Completa */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Ementa / Resumo</h3>
                  <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed text-justify font-serif">
                    {selectedItem.description || selectedItem.summary}
                  </div>
                </div>

                {/* Veredito / Detalhes Adicionais (Se houver) */}
                {selectedItem.summary && selectedItem.description && (
                   <div>
                     <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Inteiro Teor (Trecho)</h3>
                     <p className="text-slate-400 text-sm leading-relaxed">
                       {selectedItem.summary}
                     </p>
                   </div>
                )}

              </div>

              {/* Rodapé com Ações */}
              <div className="p-6 border-t border-slate-800 bg-slate-900 sticky bottom-0 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Fechar
                </button>
                
                <button 
                  onClick={() => handleCopy(`${selectedItem.title}\n${selectedItem.court} - ${selectedItem.processNumber}\n\n${selectedItem.description || selectedItem.summary}`)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2 transition-colors border border-slate-700"
                >
                  {copied ? <Check size={18} className="text-green-400"/> : <Copy size={18} />}
                  {copied ? "Copiado!" : "Copiar Ementa"}
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Jurisprudence;