import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'; // FASE 2: Feedback Visual Global

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History'; // Novo (Renomeado de Meus Casos)
import Jurisprudence from './pages/Jurisprudence';

// Componente de Rota Protegida
const PrivateRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  
  return authenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* FASE 2: Configuração Global dos Toasts (Notificações) */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: { background: '#10B981', color: 'white' }, // Verde
            },
            error: {
              style: { background: '#EF4444', color: 'white' }, // Vermelho
            },
          }} 
        />
        
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas Privadas */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/jurisprudence" element={<PrivateRoute><Jurisprudence /></PrivateRoute>} />
          
          {/* Redirecionamento Padrão */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;