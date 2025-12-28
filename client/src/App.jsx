import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Importando os contextos que vi nos seus arquivos
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; 

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Jurisprudence from './pages/Jurisprudence';

// --- A CORREÇÃO REAL ---
// Seu AuthContext salva 'userInfo', não 'token'. 
// Corrigi isso aqui para parar de te chutar para o login.
const PrivateRoute = ({ children }) => {
  const userStored = localStorage.getItem('userInfo');
  return userStored ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    // ThemeProvider envolve tudo (para o botão Sol/Lua funcionar)
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
          
          {/* Classes de cor dinâmicas baseadas no seu Tailwind */}
          <div className="min-h-screen font-inter antialiased transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              {/* Mantive essa rota para o menu não quebrar */}
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

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;