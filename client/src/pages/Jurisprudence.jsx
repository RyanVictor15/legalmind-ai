import React, { useState } from 'react';
import api from '../services/api';
import { Search, Scale, BookOpen, Loader2, ArrowRight, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Nova Sidebar

const Jurisprudence = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigate = useNavigate();

  // Filtros
  const [court, setCourt] = useState('');
  const [area, setArea] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    
    try {
      const params = { search: query };
      if (court) params.court = court;
      if (area) params.area = area;

      const { data } = await api.get('/jurisprudence', { params });
      setResults(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-inter transition-colors duration-300">
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 p-8 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center mb-6">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 dark:text-slate-400 mr-4">
                <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Jurisprudência</h2>
        </div>

        <div className="max-w-5xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 flex justify-center items-center gap-3">
                    <Scale className="text-blue-600" size={40}/> Busca de Jurisprudência
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Acesse nossa base unificada de decisões (Simulação).
                </p>
            </div>

            {/* BARRA DE BUSCA */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 mb-10">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-4 text-slate-400" size={24}/>
                        <input 
                            type="text" 
                            className="w-full pl-14 pr-4 py-4 text-lg bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none transition text-slate-800 dark:text-white"
                            placeholder="Pesquise por palavras-chave (ex: Dano Moral)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                        <select 
                            className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 outline-none"
                            value={court}
                            onChange={(e) => setCourt(e.target.value)}
                        >
                            <option value="">Todos os Tribunais</option>
                            <option value="STF">STF</option>
                            <option value="STJ">STJ</option>
                            <option value="TJSP">TJSP</option>
                            <option value="TJRJ">TJRJ</option>
                        </select>

                        <select 
                            className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 outline-none"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                        >
                            <option value="">Todas as Áreas</option>
                            <option value="Cível">Cível</option>
                            <option value="Penal">Criminal</option>
                            <option value="Trabalhista">Trabalhista</option>
                        </select>

                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-lg">
                            {loading ? <Loader2 className="animate-spin"/> : 'Buscar'}
                        </button>
                    </div>
                </form>
            </div>

            {/* RESULTADOS */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-20">
                        <Loader2 size={48} className="animate-spin text-blue-500 mx-auto"/>
                        <p className="text-slate-500 mt-4">Pesquisando...</p>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider mb-4">
                            {results.length} Decisões Encontradas
                        </h3>
                        {results.map((item) => (
                            <div key={item._id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition group">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded mr-2">
                                            {item.court}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm font-mono">
                                            {item.processNumber}
                                        </span>
                                    </div>
                                    <span className="text-slate-400 dark:text-slate-500 text-xs">
                                        {new Date(item.date).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 transition">
                                    {item.area} - {item.tags?.[0]}
                                </h4>
                                
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
                                    {item.summary}
                                </p>

                                <div className="flex flex-wrap gap-2 mt-3">
                                    {item.tags?.map(tag => (
                                        <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                ) : searched ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
                        <BookOpen size={48} className="mx-auto text-slate-300 mb-4"/>
                        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">Nenhum resultado encontrado</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">Tente palavras-chave mais amplas ou limpe os filtros.</p>
                        <p className="text-xs text-slate-400 mt-2">(Dica: Rode o script seedJurisprudence.js no servidor)</p>
                    </div>
                ) : null}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Jurisprudence;