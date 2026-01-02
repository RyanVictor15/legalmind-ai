import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import posthog from 'posthog-js'; // 📍 IMPORTAR

// 📍 INICIALIZAÇÃO DO POSTHOG
// (Substitua a chave abaixo pela sua chave do projeto PostHog - é grátis até 1M eventos)
// Se não tiver chave agora, o código não quebra, apenas avisa no console.
posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_TESTE_PLACEHOLDER', {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    autocapture: false, // Desligamos autocapture para focar em eventos manuais importantes
    capture_pageview: false // Vamos capturar manualmente se usarmos router, ou true para automático
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);