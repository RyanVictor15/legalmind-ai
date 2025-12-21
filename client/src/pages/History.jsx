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
  
  // Dynamic Base URL for Static Files
  // Removes '/api' from VITE_API_URL to get the root server URL
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
        console.error("Fetch history error:", error);
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
    <div className="flex min-h-screen bg-slate-50 font-inter">
      
      {/* SIDEBAR (Mantido igual) */}
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
            <FileText size={20} /> <span className="font-medium">My Cases</span>
          </div>
          <div onClick={() => navigate('/jurisprudence')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <Shield size={20} /> <span>Jurisprudence</span>
          </div>
          <div onClick={() => navigate('/profile')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <User size={20} /> <span>My Profile</span>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 md:ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Cases</h2>
            <p className="text-slate-500">Complete history and downloads.</p>
          </div>
        </header>

        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        ) : documents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                <FileText size={48} className="mx-auto text-slate-300 mb-4"/>
                <h3 className="text-lg font-medium text-slate-600">No cases found</h3>
                <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 mt-4">
                    New Analysis
                </button>
            </div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Document</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Date</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Verdict</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {documents.map((doc) => (
                            <tr 
                                key={doc._id} 
                                onClick={() => openAnalysis(doc)}
                                className="hover:bg-blue-50 transition duration-150 cursor-pointer group"
                            >
                                <td className="p-5 font-medium text-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 text-slate-500 group-hover:bg-blue-200 group-hover:text-blue-700 rounded transition">
                                        <FileText size={18}/>
                                    </div>
                                    {doc.filename || doc.title || 'Untitled Document'}
                                </td>
                                <td className="p-5 text-slate-500 text-sm">
                                    {new Date(doc.createdAt).toLocaleDateString('en-US')}
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                        (doc.verdict === 'Favorável' || doc.verdict === 'Favorable') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                        (doc.verdict === 'Desfavorável' || doc.verdict === 'Unfavorable') ? 'bg-red-50 text-red-700 border-red-200' : 
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {doc.verdict ? doc.verdict.toUpperCase() : 'NEUTRAL'}
                                    </span>
                                </td>
                                <td className="p-5 flex items-center gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openAnalysis(doc); }}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition"
                                        title="View Analysis"
                                    >
                                        <Eye size={20}/>
                                    </button>

                                    {doc.filePath && (
                                        <a 
                                            // URL Dinâmica Segura
                                            href={`${API_BASE}/${doc.filePath}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()} 
                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-100 rounded-full transition"
                                            title="Download Original"
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