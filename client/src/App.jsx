import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <--- IMPORTANTE

// Importação das Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalyzeDocument from './pages/AnalyzeDocument';
import History from './pages/History';
import Jurisprudence from './pages/Jurisprudence';

// Componente para rotas protegidas (Só entra se tiver logado)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      {/* Configuração Global das Notificações 
         Isso faz o toast.success funcionar em qualquer página
      */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b', // slate-800
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
        
        <Route path="/analyze" element={
          <PrivateRoute>
            <AnalyzeDocument />
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

        {/* Rota padrão redireciona para Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;