import React, { useState } from 'react';
import { Briefcase, Scale, GraduationCap, Gavel, FileText, Zap, BookOpen, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OnboardingModal = ({ onComplete }) => {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    role: '',
    specialty: '',
    mainGoal: ''
  });

  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/users/onboarding', formData);
      
      // Atualiza o contexto do usuário localmente para sumir o modal
      const updatedUser = { ...user, ...data.user, hasOnboarded: true };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success("Perfil configurado com sucesso!");
      if (onComplete) onComplete();

    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  };

  // --- CONFIGURAÇÃO DAS OPÇÕES ---
  const roles = [
    { id: 'lawyer', label: 'Advogado(a)', icon: Briefcase },
    { id: 'student', label: 'Estudante', icon: GraduationCap },
    { id: 'paralegal', label: 'Paralegal / Assistente', icon: FileText },
  ];

  const specialties = [
    { id: 'civil', label: 'Civil', icon: Scale },
    { id: 'penal', label: 'Penal / Criminal', icon: Gavel },
    { id: 'labor', label: 'Trabalhista', icon: Briefcase },
    { id: 'tax', label: 'Tributário', icon: FileText },
    { id: 'other', label: 'Outro / Generalista', icon: BookOpen },
  ];

  const goals = [
    { id: 'speed', label: 'Agilidade na Análise', desc: 'Quero ler processos em segundos.', icon: Zap },
    { id: 'precision', label: 'Segunda Opinião', desc: 'Validar teses e riscos.', icon: CheckCircle2 },
    { id: 'study', label: 'Aprendizado', desc: 'Estudar casos complexos.', icon: BookOpen },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
        
        {/* BARRA DE PROGRESSO */}
        <div className="h-2 bg-slate-100 dark:bg-slate-700 w-full">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        <div className="p-8 overflow-y-auto">
          
          {/* STEP 1: PERFIL */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bem-vindo, {user?.firstName}! 👋</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Para personalizar a IA, conte-nos quem você é.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleSelect('role', role.label)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.role === role.label 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-600/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <role.icon className={`mb-3 ${formData.role === role.label ? 'text-blue-600' : 'text-slate-400'}`} size={28} />
                    <span className={`block font-bold ${formData.role === role.label ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {role.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: ESPECIALIDADE */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Qual sua principal área?</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">A IA dará ênfase nas leis específicas desta área.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {specialties.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => handleSelect('specialty', spec.label)}
                    className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      formData.specialty === spec.label 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <spec.icon className={formData.specialty === spec.label ? 'text-blue-600' : 'text-slate-400'} size={24} />
                    <span className={`font-bold ${formData.specialty === spec.label ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {spec.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: OBJETIVO */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Qual seu maior objetivo?</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Vamos calibrar o foco das análises para você.</p>
              
              <div className="space-y-4">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleSelect('mainGoal', goal.label)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all ${
                      formData.mainGoal === goal.label 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${formData.mainGoal === goal.label ? 'bg-blue-200 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <goal.icon className={formData.mainGoal === goal.label ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500'} size={24} />
                    </div>
                    <div>
                      <span className={`block font-bold ${formData.mainGoal === goal.label ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
                        {goal.label}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{goal.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER AÇÕES */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <button 
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className={`text-slate-500 font-medium px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition ${step === 1 ? 'opacity-0 cursor-default' : ''}`}
          >
            Voltar
          </button>

          {step < 3 ? (
            <button 
              onClick={handleNext}
              disabled={(step === 1 && !formData.role) || (step === 2 && !formData.specialty)}
              className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Continuar
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={!formData.mainGoal || loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              {loading ? 'Salvando...' : 'Finalizar Setup 🚀'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;