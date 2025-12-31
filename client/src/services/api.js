import axios from 'axios';

// Cria a instância do Axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Em produção, isso mudará
  timeout: 120000, // FASE 3 (Adiantado): Aumentado para 120s para suportar IA
});

// INTERCEPTOR DE REQUISIÇÃO (Anexa o token automaticamente)
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR DE RESPOSTA (FASE 2: Gerenciamento de Erros 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o erro for 401 (Não autorizado / Token expirado)
    if (error.response && error.response.status === 401) {
      console.warn("Sessão expirada. Redirecionando para login...");
      
      // Limpa dados locais
      localStorage.removeItem('userInfo');
      
      // Redireciona para login (força bruta para garantir limpeza de estado)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;