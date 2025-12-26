import axios from 'axios';

// Define a URL da API (usa a do Render se estiver em produção)
const API_URL = import.meta.env.VITE_API_URL || 'https://legalmind-api.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutos para não dar timeout na IA
});

// Adiciona o Token automaticamente (se o usuário estiver logado)
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

// --- FUNÇÕES EXPORTADAS (Isso corrige o erro do Dashboard) ---

export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

// AQUI ESTÁ A FUNÇÃO QUE FALTAVA:
export const analyzeDocument = async (formData) => {
  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;