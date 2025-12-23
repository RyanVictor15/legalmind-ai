import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-inter py-12 px-4 md:px-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 mb-8 font-bold hover:underline">
            <ArrowLeft size={20} className="mr-2"/> Voltar para Home
        </Link>
        
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Termos de Serviço</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
          <p>Última atualização: Dezembro 2024</p>

          <h3 className="text-xl font-bold mt-6 mb-2 text-slate-900 dark:text-white">1. Aceitação dos Termos</h3>
          <p>Ao acessar e usar o LegalMind AI, você aceita e concorda em estar vinculado aos termos e disposições deste acordo.</p>

          <h3 className="text-xl font-bold mt-6 mb-2 text-slate-900 dark:text-white">2. Descrição do Serviço</h3>
          <p>O LegalMind AI fornece análise de documentos alimentada por IA para profissionais jurídicos. A análise fornecida é apenas para fins informativos e não constitui aconselhamento jurídico.</p>

          <h3 className="text-xl font-bold mt-6 mb-2 text-slate-900 dark:text-white">3. Contas de Usuário</h3>
          <p>Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em aceitar a responsabilidade por todas as atividades que ocorram sob sua conta.</p>

          <h3 className="text-xl font-bold mt-6 mb-2 text-slate-900 dark:text-white">4. Privacidade de Dados</h3>
          <p>Seus documentos são processados de forma segura e excluídos de nossos servidores após a análise, a menos que você escolha explicitamente salvá-los em seu histórico.</p>

          <h3 className="text-xl font-bold mt-6 mb-2 text-slate-900 dark:text-white">5. Limitação de Responsabilidade</h3>
          <p>O LegalMind AI não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do uso do serviço.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;