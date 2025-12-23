import axios from 'axios';

// Create Axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // MUDANÇA AQUI: De 10000 (10s) para 60000 (60s)
  timeout: 60000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. REQUEST INTERCEPTOR (Inject Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR (Global Error Handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (Token Expired/Invalid)
    if (error.response && error.response.status === 401) {
      console.warn('⚠️ Session expired. Redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optional: Force reload or redirect using window.location if not inside a Component
      // window.location.href = '/login';
    }
    
    // Pass the error to the calling component
    return Promise.reject(error);
  }
);

export default api;