import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Scale, User, LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Controle de abrir/fechar
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
      {/* Botão Flutuante (Apenas Mobile) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md shadow-lg border border-slate-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Fundo Escuro ao abrir (Overlay) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* A Barra Lateral em si */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white border-r border-slate-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static 
        `}
      >
        <div className="flex flex-col h-full">
          {/* Cabeçalho do Menu */}
          <div className="h-20 flex items-center justify-center border-b border-slate-800 bg-slate-950/50">
            <h1 className="text-xl font-bold text-blue-400">LegalMind AI</h1>
          </div>

          {/* Links de Navegação */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // Fecha ao clicar (Mobile)
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path) 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Rodapé (Usuário) */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <span className="text-xs font-bold text-blue-400">{user?.firstName?.charAt(0) || 'U'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white truncate w-24">Dr. {user?.firstName}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;