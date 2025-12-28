import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- IMPORTANTE: Trazendo de volta o Contexto de Autenticação ---
import { AuthProvider } from './context/AuthContext'; 

// Importação das Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Jurisprudence from './pages/Jurisprudence';

// Componente para rotas protegidas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // Se não tem token, manda pro login
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    // 1. O AuthProvider precisa envolver TUDO
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b', 
              color: '#fff',
              border: '1px solid #334155',
            },
          }}
        />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas Protegidas */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          {/* Rota /analyze aponta para o Dashboard */}
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

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;