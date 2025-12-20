import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Evita redirecionar antes de carregar

  useEffect(() => {
    // Ao iniciar o site, verifica se já existe login salvo
    const recoverUser = async () => {
      const storedUser = localStorage.getItem('userInfo');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Configura o token no Axios para todas as chamadas futuras
        api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      }
      
      setLoading(false); // Terminou de carregar
    };

    recoverUser();
  }, []);

  const login = async (email, password) => {
    // Faz o login na API
    const { data } = await api.post('/users/login', { email, password });

    // Se der certo, salva no estado e no armazenamento local
    localStorage.setItem('userInfo', JSON.stringify(data));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    api.defaults.headers.common['Authorization'] = undefined;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar a autenticação em qualquer lugar
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};