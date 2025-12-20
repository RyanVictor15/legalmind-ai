import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4 text-center">
      <AlertTriangle size={64} className="text-yellow-500 mb-6" />
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Página não encontrada</h2>
      <p className="text-slate-400 max-w-md mb-8">
        Desculpe, o endereço que você digitou não existe ou foi movido.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}