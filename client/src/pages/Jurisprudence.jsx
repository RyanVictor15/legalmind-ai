import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, BookOpen, ChevronRight, Scale } from 'lucide-react';

const Jurisprudence = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dados falsos para visualização (enquanto não conectamos no backend real desta parte)
  const results = [
    { id: 1, title: "Dano Moral em Atraso de Voo", court: "STJ", date: "12/05/2023", summary: "Entendimento consolidado de que atraso superior a 4h gera dano in re ipsa." },
    { id: 2, title: "Inversão do Ônus da Prova", court: "TJSP", date: "10/02/2024", summary: "Aplicabilidade do CDC em contratos bancários para inverter ônus." },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* ESPAÇADOR MOBILE (Para o menu não ficar em cima) */}
        <div className="md:hidden h-16 w-full shrink-0"></div>

        <div className="p-4 md:p-8 w-full max-w-5xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Scale className="text-blue-500" /> Jurisprudência
            </h1>
            <p className="text-slate-400 text-sm mt-1">Busque precedentes para fortalecer sua tese.</p>
          </header>

          {/* Barra de Busca */}
          <div className="relative mb-8">
            <input 
              type="text" 
              placeholder="Ex: Dano moral atraso de voo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          </div>

          {/* Lista de Resultados */}
          <div className="space-y-4">
            {results.map((item) => (
              <div key={item.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all group cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex gap-3 mt-2 text-xs text-slate-400">
                      <span className="bg-slate-800 px-2 py-1 rounded">{item.court}</span>
                      <span className="flex items-center gap-1"><BookOpen size={12}/> {item.date}</span>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Jurisprudence;