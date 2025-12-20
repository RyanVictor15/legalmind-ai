// client/src/services/api.js
import axios from 'axios';

// Define se usa o Render (Nuvem) ou Localhost
const baseURL = import.meta.env.MODE === 'production' 
  ? 'https://legalmind-api.onrender.com/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

// O INTERCEPTADOR MÁGICO
api.interceptors.request.use((config) => {
  // 1. Tenta pegar os dados salvos
  const userInfo = localStorage.getItem('userInfo');
  
  if (userInfo) {
    const parsedUser = JSON.parse(userInfo);
    // 2. Se tiver token, cola no cabeçalho
    if (parsedUser.token) {
      config.headers.Authorization = `Bearer ${parsedUser.token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;