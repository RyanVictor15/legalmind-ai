import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(''); // Para 2FA
  const [showPassword, setShowPassword] = useState(false);
  
  const [step, setStep] = useState(1); // 1 = Login, 2 = 2FA
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  // CORREÇÃO: Define o destino padrão como '/dashboard' em vez de '/'
  const from = location.state?.from?.pathname || '/dashboard';

  // Função para finalizar o login e redirecionar
  const finalizeLogin = (data) => {
    // 1. Salva no LocalStorage
    localStorage.setItem('userInfo', JSON.stringify(data));
    
    // 2. Configura o Token no Axios globalmente
    if (data.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }

    // 3. Atualiza o Contexto
    setUser(data);
    
    // 4. Feedback e Redirecionamento
    toast.success(`Bem-vindo de volta, ${data.firstName}!`);
    navigate(from, { replace: true }); // <--- AQUI ESTAVA O PROBLEMA
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (step === 1) {
        // PASSO 1: Autenticação Básica
        const { data } = await api.post('/users/login', { email, password });
        
        if (data.requires2FA) {
          setStep(2);
          toast.success("Código de verificação enviado para seu e-mail.");
        } else {
          finalizeLogin(data);
        }

      } else {
        // PASSO 2: Verificação 2FA
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-inter transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Login</h1>
          <p className="text-slate-500 dark:text-slate-400">Acesse sua conta LegalMind</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {step === 1 ? (
            <>
              {/* Campo Email */}
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

              {/* Campo Senha */}
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
            /* Campo Código 2FA */
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