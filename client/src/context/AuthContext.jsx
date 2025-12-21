import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Prevents redirect before loading

  useEffect(() => {
    // Check for saved login on startup
    const recoverUser = async () => {
      const storedUser = localStorage.getItem('userInfo');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Set Axios token for all future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        } catch (error) {
          console.error('Failed to parse user info:', error);
          localStorage.removeItem('userInfo');
        }
      }
      
      setLoading(false); // Loading finished
    };

    recoverUser();
  }, []);

  const login = async (email, password) => {
    // Call Login API
    // Note: Backend returns user object directly on success based on current controller
    const { data } = await api.post('/users/login', { email, password });

    // Success: Save to state and local storage
    if (data.token) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data);
    }
    return data; // Return data to handle 2FA logic in component
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    // Optional: Navigate to login is handled by ProtectedRoute or component logic
  };

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth anywhere
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};