import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Scale, 
  LogOut, 
  UserCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle'; 

const Sidebar = ({ onMobileClick }) => {
  const location = useLocation();
  const { user, logout } = useAuth(); // Recuperando user e logout do contexto

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    // "Nova Análise" removida daqui para não ficar redundante, já que o Dashboard tem o upload principal
    { path: '/history', icon: History, label: 'Meus Casos' }, 
    { path: '/jurisprudence', icon: Scale, label: 'Jurisprudência' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Fecha o menu mobile se estiver aberto
    if (onMobileClick) onMobileClick();
    
    if (logout) {
        logout();
    } else {
        // Fallback de segurança (conforme seu código original)
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 font-bold text-xl text-slate-900 dark:text-white tracking-tight">
           <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
             <Scale className="text-white" size={20} />
           </div>
           <span>LegalMind</span>
        </div>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onMobileClick} // Fecha o menu no mobile ao clicar
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive(item.path) 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* FOOTER (Theme & User) */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        
        <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modo Escuro</span>
            <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 shrink-0">
             <UserCircle size={20} />
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
             <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {user?.firstName || 'Doutor(a)'}
             </p>
             <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.isPro ? 'Plano Pro' : 'Plano Gratuito'}
             </p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;