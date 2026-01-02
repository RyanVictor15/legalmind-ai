import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const from = location.state?.from?.pathname || '/dashboard';

  // 📍 NOVO: Captura o token do Google na URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const socialAuthData = params.get('social_auth');

    if (socialAuthData) {
      try {
        const userData = JSON.parse(decodeURIComponent(socialAuthData));
        finalizeLogin(userData);
      } catch (e) {
        console.error("Erro ao processar login social", e);
        toast.error("Falha no login com Google");
      }
    }
  }, [location]);

  const finalizeLogin = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    if (data.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    setUser(data);
    toast.success(`Bem-vindo, ${data.firstName}!`);
    navigate(from, { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (step === 1) {
        const { data } = await api.post('/users/login', { email, password });
        if (data.requires2FA) {
          setStep(2);
          toast.success("Código enviado para seu e-mail.");
        } else {
          finalizeLogin(data);
        }
      } else {
        const { data } = await api.post('/users/verify-2fa', { email, code });
        finalizeLogin(data);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  // 📍 URL do Backend para OAuth
  const handleGoogleLogin = () => {
    // Em produção, isso deve apontar para a URL da sua API
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-inter transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Login</h1>
          <p className="text-slate-500 dark:text-slate-400">Acesse sua conta LegalMind</p>
        </div>

        {/* 📍 BOTÃO GOOGLE */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{ display: 'none' }}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-medium py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition mb-6 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.18 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Entrar com Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">ou entre com e-mail</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Senha</label>
                    <Link to="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Esqueceu a senha?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="animate-fade-in-up">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 text-center">Código de Segurança</label>
                <input
                  type="text"
                  maxLength="6"
                  className="w-full text-center text-2xl tracking-widest py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition font-mono"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
                <p className="text-center text-xs text-slate-500 mt-2">Verifique seu e-mail</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition flex justify-center items-center disabled:opacity-70 shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : (step === 1 ? "Entrar" : "Verificar e Entrar")}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Não tem uma conta?{' '}
            <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Registre-se grátis
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}