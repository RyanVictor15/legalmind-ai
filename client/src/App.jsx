import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Importação das Páginas QUE EXISTEM
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
// Removi o AnalyzeDocument que não existe
import History from './pages/History';
import Jurisprudence from './pages/Jurisprudence';

// Componente para rotas protegidas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
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
        
        {/* Rota do Dashboard (Onde a análise acontece) */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* CORREÇÃO: Como a análise é feita no Dashboard, 
           se clicar em "/analyze" no menu, ele vai para o Dashboard também.
        */}
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
  );
}

export default App;