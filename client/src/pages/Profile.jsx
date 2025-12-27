import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Key } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* ESPAÇADOR MOBILE */}
        <div className="md:hidden h-16 w-full shrink-0"></div>

        <div className="p-4 md:p-8 w-full max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <User className="text-blue-500" /> Meu Perfil
            </h1>
          </header>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-800">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
                <p className="text-slate-400">Advogado(a)</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Email</label>
                  <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300">
                    <Mail size={18} className="text-slate-500" />
                    {user?.email}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Plano Atual</label>
                  <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300">
                    <Shield size={18} className="text-green-500" />
                    <span className="text-green-400 font-bold">Gratuito (Beta)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-bold">
                  <Key size={16} /> Alterar Senha
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;