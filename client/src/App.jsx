import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Importe a nova Home aqui
import Home from './pages/Home'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Jurisprudence from './pages/Jurisprudence';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* ROTA PRINCIPAL: Agora aponta para a Home */}
        <Route path="/" element={<Home />} />
        
        {/* Outras rotas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* NOVAS ROTAS AQUI */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* ---------------- */}
        
        {/* Rotas Protegidas (Dashboard, etc) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/jurisprudence" element={<ProtectedRoute><Jurisprudence /></ProtectedRoute>} />
        
        {/* Redirecionamento de segurança para rotas desconhecidas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// Pequeno componente para proteger rotas (se não tiver logado, manda pro login)
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('userInfo');
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default App;