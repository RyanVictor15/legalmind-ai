import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      
      {/* 1. MÁSCARA ESCURA (Mobile Overlay) - Só aparece quando menu abre no celular */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR WRAPPER - Controla o deslize */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Passamos a função para fechar o menu quando clicar num link */}
        <Sidebar onMobileClick={() => setIsSidebarOpen(false)} />
      </div>

      {/* 3. CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER MOBILE (Só aparece em telas pequenas) */}
        <header className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-900 dark:text-white">LegalMind AI</span>
        </header>

        {/* Onde o Dashboard, History, etc. serão renderizados */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;