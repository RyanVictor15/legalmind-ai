import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Scale, 
  LogOut, 
  Menu, 
  X, 
  UserCircle 
} from 'lucide-react';

// Seu componente original de tema
import ThemeToggle from './ThemeToggle'; 

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/analyze', icon: FileText, label: 'Nova Análise' },
    { path: '/history', icon: History, label: 'Histórico' },
    { path: '/jurisprudence', icon: Scale, label: 'Jurisprudência' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // CORREÇÃO: Limpa a chave correta do seu sistema
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Header Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-50 transition-colors duration-300">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
          <Scale className="text-blue-600 dark:text-blue-500" size={24} />
          <span>LegalMind</span>
        </div>
        
        <div className="flex items-center gap-3">
           {/* Seu botão de tema */}
           <div className="scale-90">
             <ThemeToggle />
           </div>
           
           <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
           >
             {isOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </div>

      {/* Fundo escuro Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        pt-16 md:pt-0
      `}>
        
        {/* Logo Desktop */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 hidden md:flex">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
             <Scale className="text-blue-600 dark:text-blue-500" size={24} />
             <span>LegalMind</span>
          </div>
          <div className="scale-90">
             <ThemeToggle />
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={`
                flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium
                ${isActive(item.path) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
               <UserCircle size={20} />
            </div>
            <div className="overflow-hidden">
               <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Usuário</p>
               <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Advogado</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors font-medium"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;