import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  Scale, 
  User, 
  LogOut, 
  Menu, 
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
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
      {/* --- BOTÃO MOBILE (HAMBURGUER) --- 
          Só aparece em telas pequenas (md:hidden) e fica fixo no topo
      */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md shadow-lg md:hidden hover:bg-slate-700 transition-colors"
        aria-label="Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* --- OVERLAY (FUNDO ESCURO) --- 
          Cria um fundo preto semitransparente quando o menu abre no celular
      */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- SIDEBAR PRINCIPAL --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white 
          transform transition-transform duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:shadow-none
        `}
      >
        <div className="flex flex-col h-full">
          
          {/* LOGO */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              LegalMind AI
            </h1>
          </div>

          {/* MENU ITENS */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // Fecha o menu ao clicar (no mobile)
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive(item.path) 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* RODAPÉ DO MENU */}
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-900/50">
            {/* Card de Plano (Visual) */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                  <Zap size={14} className="text-yellow-500" />
                </div>
                <span className="text-xs font-semibold text-yellow-500 tracking-wide uppercase">Plano Free</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">0/3 Análises usadas</p>
              <button className="w-full py-2 text-xs font-medium text-slate-900 bg-yellow-500 hover:bg-yellow-400 rounded-lg transition-colors shadow-lg shadow-yellow-900/20">
                Fazer Upgrade
              </button>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <span className="text-xs font-bold text-blue-400">
                    {user?.firstName?.charAt(0) || 'D'}
                  </span>
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-white truncate">
                    Dr(a). {user?.firstName || 'Usuário'}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate">
                    {user?.email || ''}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Sair"
              >
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