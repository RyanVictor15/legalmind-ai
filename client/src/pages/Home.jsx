import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Shield, Zap, BarChart3, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle'; 

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-inter text-slate-900 dark:text-white transition-colors duration-300 selection:bg-blue-500 selection:text-white">
      
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LegalMind AI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition">Recursos</a>
              <Link to="/pricing" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition">Preços</Link>
              
              <ThemeToggle /> 

              <Link to="/login" className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 transition">Entrar</Link>
              <Link to="/register" className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-lg">
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="hidden dark:block absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 text-blue-700 dark:text-blue-400 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Nova IA Jurídica v2.0 Disponível
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-tight">
            Análise Jurídica <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">na velocidade da luz.</span>
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Aumente a produtividade do seu escritório com nossa IA. Analise contratos, preveja riscos e obtenha insights em segundos.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 group">
              Testar Gratuitamente
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 transition">
              Ver Planos
            </Link>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-bold text-blue-600 dark:text-blue-500 tracking-wide uppercase mb-2">Recursos Poderosos</h2>
            <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Tudo o que seu escritório precisa para escalar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-slate-900 rounded-lg flex items-center justify-center mb-6 border border-transparent dark:border-slate-700">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Análise de Sentimento</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Nossa IA classifica instantaneamente se o conteúdo é Favorável, Neutro ou Desfavorável.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition group">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-slate-900 rounded-lg flex items-center justify-center mb-6 border border-transparent dark:border-slate-700">
                <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Resumo Executivo</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Economize horas de leitura com resumos focados nos pontos jurídicos cruciais.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition group">
              <div className="w-12 h-12 bg-teal-100 dark:bg-slate-900 rounded-lg flex items-center justify-center mb-6 border border-transparent dark:border-slate-700">
                <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Segurança de Dados</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Documentos criptografados e processados em ambiente seguro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;  