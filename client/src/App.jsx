import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contextos
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; 

// Importação das Páginas
import Home from './pages/Home'; // <--- A PEÇA QUE FALTAVA
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Jurisprudence from './pages/Jurisprudence';

// Rota Protegida (Para Dashboard e afins)
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div />; // Espera carregar sem chutar o usuário
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
          
          {/* REMOVI AS DIVS DE COR AQUI.
             Agora o App é transparente. 
             A Home.jsx vai carregar com as cores dela.
             O Login.jsx vai carregar com as cores dele.
          */}
          
          <Routes>
            {/* --- ROTA INICIAL (HOME) --- */}
            {/* Agora ao abrir o site, ele mostra a Home, não o Login */}
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rotas Protegidas (Só entra com login) */}
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

            {/* Se digitar url errada, manda para Home em vez de Login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;