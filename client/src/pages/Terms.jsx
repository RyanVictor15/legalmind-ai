import React from 'react';
import { ArrowLeft, Scale, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white font-inter text-slate-900">
      <div className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-800">
            <Scale className="text-blue-600" /> LegalMind AI
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar para Home
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-8">Termos de Uso</h1>
        <div className="prose prose-slate max-w-none space-y-8">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex gap-4">
            <ShieldAlert className="text-blue-600 shrink-0" size={24} />
            <div>
              <h3 className="text-blue-900 font-bold text-lg m-0">Isenção de Responsabilidade</h3>
              <p className="text-blue-800 text-sm mt-2 leading-relaxed">
                A IA não substitui um advogado. Verifique todas as informações.
              </p>
            </div>
          </div>
          <p>Ao usar o sistema, você concorda com nossos termos...</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;