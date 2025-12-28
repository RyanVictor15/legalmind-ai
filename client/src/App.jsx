import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contextos
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; 

// Componentes Globais
import ThemeToggle from './components/ThemeToggle'; // <--- O RESPONSÁVEL PELO SOL/LUA

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Jurisprudence from './pages/Jurisprudence';

// Rota Protegida (Corrigida para usar a lógica do seu AuthContext)
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900" />;
  
  // Verifica se tem usuário. Se não, manda pro Login.
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
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
          
          {/* AQUI ESTÁ A CORREÇÃO:
             Colocando o ThemeToggle aqui, ele aparece em TODAS as páginas (Login, Register, Home),
             sem você precisar editar os arquivos delas.
          */}
          <ThemeToggle floating={true} />

          {/* Container Global de Cores */}
          <div className="min-h-screen font-inter antialiased transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <Routes>
              {/* Rota da Home (Página Inicial) */}
              <Route path="/" element={<Home />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Rotas do Sistema (Protegidas) */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
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

              {/* Rota de Erro (404) volta para Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;