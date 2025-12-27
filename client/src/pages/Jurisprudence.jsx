import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api'; 
import { Search, BookOpen, ChevronRight, Scale, Filter, AlertCircle } from 'lucide-react';

const Jurisprudence = () => {
  // Inicializa como array vazio para não quebrar no primeiro render
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const fetchJurisprudence = async (term = '') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = term 
        ? `/jurisprudence?search=${encodeURIComponent(term)}` 
        : '/jurisprudence';
      
      const response = await api.get(endpoint);
      console.log("Dados da API:", response.data); // Para você ver no F12 o que está vindo

      // --- PROTEÇÃO ANTI-TELA BRANCA ---
      // Só aceita se for uma Lista (Array). Se for erro ou objeto, força lista vazia.
      if (Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        console.warn("A API retornou algo que não é uma lista:", response.data);
        setItems([]); 
      }

    } catch (err) {
      console.error("Erro na busca:", err);
      // Se for erro 404, apenas limpa a lista. Outros erros mostram aviso.
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

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Espaçador Mobile */}
        <div className="md:hidden h-16 w-full shrink-0"></div>

        <div className="p-4 md:p-8 w-full max-w-6xl mx-auto">
          
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Scale className="text-blue-500" /> Jurisprudência
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Base de dados de precedentes e teses jurídicas.
            </p>
          </header>

          <form onSubmit={handleSearch} className="relative mb-8 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-500" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Pesquise por tema..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-12 text-white outline-none focus:border-blue-500 transition-all"
            />
            <button 
              type="submit"
              className="absolute inset-y-2 right-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white px-4 rounded-lg transition-all"
            >
              Buscar
            </button>
          </form>

          {loading ? (
            <div className="text-center py-20 text-slate-500 animate-pulse">Carregando base...</div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
              <AlertCircle size={20} /> {error}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-400">Nenhum resultado encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {/* O erro acontecia aqui embaixo. Agora está protegido. */}
              {items.map((item, index) => (
                <div key={item._id || index} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-900/30 text-blue-400 text-[10px] font-bold px-2 py-1 rounded border border-blue-500/20">
                          {item.court || 'TRIBUNAL'}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2">{item.title || 'Sem título'}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{item.description || item.summary || 'Sem descrição'}</p>
                    </div>
                    <ChevronRight className="text-slate-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Jurisprudence;