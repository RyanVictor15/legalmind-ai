import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('legalmind_cookie_consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('legalmind_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-6 animate-fade-in-up">
      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-slate-900 rounded-full text-blue-600 dark:text-blue-400 shrink-0">
            <Cookie size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Privacidade e Cookies</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Utilizamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa <Link to="/privacy" className="text-blue-600 hover:underline">Política de Privacidade</Link>.
            </p>
          </div>
        </div>
        <button onClick={acceptCookies} className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition">
          Aceitar
        </button>
      </div>
    </div>
  );
};
export default CookieBanner;