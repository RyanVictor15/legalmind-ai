import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Trash2, Save, ArrowLeft, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth(); // login usado para atualizar estado local
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      setLoading(false);
      return setMessage({ type: 'error', text: 'As senhas não conferem.' });
    }

    try {
      // Atualiza dados
      const { data } = await api.put('/users/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password || undefined // Só envia se preenchido
      });

      // Atualiza contexto global e localStorage
      const updatedUser = { ...user, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      // Força recarregamento simples ou atualiza via contexto se tiver função update
      // Aqui vamos assumir reload para simplificar ou re-login silencioso
      alert('Perfil atualizado com sucesso!');
      window.location.reload(); 

    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao atualizar.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('TEM CERTEZA? Esta ação é irreversível e apagará todo seu histórico.')) {
        try {
            await api.delete('/users/profile');
            logout();
            navigate('/');
        } catch (error) {
            alert('Erro ao deletar conta.');
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter p-6 flex justify-center items-center">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-800 rounded-full transition">
               <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Meu Perfil</h1>
          </div>
          <div className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {user?.isPro ? 'Enterprise' : 'Plano Gratuito'}
          </div>
        </div>

        <div className="p-8">
          {message.text && (
            <div className={`p-4 rounded-lg mb-6 text-sm flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message.type === 'error' ? <AlertTriangle size={16}/> : <Save size={16}/>}
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* Dados Pessoais */}
            <div className="space-y-4">
                <h3 className="text-slate-800 font-bold flex items-center gap-2 border-b pb-2">
                    <User size={18} className="text-blue-600"/> Dados Pessoais
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Nome</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Sobrenome</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">E-mail</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>
            </div>

            {/* Segurança */}
            <div className="space-y-4 pt-4">
                <h3 className="text-slate-800 font-bold flex items-center gap-2 border-b pb-2">
                    <Lock size={18} className="text-blue-600"/> Segurança
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Nova Senha (Opcional)</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Deixe em branco para manter"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Confirmar Senha</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirme a nova senha"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button 
                    type="button" 
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium transition"
                >
                    <Trash2 size={16} /> Excluir Conta
                </button>

                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
    <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${formData.twoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
            <ShieldCheck size={24} />
        </div>
        <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Autenticação de Dois Fatores (2FA)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Exige código por e-mail ao logar.</p>
        </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
        <input 
            type="checkbox" 
            checked={formData.twoFactorEnabled || false}
            onChange={(e) => setFormData({...formData, twoFactorEnabled: e.target.checked})}
            className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
</div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-900/20"
                >
                    {loading ? 'Salvando...' : <><Save size={18}/> Salvar Alterações</>}
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;