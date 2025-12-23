import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ floating = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (floating) {
    return (
      <button
        onClick={toggleTheme}
        className={`fixed bottom-6 left-6 z-50 p-3 rounded-full shadow-xl transition-all duration-300 border ${
          isDark 
            ? 'bg-slate-800 text-yellow-400 border-slate-700 hover:bg-slate-700' 
            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
        }`}
        aria-label="Alternar Tema"
        title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
      >
        {isDark ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    );
  }

  // Versão para Navbar (não flutuante)
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${
        isDark 
          ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
      aria-label="Alternar Tema"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;