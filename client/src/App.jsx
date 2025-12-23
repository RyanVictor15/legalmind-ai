import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // <--- OBRIGATÓRIO PARA AS CORES

// Components
import ThemeToggle from './components/ThemeToggle';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Pricing from './pages/Pricing';
import Jurisprudence from './pages/Jurisprudence';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function App() {
  return (
    <BrowserRouter>
      {/* 1. Provedor de Autenticação (Login) */}
      <AuthProvider>
        
        {/* 2. Provedor de Tema (Cores Claro/Escuro) */}
        <ThemeProvider>
          
          {/* Notificações Toast */}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

          {/* Botão Flutuante de Tema (Aparece em TODAS as telas) */}
          <ThemeToggle floating={true} />

          <Routes>
            {/* --- ROTAS PÚBLICAS --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* --- ROTAS PROTEGIDAS (Requer Login) --- */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            
            <Route path="/jurisprudence" element={
              <ProtectedRoute>
                <Jurisprudence />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/pricing" element={
              <ProtectedRoute>
                <Pricing />
              </ProtectedRoute>
            } />
            
            {/* --- ROTA ADMIN (Requer Login + Permissão Admin) --- */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* --- ROTA 404 (Qualquer outra URL) --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;