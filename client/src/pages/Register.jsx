import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Scale, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/users/register', { 
        firstName, 
        lastName, 
        email, 
        password 
      });
      
      // Salva sessão imediatamente
      if (data.token) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data);
      }
      
      toast.success(`Bem-vindo, Dr(a). ${lastName}!`);
      navigate('/dashboard');

    } catch (err) {
      const msg = err.response?.data?.message || 'Falha no registro.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // CORREÇÃO: Adicionado dark:bg-slate-900 para reagir ao tema
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 font-inter transition-colors duration-300">
      
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 mb-4">
              <Scale size={24} />
           </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cadastro de Advogado</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Crie sua identidade profissional.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Nome</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="João" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Sobrenome</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Silva" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                />
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">E-mail Corporativo</label>
            <input 
              type="email" 
              required 
              className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="advogado@firma.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Senha</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Confirmar Senha</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition shadow-lg mt-2 disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'CRIAR CONTA'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Já tem uma conta? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Entrar aqui</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;