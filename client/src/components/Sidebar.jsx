import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, FileText, Shield, User, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', icon: <BarChart2 size={20} />, path: '/dashboard' },
    { label: 'Meus Casos', icon: <FileText size={20} />, path: '/history' },
    { label: 'Jurisprudência', icon: <Shield size={20} />, path: '/jurisprudence' },
    { label: 'Meu Perfil', icon: <User size={20} />, path: '/profile' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-white transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0 md:static md:flex flex-col h-screen shadow-2xl
    `}>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Legal<span className="text-blue-500">Mind</span> AI</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Enterprise</p>
        </div>
        {/* Botão fechar apenas no mobile */}
        <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div 
              key={item.path}
              onClick={() => { navigate(item.path); setIsOpen(false); }} 
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition font-medium
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
            >
              {item.icon} <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <button onClick={logout} className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition text-sm w-full font-medium p-2 hover:bg-slate-800 rounded-lg">
          <LogOut size={16} /> Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;