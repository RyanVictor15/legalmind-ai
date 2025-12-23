import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
// CORREÇÃO DO CAMINHO (O erro do Build era aqui):
import { useAuth } from '../context/AuthContext'; 

const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // 1. Se não estiver logado -> Manda pro Login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Se a rota for só para Admin e o usuário não for admin -> Manda pro Dashboard comum
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;