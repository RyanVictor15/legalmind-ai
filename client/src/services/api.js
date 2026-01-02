import axios from 'axios';

// Cria a instância do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 120000, // 120s para suportar IA
});

// INTERCEPTOR DE REQUISIÇÃO (Anexa o token automaticamente)
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR DE RESPOSTA (Gerenciamento de Erros 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Evita loop infinito de redirecionamento se já estiver no login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- FUNÇÕES ESPECÍFICAS EXPORTADAS (O QUE FALTAVA) ---

export const analyzeDocument = async (formData) => {
  // O Axios detecta FormData automaticamente e configura o Content-Type correto
  const response = await api.post('/analyze', formData);
  return response.data;
};

export default api;