import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// IMPORTAÇÃO DOS CONTEXTOS
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; 

// Importação das Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Jurisprudence from './pages/Jurisprudence';

// --- CORREÇÃO DO LOGIN LOOP ---
const PrivateRoute = ({ children }) => {
  // O seu AuthContext salva como 'userInfo', não como 'token'
  const userStored = localStorage.getItem('userInfo');
  
  // Se tiver userInfo, permite entrar. Se não, manda pro Login.
  return userStored ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    // ThemeProvider PRECISA estar por fora para o Sol/Lua funcionar
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
          
          {/* REMOVIDAS as classes fixas de cor (bg-slate-950).
             Usamos as classes do Tailwind configuradas no seu index.css e ThemeContext 
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