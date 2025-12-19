// client/src/pages/History.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Adicionei 'Download'
import { BarChart2, FileText, Calendar, ChevronRight, Loader2, Shield, LogOut, User, Download } from 'lucide-react';
import api from '../services/api'; // Usa a API centralizada

const History = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/analyze/history');
        setDocuments(data);
      } catch (error) {
        console.error("Erro ao buscar histórico", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
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
          <div className="flex items-center gap-3 p-3 bg-blue-600 rounded-lg cursor-pointer transition shadow-lg shadow-blue-900/50">
            <FileText size={20} /> <span className="font-medium">Meus Processos</span>
          </div>
          <div onClick={() => navigate('/jurisprudence')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <Shield size={20} /> <span>Jurisprudência</span>
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
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Meus Processos</h2>
            <p className="text-slate-500">Histórico completo e downloads.</p>
          </div>
        </header>

        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        ) : documents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                <FileText size={48} className="mx-auto text-slate-300 mb-4"/>
                <h3 className="text-lg font-medium text-slate-600">Nenhum processo encontrado</h3>
                <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 mt-4">
                    Nova Análise
                </button>
            </div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Documento</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Data</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Veredito</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {documents.map((doc) => (
                            <tr 
                                key={doc._id} 
                                onClick={() => navigate('/dashboard', { state: { document: doc } })}
                                className="hover:bg-blue-50 transition duration-150 cursor-pointer group"
                            >
                                <td className="p-5 font-medium text-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 text-slate-500 group-hover:bg-blue-200 group-hover:text-blue-700 rounded transition">
                                        <FileText size={18}/>
                                    </div>
                                    {doc.filename}
                                </td>
                                <td className="p-5 text-slate-500 text-sm">
                                    {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                        doc.verdict === 'Favorável' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                        doc.verdict === 'Desfavorável' ? 'bg-red-50 text-red-700 border-red-200' : 
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {doc.verdict?.toUpperCase() || 'NEUTRO'}
                                    </span>
                                </td>
                                {/* COLUNA DE AÇÕES COM DOWNLOAD */}
                                <td className="p-5 flex items-center gap-3">
                                    {doc.filePath && (
                                        <a 
                                            href={`http://localhost:5000/${doc.filePath}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()} // Impede de abrir o dashboard ao clicar
                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition"
                                            title="Baixar Arquivo Original"
                                        >
                                            <Download size={20}/>
                                        </a>
                                    )}
                                    <button className="text-slate-300 group-hover:text-blue-600 transition">
                                        <ChevronRight size={20}/>
                                    </button>
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