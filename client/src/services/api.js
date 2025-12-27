import axios from 'axios';

// Define a URL base (Local ou Render)
const API_URL = import.meta.env.VITE_API_URL || 'https://legalmind-api.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutos para processar arquivos grandes
});

// INTERCEPTOR (Crítico: Pega o token do jeito que seu AuthContext salva)
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo'); // Seu sistema usa 'userInfo'
  if (userInfo) {
    const parsed = JSON.parse(userInfo);
    if (parsed.token) config.headers.Authorization = `Bearer ${parsed.token}`;
  }
  return config;
});

// FUNÇÃO DE ANÁLISE (Exportada para o Dashboard usar)
export const analyzeDocument = async (formData) => {
  const { data } = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

// Funções de Auth (Mantidas para não quebrar login/registro)
export const loginUser = async (credentials) => {
  const { data } = await api.post('/users/login', credentials);
  return data;
};

export const registerUser = async (userData) => {
  const { data } = await api.post('/users/register', userData);
  return data;
};

export default api;