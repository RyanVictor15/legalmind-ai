import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-inter py-12 px-4 md:px-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 mb-8 font-bold hover:underline">
            <ArrowLeft size={20} className="mr-2"/> Voltar para Home
        </Link>
        
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
          <p>Data de vigência: Dezembro 2024</p>

          <h3 className="text-xl font-bold mt-6 mb-2 text-slate-900 dark:text-white">1. Informações que Coletamos</h3>
          <p>Coletamos informações que você nos fornece diretamente, como seu nome, endereço de e-mail e os documentos que você envia para análise.</p>

          <h3 className="text-xl font-bold mt-6 mb-2 text-slate-900 dark:text-white">2. Como Usamos Suas Informações</h3>
          <p>Usamos as informações para fornecer, manter e melhorar nossos serviços, incluindo os recursos de análise de IA.</p>

          <h3 className="text-xl font-bold mt-6 mb-2 text-slate-900 dark:text-white">3. Segurança dos Documentos</h3>
          <p>Os documentos enviados são criptografados em trânsito e em repouso. Eles são processados pelo nosso motor seguro de IA e não são usados para treinar modelos públicos.</p>

          <h3 className="text-xl font-bold mt-6 mb-2 text-slate-900 dark:text-white">4. Compartilhamento de Informações</h3>
          <p>Não compartilhamos suas informações pessoais com terceiros, exceto conforme descrito nesta política (por exemplo, provedores de serviços).</p>

          <h3 className="text-xl font-bold mt-6 mb-2 text-slate-900 dark:text-white">5. Seus Direitos</h3>
          <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento através das configurações do seu perfil.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;