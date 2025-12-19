import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import api from '../services/api';
import { Scale } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Acessando sistema...');

    try {
      const { data } = await api.post('/users/login', { email, password });
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      toast.success(`Bem-vindo, ${data.firstName || 'Doutor(a)'}!`, { id: toastId });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciais inválidas.', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-inter">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        
        <div className="text-center mb-10">
          {/* --- MUDANÇA AQUI: Link para voltar para a Home --- */}
          <Link to="/">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white mb-4 shadow-lg cursor-pointer hover:scale-105 transition transform">
               <Scale size={24} />
            </div>
          </Link>
          {/* ------------------------------------------------ */}
          
          <h1 className="text-2xl font-bold text-slate-900">Legal<span className="text-blue-600">Mind</span> AI</h1>
          <p className="text-slate-500 mt-2">Acesse sua conta profissional</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Corporativo</label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              placeholder="seu.nome@escritorio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">Senha</label>
              {/* Se quiser implementar "Esqueceu a senha" no futuro, o link já está aqui */}
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Esqueceu?</Link>
            </div>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg hover:bg-slate-800 transform hover:-translate-y-0.5 transition duration-200 shadow-lg shadow-slate-900/20">
            Acessar Painel
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-slate-500 text-sm">
            Não possui uma licença? <Link to="/register" className="text-blue-600 font-bold hover:underline">Criar Cadastro</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;