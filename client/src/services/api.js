// client/src/services/api.js
import axios from 'axios';

// Define o endereço base do Backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Em produção, isso muda sozinho
});

// Interceptador: Adiciona o Token automaticamente em TODAS as requisições
api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export default api;