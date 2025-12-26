import axios from 'axios';

// Define a URL base. Se não houver variável de ambiente, usa o Render.
const API_URL = import.meta.env.VITE_API_URL || 'https://legalmind-api.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout de 3 minutos para evitar erro na IA
  timeout: 180000, 
});

// Interceptor: Adiciona o Token de segurança automaticamente
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const { token } = JSON.parse(user);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- FUNÇÕES EXPORTADAS (Essenciais para o Dashboard) ---

export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

// CORREÇÃO: A função que estava faltando e causava o erro
export const analyzeDocument = async (formData) => {
  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Obrigatório para arquivos
    },
  });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/jurisprudence/history');
  return response.data;
};

export default api;