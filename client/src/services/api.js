import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // 60 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // CORREÇÃO: Busca o token dentro do objeto userInfo
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Evita loop infinito de reload se já estiver no login
      if (!window.location.pathname.includes('/login')) {
        console.warn('Sessão expirada.');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;