import React, { useState } from 'react';
import { Check, Shield, Zap, Star, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to upgrade.");
      return navigate('/login');
    }
    
    setLoading(true);
    try {
      // 1. Solicita a criação da sessão no backend
      const { data } = await api.post('/payments/create-checkout-session');
      
      // 2. Redireciona para a URL segura do Stripe
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error(error);
      toast.error("Checkout failed. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-inter py-20 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Choose Your Legal Power
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-16 max-w-2xl mx-auto">
          Scale your legal practice with AI-driven insights. Simple pricing, cancel anytime.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* FREE PLAN (Card Esquerdo - Mantido igual, apenas resumido aqui) */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col hover:scale-105 transition duration-300">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Starter</h3>
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">$0<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8 text-left flex-1">
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300"><Check size={18} className="text-blue-500"/> 3 Analyses / month</li>
            </ul>
            <button onClick={() => navigate('/register')} className="w-full py-3 rounded-lg border-2 border-slate-900 dark:border-slate-500 text-slate-900 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              Get Started
            </button>
          </div>

          {/* ENTERPRISE PLAN (Card Central - Atualizado) */}
          <div className="bg-slate-900 dark:bg-blue-600 p-8 rounded-2xl shadow-2xl border border-slate-800 dark:border-blue-500 flex flex-col relative transform scale-105 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
            <div className="text-4xl font-bold text-white mb-6">$99<span className="text-lg text-slate-400 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8 text-left flex-1">
              <li className="flex items-center gap-3 text-slate-300"><Shield size={18} className="text-blue-400"/> Unlimited Document Analysis</li>
              <li className="flex items-center gap-3 text-slate-300"><Zap size={18} className="text-blue-400"/> Advanced AI Reasoning</li>
              <li className="flex items-center gap-3 text-slate-300"><Star size={18} className="text-blue-400"/> Priority Support (24/7)</li>
            </ul>
            
            <button 
              onClick={handleCheckout}
              disabled={loading || user?.isPro}
              className="w-full py-3 rounded-lg bg-blue-600 dark:bg-white text-white dark:text-blue-600 font-bold hover:bg-blue-700 dark:hover:bg-slate-100 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (user?.isPro ? 'Current Plan' : 'Upgrade Now')}
            </button>
          </div>

          {/* CUSTOM PLAN (Card Direito - Mantido igual) */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col hover:scale-105 transition duration-300">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Custom Firm</h3>
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Let's Talk</div>
            <ul className="space-y-4 mb-8 text-left flex-1">
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300"><Check size={18} className="text-blue-500"/> Multi-seat License</li>
            </ul>
            <button className="w-full py-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold hover:border-slate-900 hover:text-slate-900 dark:hover:border-white dark:hover:text-white transition">
              Contact Sales
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Pricing;