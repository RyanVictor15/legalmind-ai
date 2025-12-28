import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// 1. IMPORTAÇÃO DOS CONTEXTOS (Obrigatório importar os dois)
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; 

// Importação das Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Jurisprudence from './pages/Jurisprudence';

// Rota Protegida
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // Se não tiver token, joga para o Login
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    // 2. A ORDEM IMPORTA: ThemeProvider > AuthProvider > Router
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#334155', 
                color: '#fff',
              },
            }}
          />
          
          {/* 3. CORREÇÃO DE CORES:
             - bg-slate-50 (Fundo claro padrão)
             - dark:bg-slate-950 (Fundo escuro no modo Dark)
             - text-slate-900 (Texto escuro no modo Claro)
             - dark:text-slate-100 (Texto claro no modo Dark)
          */}
          <div className="min-h-screen font-inter antialiased transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              {/* Rota Analyze redireciona para Dashboard (para manter o menu funcionando) */}
              <Route path="/analyze" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/history" element={
                <PrivateRoute>
                  <History />
                </PrivateRoute>
              } />

              <Route path="/jurisprudence" element={
                <PrivateRoute>
                  <Jurisprudence />
                </PrivateRoute>
              } />

              {/* Rota 404 redireciona para Login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;