import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // 📍 FASE 5: Compliance
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações no Frontend
    if (formData.password !== formData.confirmPassword) {
      return toast.error("As senhas não coincidem.");
    }

    if (!agreedTerms) {
        return toast.error("Você deve aceitar os Termos de Uso.");
    }

    setLoading(true);

    try {
      const { data } = await api.post('/users/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      // Login automático após registo
      localStorage.setItem('userInfo', JSON.stringify(data));
      if (data.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      setUser(data);
      
      toast.success("Conta criada com sucesso!");
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
             <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Criar Conta</h1>
          <p className="text-slate-500 dark:text-slate-400">Junte-se ao LegalMind AI hoje.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input
                  name="firstName"
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                  placeholder="João"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Apelido</label>
              <input
                name="lastName"
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                placeholder="Silva"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                placeholder="advogado@exemplo.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                name="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Confirmar Senha</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                name="confirmPassword"
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 📍 FASE 5: CHECKBOX DE TERMOS (COMPLIANCE) */}
          <div className="flex items-start gap-3 mt-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 border border-slate-300 rounded bg-slate-50 focus:ring-3 focus:ring-blue-300 dark:bg-slate-700 dark:border-slate-600 dark:focus:ring-blue-600 dark:ring-offset-slate-800"
              />
            </div>
            <label htmlFor="terms" className="text-sm font-medium text-slate-900 dark:text-slate-300">
              Concordo com os <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">Termos de Uso</a> e <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">Política de Privacidade</a>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreedTerms}
            className="w-full bg-slate-900 dark:bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Criar Conta"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}