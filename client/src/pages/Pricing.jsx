import React, { useState } from 'react';
import { Check, Shield, Zap, Star, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Por favor, faça login para assinar.");
      return navigate('/login');
    }
    
    setLoading(true);
    try {
      const { data } = await api.post('/payments/create-checkout-session');
      if (data.url) {
        // Redireciona para o Stripe
        window.location.href = data.url;
      } else {
        throw new Error('URL de pagamento não recebida');
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-inter py-10 px-4 transition-colors duration-300">
      <Link to="/dashboard" className="absolute top-6 left-6 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 font-bold">
         <ArrowLeft size={20} /> Voltar
      </Link>

      <div className="max-w-7xl mx-auto text-center mt-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Escolha seu Poder Jurídico
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-16 max-w-2xl mx-auto">
          Escale sua advocacia com insights de IA. Preço simples, cancele a qualquer momento.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* FREE PLAN */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col hover:scale-105 transition duration-300">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Iniciante</h3>
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">R$0<span className="text-lg text-slate-500 font-normal">/mês</span></div>
            <ul className="space-y-4 mb-8 text-left flex-1 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-3"><Check size={18} className="text-blue-500"/> 3 Análises Gratuitas (Total)</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-blue-500"/> Acesso ao Dashboard</li>
            </ul>
            <button onClick={() => navigate('/dashboard')} className="w-full py-3 rounded-lg border-2 border-slate-900 dark:border-slate-500 text-slate-900 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              Continuar Grátis
            </button>
          </div>

          {/* PRO PLAN */}
          <div className="bg-slate-900 dark:bg-blue-600 p-8 rounded-2xl shadow-2xl border border-slate-800 dark:border-blue-500 flex flex-col relative transform scale-105 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
              Mais Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
            <div className="text-4xl font-bold text-white mb-6">R$99<span className="text-lg text-slate-400 font-normal">/mês</span></div>
            <ul className="space-y-4 mb-8 text-left flex-1 text-slate-300">
              <li className="flex items-center gap-3"><Shield size={18} className="text-blue-400"/> Análises Ilimitadas</li>
              <li className="flex items-center gap-3"><Zap size={18} className="text-blue-400"/> IA Jurídica Avançada</li>
              <li className="flex items-center gap-3"><Star size={18} className="text-blue-400"/> Suporte Prioritário</li>
            </ul>
            
            <button 
              onClick={handleCheckout}
              disabled={loading || user?.isPro}
              className="w-full py-3 rounded-lg bg-blue-600 dark:bg-white text-white dark:text-blue-600 font-bold hover:bg-blue-700 dark:hover:bg-slate-100 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (user?.isPro ? 'Plano Atual' : 'Assinar Agora')}
            </button>
          </div>

          {/* CUSTOM PLAN */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col hover:scale-105 transition duration-300">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Grandes Bancas</h3>
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Contato</div>
            <ul className="space-y-4 mb-8 text-left flex-1 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-3"><Check size={18} className="text-blue-500"/> Múltiplos Usuários</li>
              <li className="flex items-center gap-3"><Check size={18} className="text-blue-500"/> API Dedicada</li>
            </ul>
            <button className="w-full py-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold hover:border-slate-900 hover:text-slate-900 dark:hover:border-white dark:hover:text-white transition">
              Falar com Vendas
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Pricing;