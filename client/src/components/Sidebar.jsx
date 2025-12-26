import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Scale, User, LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/fechar menu
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: History, label: 'Meus Casos', path: '/history' },
    { icon: Scale, label: 'Jurisprudência', path: '/jurisprudence' },
    { icon: User, label: 'Meu Perfil', path: '/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Botão Hambúrguer (Só aparece no celular) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md shadow-lg md:hidden border border-slate-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Fundo Escuro (Overlay) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Lateral Deslizante */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white 
          transform transition-transform duration-300 ease-out shadow-2xl border-r border-slate-800
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:shadow-none
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center justify-center border-b border-slate-800 bg-slate-950/50">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              LegalMind AI
            </h1>
          </div>

          {/* Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // Fecha o menu ao clicar
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive(item.path) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer (User + Logout) */}
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-900/50">
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0">
                  <span className="text-sm font-bold text-blue-400">{user?.firstName?.charAt(0) || 'D'}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">Dr(a). {user?.firstName}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-400"><LogOut size={18} /></button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;