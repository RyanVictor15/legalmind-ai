import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Shield, Key, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setTwoFactorEnabled(user.twoFactorEnabled || false);
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      return toast.error("As senhas não coincidem.");
    }

    setLoading(true);
    const toastId = toast.loading("Atualizando perfil...");

    try {
      const payload = {
        firstName,
        lastName,
        twoFactorEnabled,
      };

      if (password) payload.password = password;

      const { data } = await api.put('/users/profile', payload);

      const updatedUser = { ...user, ...data };
      if (data.token) updatedUser.token = data.token; 

      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${updatedUser.token}`;

      toast.success("Perfil atualizado com sucesso!", { id: toastId });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Falha na atualização.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Tem certeza? Esta ação não pode ser desfeita e deletará todos os seus dados.")) {
        try {
            await api.delete('/users/profile');
            logout();
            toast.success("Conta excluída.");
            navigate('/');
        } catch (error) {
            toast.error("Falha ao excluir conta.");
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 font-inter transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-3">
          <User className="text-blue-600" size={32} /> Meu Perfil
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT CARD */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-slate-500 dark:text-slate-400">
                {firstName.charAt(0)}{lastName.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{firstName} {lastName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${user?.isPro ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {user?.isPro ? '👑 ENTERPRISE' : '🔹 PLANO GRÁTIS'}
                 </span>
              </div>
            </div>
            
            <button onClick={() => navigate('/dashboard')} className="w-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium">
                Voltar ao Dashboard
            </button>
            
             <button onClick={handleDeleteAccount} className="w-full text-red-500 hover:text-red-700 text-sm mt-4 underline">
                Excluir Minha Conta
            </button>
          </div>

          {/* RIGHT CARD */}
          <div className="md:col-span-2">
            <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-blue-500"/> Informações Pessoais
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sobrenome</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail (Leitura)</label>
                    <input 
                      type="email" 
                      disabled
                      className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 cursor-not-allowed"
                      value={email}
                    />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Key size={20} className="text-blue-500"/> Segurança
                </h3>
                
                <div className="mb-6 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div>
                        <span className="block font-bold text-slate-800 dark:text-white text-sm">Autenticação de Dois Fatores (2FA)</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Exigir código por e-mail no login</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={twoFactorEnabled} onChange={(e) => setTwoFactorEnabled(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nova Senha</label>
                        <input 
                        type="password" 
                        placeholder="Deixe em branco para manter"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirmar Senha</label>
                        <input 
                        type="password" 
                        placeholder="Repita a nova senha"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition flex items-center gap-2 disabled:opacity-70 shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar Alterações</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;