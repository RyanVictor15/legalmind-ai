import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderClock, // Ícone melhor para "Meus Casos"
  Scale, 
  UserCircle,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle'; 

const Sidebar = ({ onMobileClick }) => {
  const location = useLocation();
  const { logout, user } = useAuth(); 

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    // Renomeado de "Histórico" para "Meus Casos" para fazer mais sentido
    { path: '/history', icon: FolderClock, label: 'Meus Casos' },
    { path: '/jurisprudence', icon: Scale, label: 'Jurisprudência' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (logout) logout();
    else {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
           <Scale className="text-blue-600" size={24} />
           <span>LegalMind</span>
        </div>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onMobileClick}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive(item.path) 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* FOOTER (Theme + User) */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
        
        {/* Toggle de Tema Centralizado */}
        <div className="flex justify-between items-center px-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Aparência</span>
            <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs">
             {user?.firstName?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden flex-1">
             <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.firstName || 'Usuário'}
             </p>
             <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
             </p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition-colors"
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