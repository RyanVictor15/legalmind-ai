import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Scale, 
  UserCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle'; 

// Adicionamos a prop 'onMobileClick' recebida do Layout
const Sidebar = ({ onMobileClick }) => {
  const location = useLocation();
  const { logout } = useAuth(); 

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/analyze', icon: FileText, label: 'Nova Análise' },
    { path: '/history', icon: History, label: 'Histórico' },
    { path: '/jurisprudence', icon: Scale, label: 'Jurisprudência' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (logout) {
        logout();
    } else {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* HEADER DA SIDEBAR */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
           <Scale className="text-blue-600" />
           <span>LegalMind</span>
        </div>
        {/* Toggle de Tema na Sidebar (Desktop/Mobile) */}
        <ThemeToggle />
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            // AQUI É A MUDANÇA: Fecha o menu ao clicar (importante pro mobile)
            onClick={onMobileClick}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
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

      {/* USER INFO & LOGOUT */}
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
          className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;