import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowLeft } from 'lucide-react';

const Pricing = () => {
  const navigate = useNavigate();

  const features = {
    free: [
      "3 Análises por mês",
      "Histórico de 7 dias",
      "Análise de Sentimento Básica",
      "Suporte via Email"
    ],
    pro: [
      "Análises Ilimitadas",
      "Histórico Vitalício",
      "Inteligência Artificial GPT-4",
      "Estratégia Jurídica Detalhada",
      "Cálculo de Probabilidade de Êxito",
      "Suporte Prioritário 24/7"
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
      
      {/* Botão Voltar */}
      <div className="max-w-7xl mx-auto mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={20} className="mr-2"/> Voltar ao Dashboard
        </button>
      </div>

      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-blue-600 font-semibold tracking-wide uppercase">Upgrade</h2>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900 sm:text-5xl">
          Escolha o plano ideal para seu escritório
        </h1>
        <p className="mt-4 text-xl text-slate-500">
          Desbloqueie o poder total da Inteligência Artificial nos seus processos.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* PLANO GRÁTIS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 transform hover:scale-105 transition duration-300">
          <h3 className="text-2xl font-bold text-slate-900">Iniciante</h3>
          <p className="text-slate-500 mt-2">Para advogados independentes.</p>
          <div className="my-8">
            <span className="text-5xl font-extrabold text-slate-900">R$ 0</span>
            <span className="text-slate-500">/mês</span>
          </div>
          <button className="w-full py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition">
            Seu Plano Atual
          </button>
          <ul className="mt-8 space-y-4">
            {features.free.map((item, index) => (
              <li key={index} className="flex items-center text-slate-600">
                <Check size={20} className="text-green-500 mr-3" /> {item}
              </li>
            ))}
            <li className="flex items-center text-slate-400">
              <X size={20} className="text-slate-300 mr-3" /> IA Avançada (GPT-4)
            </li>
          </ul>
        </div>

        {/* PLANO PRO (Destaque) */}
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-8 relative transform hover:scale-105 transition duration-300">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
            MAIS POPULAR
          </div>
          <h3 className="text-2xl font-bold text-white">Enterprise Pro</h3>
          <p className="text-slate-400 mt-2">Para escritórios de alta performance.</p>
          <div className="my-8">
            <span className="text-5xl font-extrabold text-white">R$ 97</span>
            <span className="text-slate-400">/mês</span>
          </div>
          <button className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-900/50">
            Fazer Upgrade Agora
          </button>
          <p className="text-center text-xs text-slate-500 mt-2">Garantia de 7 dias ou seu dinheiro de volta.</p>
          <ul className="mt-8 space-y-4">
            {features.pro.map((item, index) => (
              <li key={index} className="flex items-center text-slate-300">
                <div className="bg-blue-900 p-1 rounded-full mr-3">
                    <Check size={14} className="text-blue-400" /> 
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Pricing;