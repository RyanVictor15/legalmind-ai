import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ floating = false }) => {
  const { theme, toggleTheme } = useTheme();

  // Estilo Base
  const baseClasses = "p-2 rounded-full transition-all duration-300 focus:outline-none border shadow-md flex items-center justify-center";
  
  // Estilo de Cores
  const colorClasses = "bg-white text-slate-800 hover:bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700 dark:border-slate-600";

  // Estilo Flutuante (Fixo no canto) vs Estilo Normal (No menu)
  const positionClasses = floating 
    ? "fixed bottom-6 right-6 z-50 w-12 h-12 shadow-xl" 
    : "";

  return (
    <button
      onClick={toggleTheme}
      className={`${baseClasses} ${colorClasses} ${positionClasses}`}
      title={theme === 'dark' ? "Mudar para Claro" : "Mudar para Escuro"}
      aria-label="Alternar Tema"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;