import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Lock, ArrowLeft, Save, Shield } from 'lucide-react';

const Profile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [usage, setUsage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email);
        setIsPro(data.isPro);
        setUsage(data.usageCount);
      } catch (error) {
        toast.error('Erro ao carregar perfil');
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    try {
      const { data } = await api.put('/users/profile', { 
        firstName, 
        lastName, 
        password 
      });

      // Atualiza o localStorage para refletir mudança de nome
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo) {
          userInfo.firstName = data.firstName;
          userInfo.lastName = data.lastName;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }

      toast.success('Perfil atualizado com sucesso!');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition">
          <ArrowLeft size={20} className="mr-2"/> Voltar ao Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <User size={24}/> Meu Perfil
              </h1>
              <p className="text-slate-400 mt-1">Dr(a). {firstName} {lastName}</p>
            </div>
            {isPro && (
              <span className="bg-amber-500 text-slate-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                <Shield size={12}/> Enterprise
              </span>
            )}
          </div>

          <div className="p-8">
            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold">Plano Atual</p>
                <p className="text-lg font-medium text-slate-800">{isPro ? 'Enterprise Pro' : 'Gratuito'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold">Análises Realizadas</p>
                <p className="text-lg font-medium text-slate-800">{usage}</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                 <User size={18} className="text-slate-400"/> Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                    <input 
                        type="text" 
                        className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sobrenome</label>
                    <input 
                        type="text" 
                        className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Não editável)</label>
                <input 
                    type="email" 
                    className="w-full p-3 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" 
                    value={email} 
                    disabled 
                />
              </div>

              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2 pt-4">
                <Lock size={18} className="text-slate-400"/> Alterar Senha
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
                <input
                  type="password"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Deixe em branco para manter a atual"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2">
                <Save size={18}/> Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;