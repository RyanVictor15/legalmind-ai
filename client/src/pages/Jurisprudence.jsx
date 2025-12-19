import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, FileText, Shield, Search, ChevronRight, BookOpen, LogOut, User, Copy, Check } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Jurisprudence = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null); // Para mostrar feedback visual de cópia

  // Busca inicial e Busca por termo
  useEffect(() => {
    // Debounce para não buscar a cada letra digitada (espera 500ms)
    const delayDebounceFn = setTimeout(() => {
      fetchCases();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      // Passa o termo de busca para o backend
      const { data } = await api.get(`/jurisprudence?search=${searchTerm}`);
      setCases(data);
    } catch (error) {
      console.error("Erro na busca", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Ementa copiada com sucesso!");
    setTimeout(() => setCopiedId(null), 2000); // Reseta o ícone depois de 2s
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-inter">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight">Legal<span className="text-blue-500">Mind</span> AI</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Edition</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div onClick={() => navigate('/dashboard')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <BarChart2 size={20} /> <span>Dashboard</span>
          </div>
          <div onClick={() => navigate('/history')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <FileText size={20} /> <span>Meus Processos</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-600 rounded-lg cursor-pointer transition shadow-lg shadow-blue-900/50">
            <Shield size={20} /> <span className="font-medium">Jurisprudência</span>
          </div>
          <div onClick={() => navigate('/profile')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <User size={20} /> <span>Meu Perfil</span>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition text-sm">
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 md:ml-64 p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Banco de Jurisprudência</h2>
          <p className="text-slate-500">Pesquise precedentes em nossa base proprietária de alta performance.</p>
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 sticky top-4 z-20">
            <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20}/>
                <input 
                    type="text" 
                    placeholder="Digite palavras-chave (ex: Danos Morais, Inscrição Indevida, STJ...)" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="space-y-4">
            {loading ? (
                <div className="text-center py-10 text-slate-400">Carregando base jurídica...</div>
            ) : cases.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    Nenhum resultado encontrado para "{searchTerm}".
                </div>
            ) : (
                cases.map(item => (
                    <div key={item._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group relative">
                        {/* HEADER DO CARD */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                    item.court === 'STF' ? 'bg-yellow-100 text-yellow-800' :
                                    item.court === 'STJ' ? 'bg-red-100 text-red-800' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                    {item.court}
                                </span>
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                    {item.area}
                                </span>
                            </div>
                            <span className="text-slate-400 text-sm">
                                {new Date(item.date).toLocaleDateString('pt-BR')}
                            </span>
                        </div>

                        {/* CONTEÚDO */}
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{item.processNumber}</h3>
                        <p className="text-slate-600 mb-4 text-sm leading-relaxed text-justify bg-slate-50 p-4 rounded border border-slate-100 font-mono">
                            {item.summary}
                        </p>

                        {/* FOOTER DO CARD */}
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex flex-wrap gap-2">
                                {item.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                                        <BookOpen size={10}/> {tag}
                                    </span>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => copyToClipboard(item.summary, item._id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                    copiedId === item._id 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white'
                                }`}
                            >
                                {copiedId === item._id ? <Check size={16}/> : <Copy size={16}/>}
                                {copiedId === item._id ? 'Copiado!' : 'Copiar Ementa'}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </main>
    </div>
  );
};

export default Jurisprudence;