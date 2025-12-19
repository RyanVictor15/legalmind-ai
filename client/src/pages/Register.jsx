import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Scale } from 'lucide-react';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    const toastId = toast.loading('Criando cadastro profissional...');

    try {
      // Envia os 4 campos para o backend
      const { data } = await api.post('/users/register', { 
        firstName, 
        lastName, 
        email, 
        password 
      });
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success(`Bem-vindo, Dr(a). ${lastName}!`, { id: toastId });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao registrar.', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-inter">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              <Scale size={24} />
           </div>
          <h1 className="text-2xl font-bold text-slate-900">Cadastro de Advogado</h1>
          <p className="text-slate-500 text-sm">Crie sua identidade profissional.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Nome</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="João" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Sobrenome</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Silva" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                />
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Email Corporativo</label>
            <input 
              type="email" 
              required 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="doutor@advocacia.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Senha</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Confirmar Senha</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg mt-2">
            CRIAR CONTA
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500">
          Já possui OAB cadastrada? <Link to="/login" className="text-blue-600 font-bold hover:underline">Fazer Login</Link>
        </div>
        {/* ------------------------------------ */}

      </div>
    </div>
  );
};

export default Register;