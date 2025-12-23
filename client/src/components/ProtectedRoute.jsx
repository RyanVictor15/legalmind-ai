import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, loading } = useAuth();

  // 1. Wait for Auth Check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // 2. Not Logged In -> Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Admin Check
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Allowed
  return <Outlet />;
};

export default ProtectedRoute;