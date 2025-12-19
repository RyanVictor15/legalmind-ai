import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Shield, Zap, Check, ArrowRight, BookOpen, BarChart } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-inter text-slate-900">
      
      {/* --- NAVBAR --- */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-lg text-white">
              <Scale size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Legal<span className="text-blue-600">Mind</span> AI</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="px-5 py-2.5 font-medium text-slate-600 hover:text-slate-900 transition">
              Entrar
            </button>
            <button onClick={() => navigate('/register')} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
              Começar Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (A Promessa) --- */}
      <header className="pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8 border border-blue-100">
          <Zap size={16} fill="currentColor"/> Nova IA v2.0 Disponível
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
          Inteligência Artificial para <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Advogados de Elite.</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Analise petições em segundos, preveja resultados de processos e pesquise jurisprudência com a tecnologia mais avançada do mercado.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigate('/register')} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30">
            Criar Conta Profissional <ArrowRight size={20}/>
          </button>
          <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition">
            Ver Demonstração
          </button>
        </div>
        <p className="mt-6 text-sm text-slate-400">
          * Não requer cartão de crédito para teste.
        </p>
      </header>

      {/* --- FEATURES GRID --- */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Tudo o que seu escritório precisa</h2>
            <p className="text-slate-500 mt-2">Uma suíte completa de ferramentas jurídicas.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <BarChart size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Análise Preditiva</h3>
              <p className="text-slate-500 leading-relaxed">
                Nossa IA lê seu PDF e calcula a probabilidade de êxito da causa com base em dados reais.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Jurisprudência Inteligente</h3>
              <p className="text-slate-500 leading-relaxed">
                Busque precedentes em nosso banco de dados proprietário e copie ementas formatadas (ABNT).
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Segurança Militar</h3>
              <p className="text-slate-500 leading-relaxed">
                Seus dados e de seus clientes são criptografados. Privacidade total e conformidade com a LGPD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Planos Transparentes</h2>
            <p className="text-slate-500 mt-2">Escolha a melhor opção para sua carreira.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Free Tier */}
            <div className="p-8 border border-slate-200 rounded-2xl hover:border-blue-200 transition">
              <h3 className="text-lg font-bold text-slate-900">Plano Starter</h3>
              <div className="my-4"><span className="text-4xl font-bold">R$ 0</span><span className="text-slate-500">/mês</span></div>
              <p className="text-sm text-slate-500 mb-6">Para advogados iniciantes ou estudantes.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-2 text-sm text-slate-700"><Check size={18} className="text-green-500"/> 3 Análises de IA por dia</li>
                <li className="flex gap-2 text-sm text-slate-700"><Check size={18} className="text-green-500"/> Busca básica de Jurisprudência</li>
                <li className="flex gap-2 text-sm text-slate-700"><Check size={18} className="text-green-500"/> Suporte por email</li>
              </ul>
              <button onClick={() => navigate('/register')} className="w-full py-3 border border-slate-900 text-slate-900 font-bold rounded-lg hover:bg-slate-50 transition">
                Começar Grátis
              </button>
            </div>

            {/* Pro Tier */}
            <div className="p-8 bg-slate-900 text-white rounded-2xl shadow-xl transform md:scale-105 relative">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                MAIS POPULAR
              </div>
              <h3 className="text-lg font-bold text-white">LegalMind Enterprise</h3>
              <div className="my-4"><span className="text-4xl font-bold">R$ 97</span><span className="text-slate-400">/mês</span></div>
              <p className="text-sm text-slate-400 mb-6">Para escritórios de alta performance.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-2 text-sm text-slate-200"><Check size={18} className="text-blue-400"/> Análises de IA Ilimitadas</li>
                <li className="flex gap-2 text-sm text-slate-200"><Check size={18} className="text-blue-400"/> IA Jurídica Avançada (GPT-4/Gemini)</li>
                <li className="flex gap-2 text-sm text-slate-200"><Check size={18} className="text-blue-400"/> Jurisprudência Completa</li>
                <li className="flex gap-2 text-sm text-slate-200"><Check size={18} className="text-blue-400"/> Gestão de Documentos</li>
              </ul>
              <button onClick={() => navigate('/register')} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-900/50">
                Assinar Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded text-white"><Scale size={16} /></div>
            <span className="font-bold text-slate-900">LegalMind AI</span>
          </div>
          <p className="text-sm text-slate-500">© 2025 LegalMind Tecnologia Jurídica Ltda. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900">Termos</a>
            <a href="#" className="hover:text-slate-900">Privacidade</a>
            <a href="#" className="hover:text-slate-900">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;