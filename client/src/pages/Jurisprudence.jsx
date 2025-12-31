import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout'; // <--- O Segredo da Responsividade
import api from '../services/api'; 
import { Search, ChevronRight, Scale, BookOpen, X, Copy, Check, Gavel, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Jurisprudence = () => {
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchJurisprudence = async (term = '') => {
    setLoading(true);
    try {
      const endpoint = term 
        ? `/jurisprudence?search=${encodeURIComponent(term)}` 
        : '/jurisprudence';
      
      const { data } = await api.get(endpoint);
      
      // Tratamento robusto para diferentes formatos de resposta
      if (data.data && Array.isArray(data.data)) setItems(data.data);
      else if (Array.isArray(data)) setItems(data);
      else setItems([]);

    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar jurisprudência.");
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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Ementa copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header e Busca */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-4">
             <Scale size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Jurisprudência Inteligente</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
             Pesquise milhares de decisões dos tribunais superiores (STF, STJ) em segundos.
          </p>

          <form onSubmit={handleSearch} className="relative">
             <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
             <input 
               type="text" 
               className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-lg shadow-slate-200/50 dark:shadow-none transition-all"
               placeholder="Ex: Dano moral extravio bagagem..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <button 
               type="submit"
               className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
             >
               Buscar
             </button>
          </form>
        </div>

        {/* Lista de Resultados */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-12">
             <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
             <p className="text-slate-500">Consultando tribunais...</p>
           </div>
        ) : items.length === 0 ? (
           <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
             <p className="text-slate-500">Nenhum resultado encontrado para sua busca.</p>
           </div>
        ) : (
           <div className="space-y-4">
             {items.map((item) => (
               <div 
                 key={item._id}
                 onClick={() => setSelectedItem(item)}
                 className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all cursor-pointer group"
               >
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                   <div className="flex items-center gap-3">
                     <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded text-xs font-bold uppercase">
                       {item.court}
                     </span>
                     <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">
                       {item.processNumber}
                     </span>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Gavel size={14} />
                      {new Date(item.date).toLocaleDateString()}
                   </div>
                 </div>
                 
                 <p className="text-slate-600 dark:text-slate-300 line-clamp-2 text-sm leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                   {item.summary}
                 </p>
               </div>
             ))}
           </div>
        )}

        {/* MODAL DETALHES JURISPRUDÊNCIA */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
              
              {/* Header */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">{selectedItem.court}</span>
                     <span className="text-slate-500 font-mono text-sm">{selectedItem.processNumber}</span>
                   </div>
                   <h2 className="font-bold text-slate-900 dark:text-white text-lg">Detalhes da Decisão</h2>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Conteúdo Scrollável */}
              <div className="p-8 overflow-y-auto bg-white dark:bg-slate-900">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <h4 className="text-sm uppercase tracking-wide text-slate-400 font-bold mb-2">Ementa / Resumo</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-7 text-justify whitespace-pre-line">
                    {selectedItem.summary}
                  </p>
                  
                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {selectedItem.tags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Ações */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
                 <button 
                   onClick={() => handleCopy(`${selectedItem.court} - ${selectedItem.processNumber}\n\n${selectedItem.summary}`)}
                   className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                 >
                   {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16} />}
                   {copied ? "Copiado!" : "Copiar Texto"}
                 </button>
                 <button 
                   onClick={() => setSelectedItem(null)}
                   className="px-6 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-lg"
                 >
                   Fechar
                 </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Jurisprudence;