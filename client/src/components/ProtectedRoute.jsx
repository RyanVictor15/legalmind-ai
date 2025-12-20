import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // O porteiro verifica: "Tem crachá salvo no bolso (navegador)?"
  const userInfo = localStorage.getItem('userInfo');

  // Se tem crachá, deixa entrar (Outlet).
  // Se não tem, chuta para a Home (Navigate to="/").
  return userInfo ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;