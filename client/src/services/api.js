import axios from 'axios';

// 1. Configuração Base do Axios
// Tenta pegar a URL do .env, senão usa o localhost ou a URL do Render
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://legalmind-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutos (Importante para IA demorada)
});

// 2. Interceptor: Adiciona o Token em toda requisição automaticamente
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Funções de API Exportadas

// --- AUTENTICAÇÃO ---
export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

// --- ANÁLISE JURÍDICA (A função que estava faltando!) ---
export const analyzeDocument = async (formData) => {
  // Nota: formData precisa de headers especiais, mas o axios detecta automaticamente
  // quando passamos um objeto FormData.
  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Obrigatório para envio de arquivos
    },
  });
  return response.data;
};

// --- OUTRAS FUNÇÕES ---
export const getHistory = async () => {
  const response = await api.get('/jurisprudence/history'); // Ajuste conforme sua rota de histórico
  return response.data;
};

export default api;