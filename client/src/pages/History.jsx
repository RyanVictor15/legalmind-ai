import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, FileText, Loader2, Shield, LogOut, User, Download, Eye } from 'lucide-react';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext';

const History = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // URL base para arquivos estáticos
  const API_BASE = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'http://localhost:5000';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/analyze/history');
        if (data.status === 'success') {
             setDocuments(data.data);
        } else if (Array.isArray(data)) {
             setDocuments(data);
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const openAnalysis = (doc) => {
    navigate('/dashboard', { state: { document: doc } });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-inter transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-white hidden md:flex flex-col fixed h-full z-10 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight">Legal<span className="text-blue-500">Mind</span> AI</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Edition</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div onClick={() => navigate('/dashboard')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <BarChart2 size={20} /> <span>Dashboard</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-600 rounded-lg cursor-pointer transition shadow-lg shadow-blue-900/50 text-white">
            <FileText size={20} /> <span className="font-medium">Meus Casos</span>
          </div>
          <div onClick={() => navigate('/jurisprudence')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <Shield size={20} /> <span>Jurisprudência</span>
          </div>
          <div onClick={() => navigate('/profile')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <User size={20} /> <span>Meu Perfil</span>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition text-sm">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 md:ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Meus Casos</h2>
            <p className="text-slate-500 dark:text-slate-400">Histórico completo e downloads.</p>
          </div>
        </header>

        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        ) : documents.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
                <FileText size={48} className="mx-auto text-slate-300 mb-4"/>
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">Nenhum caso encontrado</h3>
                <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 mt-4">
                    Nova Análise
                </button>
            </div>
        ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Documento</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Data</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Veredito</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {documents.map((doc) => (
                            <tr 
                                key={doc._id} 
                                onClick={() => openAnalysis(doc)}
                                className="hover:bg-blue-50 dark:hover:bg-slate-700 transition duration-150 cursor-pointer group"
                            >
                                <td className="p-5 font-medium text-slate-800 dark:text-white flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 group-hover:bg-blue-200 group-hover:text-blue-700 rounded transition">
                                        <FileText size={18}/>
                                    </div>
                                    {doc.filename || doc.title || 'Documento Sem Título'}
                                </td>
                                <td className="p-5 text-slate-500 dark:text-slate-400 text-sm">
                                    {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                        (doc.verdict === 'Favorável' || doc.verdict === 'Favorable') ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 
                                        (doc.verdict === 'Desfavorável' || doc.verdict === 'Unfavorable') ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 
                                        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                                    }`}>
                                        {doc.verdict ? doc.verdict.toUpperCase() : 'NEUTRO'}
                                    </span>
                                </td>
                                <td className="p-5 flex items-center gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openAnalysis(doc); }}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition"
                                        title="Ver Análise"
                                    >
                                        <Eye size={20}/>
                                    </button>

                                    {doc.filePath && (
                                        <a 
                                            href={`${API_BASE}/${doc.filePath}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()} 
                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition"
                                            title="Baixar Original"
                                        >
                                            <Download size={20}/>
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </main>
    </div>
  );
};

export default History;