import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { Mail, Lock, Loader2, AlertCircle, Scale, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(''); // Novo Estado para o Código
  
  const [step, setStep] = useState(1); // 1 = Senha, 2 = Código 2FA
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
        // PASSO 1: Enviar senha e pedir código
        const { data } = await api.post('/users/login', { email, password });
        
        if (data.requires2FA) {
          setStep(2); // Muda a tela para pedir código
          toast.success("Código enviado para seu e-mail!");
        } 
      } else {
        // PASSO 2: Enviar código e pegar token
        const { data } = await api.post('/users/verify-2fa', { email, code });
        
        localStorage.setItem('userInfo', JSON.stringify(data));
        toast.success(`Bem-vindo, ${data.firstName}!`);
        
        if (data.isAdmin) window.location.href = '/admin';
        else window.location.href = '/dashboard';
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

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800">
        
        <div className="text-center mb-8">
          <Link to="/">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white mb-4 shadow-lg cursor-pointer hover:scale-105 transition transform">
               {step === 1 ? <Scale size={24} /> : <ShieldCheck size={24} />}
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">
            {step === 1 ? 'Bem-vindo de volta' : 'Verificação de Segurança'}
          </h2>
          <p className="text-slate-500 mt-2">
            {step === 1 ? 'Acesse sua conta LegalMind AI' : `Digite o código enviado para ${email}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition text-slate-800 bg-slate-50"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition text-slate-800 bg-slate-50"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-end mt-2">
                    <Link to="/forgot-password" class="text-xs font-medium text-blue-600 hover:underline">Esqueceu a senha?</Link>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-2 text-center">Código de 6 Dígitos</label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  className="w-full text-center text-2xl tracking-widest py-4 rounded-lg border-2 border-blue-100 focus:border-blue-600 outline-none transition text-slate-800 font-mono"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Só números
                  autoFocus
                />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-lg transition-all transform hover:scale-[1.02] flex justify-center items-center disabled:opacity-70 shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : (step === 1 ? "Continuar" : "Validar Acesso")}
          </button>
        </form>

        {step === 1 && (
            <p className="mt-8 text-center text-slate-600 text-sm">
            Não tem uma conta? <Link to="/register" className="text-blue-600 font-bold hover:underline">Registre-se grátis</Link>
            </p>
        )}
        
        {step === 2 && (
            <button onClick={() => setStep(1)} className="mt-6 w-full text-center text-slate-500 text-sm hover:text-slate-800">
                Voltar para Login
            </button>
        )}
      </div>
    </div>
  );
}