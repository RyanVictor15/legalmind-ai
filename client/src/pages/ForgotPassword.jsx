import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/users/forgot-password', { email });
      setSent(true);
      toast.success('E-mail de recuperação enviado!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao enviar e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-inter transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        
        <Link to="/login" className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mb-6 transition">
          <ArrowLeft size={16} className="mr-2" /> Voltar ao Login
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Recuperar Senha</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
        </p>

        {sent ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg text-center animate-fade-in">
            <h3 className="text-green-800 dark:text-green-400 font-bold mb-2">Verifique seu e-mail</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Enviamos um link de recuperação para <strong>{email}</strong>.
            </p>
            <button onClick={() => setSent(false)} className="text-xs text-green-600 dark:text-green-400 mt-4 underline">
              Tentar outro e-mail
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition flex justify-center items-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Enviar Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;