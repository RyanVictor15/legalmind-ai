import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  History, 
  Scale, 
  User, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

const Sidebar = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/fechar menu mobile

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/history', icon: <History size={20} />, label: 'Meus Casos' },
    // { path: '/jurisprudence', icon: <Scale size={20} />, label: 'Jurisprudência' }, // (Futuro)
    // { path: '/profile', icon: <User size={20} />, label: 'Meu Perfil' }, // (Futuro)
  ];

  const isActive = (path) => location.pathname === path;

  // Função para fechar o menu ao clicar num link (UX Mobile)
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* --- BOTÃO HAMBÚRGUER (SÓ MOBILE) --- */}
      {/* Fica flutuando no topo esquerdo quando em telas pequenas */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg border border-slate-700 hover:bg-slate-700 transition-colors"
        aria-label="Abrir Menu"
      >
        <Menu size={24} />
      </button>

      {/* --- OVERLAY ESCURO (SÓ MOBILE) --- */}
      {/* Clicar fora fecha o menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- A BARRA LATERAL (SIDEBAR) --- */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        flex flex-col h-screen
      `}>
        
        {/* Cabeçalho do Menu */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              LegalMind AI
            </h1>
            <p className="text-xs text-slate-500">Inteligência Jurídica</p>
          </div>
          
          {/* Botão Fechar (Só Mobile) */}
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Rodapé do Menu (Logout) */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Sair da Conta</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;