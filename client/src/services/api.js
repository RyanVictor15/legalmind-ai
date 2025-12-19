import axios from 'axios';

// Se estivermos em Produção (Internet), usa o Render.
// Se estivermos desenvolvendo (PC), usa o Localhost.
const baseURL = import.meta.env.MODE === 'production' 
  ? 'https://legalmind-api.onrender.com/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

// Interceptor para adicionar o Token automaticamente
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;