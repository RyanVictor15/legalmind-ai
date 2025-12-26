import axios from 'axios';

// URL Base: Usa a variável de ambiente ou o localhost se não existir
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutos (Necessário para leitura de PDF)
});

// Interceptor para injetar o Token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo'); // O nome que você usa é 'userInfo'
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      } catch (e) {
        console.error("Erro ao ler token", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- FUNÇÕES DE API ---

export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

// A FUNÇÃO CRÍTICA
export const analyzeDocument = async (formData) => {
  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // OBRIGATÓRIO para upload
    },
  });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/analyze/history');
  return response.data; // Retorna { status: 'success', data: [...] }
};

export default api;