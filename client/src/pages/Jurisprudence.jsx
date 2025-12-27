import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api'; // Conecta na sua API real
import { Search, BookOpen, ChevronRight, Scale, Filter, AlertCircle } from 'lucide-react';

const Jurisprudence = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Função para buscar dados do backend
  const fetchJurisprudence = async (term = '') => {
    setLoading(true);
    setError(null);
    try {
      // Chama a rota real do seu backend (que vi nos seus arquivos)
      // Se o termo estiver vazio, busca tudo. Se tiver texto, busca filtrado.
      const endpoint = term 
        ? `/jurisprudence?search=${encodeURIComponent(term)}` 
        : '/jurisprudence';
      
      const { data } = await api.get(endpoint);
      setItems(data);
    } catch (err) {
      console.error("Erro ao buscar jurisprudência:", err);
      // Não mostra erro fatal, apenas deixa a lista vazia ou avisa
      if (err.response && err.response.status === 404) {
        setItems([]);
      } else {
        setError("Não foi possível carregar a base de dados no momento.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Carrega tudo ao abrir a página
  useEffect(() => {
    fetchJurisprudence();
  }, []);

  // Busca quando o usuário aperta ENTER ou clica na lupa
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
          
          <header className="mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Scale className="text-blue-500" /> Jurisprudência
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Base de dados de precedentes e teses jurídicas.
            </p>
          </header>

          {/* Barra de Busca Profissional */}
          <form onSubmit={handleSearch} className="relative mb-8 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Pesquise por tema, tribunal ou palavra-chave (ex: Dano Moral)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-lg"
            />
            <button 
              type="submit"
              className="absolute inset-y-2 right-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white px-4 rounded-lg transition-all flex items-center"
            >
              Buscar
            </button>
          </form>

          {/* Estados da Tela (Carregando, Erro ou Lista) */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p>Consultando base jurídica...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
              <AlertCircle size={24} />
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
              <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 font-medium">Nenhum resultado encontrado.</p>
              <p className="text-sm text-slate-600 mt-1">Tente termos mais genéricos.</p>
            </div>
          ) : (
            <div className="grid gap-4 animate-fade-in-up">
              {items.map((item) => (
                <div key={item._id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                  <div className="flex flex-col md:flex-row justify-between gap-4 md:items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-blue-500/20">
                          {item.court || 'Tribunal'}
                        </span>
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <Filter size={10} /> {item.category || 'Geral'}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors mb-2">
                        {item.title}
                      </h3>
                      
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                        {item.description || item.summary}
                      </p>
                    </div>
                    
                    <ChevronRight className="hidden md:block text-slate-700 group-hover:text-blue-500 transition-colors self-center" />
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