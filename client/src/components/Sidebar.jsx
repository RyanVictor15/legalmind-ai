import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Inline Icons
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const Sidebar = ({ isOpen, setIsSidebarOpen }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Nova Análise', path: '/upload', icon: '📁' },
    { name: 'Histórico', path: '/history', icon: 'clock' },
    { name: 'Perfil', path: '/profile', icon: 'user' },
    { name: 'Preços', path: '/pricing', icon: 'credit-card' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-indigo-600 text-white safe-top">
          <span className="text-2xl font-bold tracking-wider">JusAnalytica</span>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden p-1 rounded hover:bg-indigo-500 focus:outline-none"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                ${isActive(item.path) 
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50 safe-bottom">
           <Link to="/login" className="flex items-center text-gray-500 hover:text-red-600 transition-colors text-sm font-medium">
             <span className="mr-2">🚪</span> Sair
           </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;