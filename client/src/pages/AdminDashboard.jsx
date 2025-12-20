import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, TrendingUp, ShieldAlert, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (error) {
        toast.error("Acesso restrito a administradores.");
        navigate('/dashboard'); // Chuta de volta se não for admin
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  if (loading) return <div className="p-10 text-center">Carregando dados do sistema...</div>;
  if (!stats) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-inter p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="mb-8 flex items-center text-slate-400 hover:text-white transition">
            <ArrowLeft size={20} className="mr-2"/> Voltar ao App
        </button>

        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <ShieldAlert className="text-red-500"/> Painel Administrativo (Master)
        </h1>
        <p className="text-slate-400 mb-10">Visão geral da performance do LegalMind AI.</p>

        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Usuários Totais</p>
                        <h3 className="text-4xl font-bold mt-2">{stats.users.total}</h3>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><Users size={24}/></div>
                </div>
                <div className="mt-4 text-xs text-slate-500">
                    {stats.users.pro} Premium / {stats.users.free} Grátis
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Processos Analisados</p>
                        <h3 className="text-4xl font-bold mt-2">{stats.documents.total}</h3>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg text-green-400"><FileText size={24}/></div>
                </div>
                <div className="mt-4 text-xs text-slate-500">Documentos processados via IA</div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Receita Estimada</p>
                        <h3 className="text-4xl font-bold mt-2">R$ {stats.users.pro * 97},00</h3>
                    </div>
                    <div className="p-3 bg-amber-500/20 rounded-lg text-amber-400"><TrendingUp size={24}/></div>
                </div>
                <div className="mt-4 text-xs text-slate-500">Baseado em R$ 97/mês por Pro</div>
            </div>
        </div>

        {/* TABELA DE USUÁRIOS RECENTES */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
                <h3 className="font-bold text-lg">Novos Usuários Cadastrados</h3>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
                    <tr>
                        <th className="p-4">Nome</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Data</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {stats.latestUsers.map(user => (
                        <tr key={user._id} className="hover:bg-slate-700/50 transition">
                            <td className="p-4 font-medium">{user.firstName} {user.lastName}</td>
                            <td className="p-4 text-slate-400">{user.email}</td>
                            <td className="p-4">
                                {user.isPro ? 
                                    <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-bold">PRO</span> : 
                                    <span className="bg-slate-600/20 text-slate-400 px-2 py-1 rounded text-xs">FREE</span>
                                }
                            </td>
                            <td className="p-4 text-slate-500 text-sm">
                                {new Date(user.createdAt).toLocaleDateString()}
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