import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle, Scale, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(''); 
  
  const [step, setStep] = useState(1); // 1 = Senha, 2 = Código 2FA
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
        // PASSO 1: Enviar senha e checar se precisa de 2FA
        const { data } = await api.post('/users/login', { email, password });
        
        if (data.requires2FA) {
          setStep(2); 
          toast.success("Código de segurança enviado para seu e-mail!");
        } else {
            finalizeLogin(data);
        }

      } else {
        // PASSO 2: Verificar Código 2FA
        const { data } = await api.post('/users/verify-2fa', { email, code });
        finalizeLogin(data);
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Erro de conexão.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const finalizeLogin = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data);
    toast.success(`Bem-vindo de volta, ${data.firstName}!`);
    navigate(data.isAdmin ? '/admin' : '/dashboard');
  }

  return (
    // CORREÇÃO: Classes 'dark:' adicionadas para reagir ao tema
    <div className="min-h-screen flex items-center justify-center px-4 font-inter transition-colors duration-300 bg-slate-50 dark:bg-slate-900">
      
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl border transition-colors duration-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        
        <div className="text-center mb-8">
          <Link to="/">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 shadow-lg cursor-pointer hover:scale-105 transition transform bg-slate-900 dark:bg-slate-700 text-white">
               {step === 1 ? <Scale size={24} /> : <ShieldCheck size={24} />}
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            {step === 1 ? 'Acessar Conta' : 'Verificação'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {step === 1 ? 'Entre no LegalMind AI' : `Digite o código enviado para ${email}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600"
                    placeholder="voce@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-end mt-2">
                    <Link to="/forgot-password" class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Esqueceu a senha?</Link>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <label className="block text-sm font-bold mb-2 text-center text-slate-700 dark:text-slate-300">Código de 6 Dígitos</label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  className="w-full text-center text-2xl tracking-widest py-4 rounded-lg border-2 outline-none transition font-mono bg-white dark:bg-slate-900 border-blue-100 dark:border-slate-600 focus:border-blue-600 text-slate-800 dark:text-white"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Apenas números
                  autoFocus
                />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-3.5 rounded-lg transition-all transform hover:scale-[1.02] flex justify-center items-center disabled:opacity-70 shadow-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : (step === 1 ? "Entrar" : "Verificar")}
          </button>
        </form>

        {step === 1 && (
            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Não tem conta? <Link to="/register" className="font-bold hover:underline text-blue-600 dark:text-blue-400">Registre-se grátis</Link>
            </p>
        )}
        
        {step === 2 && (
            <button onClick={() => setStep(1)} className="mt-6 w-full text-center text-sm hover:text-slate-800 text-slate-500 dark:text-slate-400 dark:hover:text-white">
                Voltar para Login
            </button>
        )}
      </div>
    </div>
  );
}