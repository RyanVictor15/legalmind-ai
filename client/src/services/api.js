import axios from 'axios';

// 1. Configuração Básica
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 120000, // 2 minutos (para a IA não dar timeout)
});

// 2. Interceptor (Coloca o Token automaticamente)
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

// 3. Interceptor de Erro (Desloga se o token for inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- FUNÇÕES QUE O DASHBOARD NOVO PRECISA ---

// Função A: Enviar o Arquivo
export const analyzeDocument = async (formData) => {
  const response = await api.post('/analyze', formData);
  return response.data;
};

// Função B: Buscar o Resultado (ERA ESSA QUE FALTAVA E CAUSOU A TELA BRANCA)
export const getAnalysisResult = async (id) => {
  const response = await api.get(`/analyze/${id}`);
  return response.data;
};

export default api;