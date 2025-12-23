import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recoverUser = async () => {
      const storedUser = localStorage.getItem('userInfo');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Configura o token imediatamente para evitar delay
          if (parsedUser.token) {
             api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
          }
        } catch (error) {
          console.error('Erro ao processar usuário:', error);
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };

    recoverUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/users/login', { email, password });

    if (data.token) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};