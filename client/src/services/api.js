import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 120000,
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const analyzeDocument = async (formData) => {
  const response = await api.post('/analyze', formData);
  return response.data;
};

// 📍 NOVA FUNÇÃO: Busca o resultado atualizado
export const getAnalysisResult = async (id) => {
  const response = await api.get(`/analyze/${id}`);
  return response.data;
};

export default api;