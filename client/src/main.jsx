import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext'; // 📍 1. IMPORTAR AQUI
import posthog from 'posthog-js';

// Inicialização do PostHog (Só inicia se não for placeholder)
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
if (posthogKey && !posthogKey.includes('PLACEHOLDER')) {
    posthog.init(posthogKey, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
        autocapture: false,
        capture_pageview: false
    });
} else {
    console.log("Analytics: PostHog desativado (Ambiente de Dev/Sem chave)");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 📍 2. ENVOLVER O APP COM O THEME PROVIDER */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);