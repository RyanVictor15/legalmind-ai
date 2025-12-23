import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, FileText, Activity, ShieldAlert, TrendingUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data); 
      } catch (error) {
        console.error("Erro Admin", error);
        navigate('/dashboard'); 
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
            <Loader2 className="animate-spin" size={48} />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-inter p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ShieldAlert className="text-red-600 dark:text-red-500" /> Centro de Comando
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Visão Geral do Sistema & Gestão de Usuários</p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-6 py-2 rounded-lg text-sm font-bold transition border border-slate-200 dark:border-slate-700 shadow-sm">
                Sair para o App
            </button>
        </header>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total de Usuários</p>
                        <h3 className="text-4xl font-bold text-slate-800 dark:text-white mt-2">{stats.users.total}</h3>
                    </div>
                    <Users className="text-blue-500" size={24} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Contas Pro</p>
                        <h3 className="text-4xl font-bold text-amber-500 mt-2">{stats.users.pro}</h3>
                    </div>
                    <Activity className="text-amber-500" size={24} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Docs Analisados</p>
                        <h3 className="text-4xl font-bold text-emerald-500 mt-2">{stats.documents.total}</h3>
                    </div>
                    <FileText className="text-emerald-500" size={24} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Taxa de Conversão</p>
                        <h3 className="text-4xl font-bold text-purple-500 mt-2">
                            {stats.users.total > 0 ? ((stats.users.pro / stats.users.total) * 100).toFixed(1) : 0}%
                        </h3>
                    </div>
                    <TrendingUp className="text-purple-500" size={24} />
                </div>
            </div>
        </div>

        {/* TABELA */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Últimos Cadastros</h3>
            </div>
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase">
                    <tr>
                        <th className="p-4">Usuário</th>
                        <th className="p-4">E-mail</th>
                        <th className="p-4">Plano</th>
                        <th className="p-4">Data</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {stats.latestUsers.map(user => (
                        <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                            <td className="p-4 font-medium text-slate-800 dark:text-white">{user.firstName} {user.lastName}</td>
                            <td className="p-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                            <td className="p-4">
                                {user.isPro ? (
                                    <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2 py-1 rounded text-xs font-bold border border-amber-200 dark:border-amber-500/20">PRO</span>
                                ) : (
                                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs">FREE</span>
                                )}
                            </td>
                            <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;