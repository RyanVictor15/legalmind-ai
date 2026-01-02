import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CreditCard, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, Loader2, Trash2, AlertOctagon, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Billing = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Estados para o Modal de Exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ... (Funções de pagamento mantidas iguais)
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/create-checkout-session');
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao iniciar pagamento.");
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/create-portal-session');
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao acessar portal.");
      setLoading(false);
    }
  };

  // 📍 FUNÇÃO DE DELETAR CONTA
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETAR') return;

    setDeleteLoading(true);
    try {
      await api.delete('/users/profile');
      toast.success("Conta excluída. Sentiremos sua falta.");
      logout(); // Faz logout e manda para home
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir conta. Tente novamente.");
      setDeleteLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        
        {/* Header (Mantido) */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <CreditCard className="text-blue-600" />
            Assinatura e Faturamento
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gerencie seu plano, baixe faturas e altere formas de pagamento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* CARTÃO DE STATUS (Mantido) */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            {user?.isPro ? (
              <>
                <div className="absolute top-0 right-0 p-4 bg-green-100 dark:bg-green-900/30 rounded-bl-2xl text-green-700 dark:text-green-400 font-bold text-xs uppercase tracking-wider">
                  Assinatura Ativa
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-green-500" /> Plano Profissional
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Você tem acesso ilimitado a todos os recursos de IA.
                </p>
                <button 
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <ExternalLink size={18} />}
                  Gerenciar Assinatura
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Plano Gratuito</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Você está usando o limite gratuito. Atualize para desbloquear tudo.
                </p>
                <div className="flex items-center gap-2 mb-6 text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-800">
                  <AlertTriangle size={20} />
                  <span className="text-sm font-medium">Seus créditos: {user?.usageCount || 0}/3 usados.</span>
                </div>
                <button 
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                  Upgrade para PRO
                </button>
              </>
            )}
          </div>

          {/* BENEFÍCIOS (Mantido) */}
          <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Benefícios PRO</h3>
            <ul className="space-y-3">
              {["Análises Ilimitadas", "IA de Raciocínio", "Upload 50MB", "Suporte VIP"].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 size={16} className="text-blue-500 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 📍 ZONA DE PERIGO (NOVO) */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
          <h3 className="text-red-600 font-bold text-lg mb-4 flex items-center gap-2">
            <AlertOctagon size={20} /> Zona de Perigo
          </h3>
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Excluir Conta</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Isso apagará permanentemente seus dados, documentos e cancelará sua assinatura. Esta ação não pode ser desfeita.
              </p>
            </div>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-red-600 border border-red-200 dark:border-red-900 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition whitespace-nowrap"
            >
              Excluir minha conta
            </button>
          </div>
        </div>

        {/* 📍 MODAL DE EXCLUSÃO */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 size={24} />
                </div>
                <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Tem certeza absoluta?</h2>
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Esta ação é irreversível. Todos os seus casos, histórico e assinatura serão apagados imediatamente.
                </p>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                    Digite <span className="select-none text-red-600">DELETAR</span> para confirmar
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="DELETAR"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETAR' || deleteLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {deleteLoading ? <Loader2 className="animate-spin" size={18} /> : "Excluir Conta"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Billing;