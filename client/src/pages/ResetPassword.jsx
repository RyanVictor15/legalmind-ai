import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Lock, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams(); // Pega o token da URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('As senhas não coincidem');
    if (password.length < 6) return toast.error('Senha muito curta');

    try {
      await api.put(`/users/reset-password/${token}`, { password });
      toast.success('Senha alterada com sucesso!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Link inválido ou expirado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-inter">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Nova Senha</h1>
          <p className="text-slate-500 text-sm mt-2">Crie uma nova senha segura.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nova Senha</label>
            <input type="password" required className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmar Senha</label>
            <input type="password" required className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition">
            <CheckCircle size={18} className="inline mr-2"/> Redefinir Senha
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;