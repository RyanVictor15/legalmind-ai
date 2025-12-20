import React from 'react';
import { ArrowLeft, Lock, Database, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white font-inter text-slate-900">
      {/* Header Simples */}
      <div className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-800">
            <Lock className="text-blue-600" /> LegalMind AI
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar para Home
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-slate max-w-none space-y-8">
          
          <p className="text-slate-600 text-lg leading-relaxed">
            Sua privacidade é nossa prioridade absoluta. Esta política descreve como a LegalMind AI coleta, usa e protege suas informações pessoais e os dados dos seus processos, em conformidade com a LGPD.
          </p>

          <div className="grid md:grid-cols-3 gap-4 my-8">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <Database className="text-blue-600 mb-2"/>
                <h4 className="font-bold text-slate-800">Coleta Mínima</h4>
                <p className="text-xs text-slate-500">Apenas o necessário para o serviço funcionar.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <Lock className="text-blue-600 mb-2"/>
                <h4 className="font-bold text-slate-800">Criptografia</h4>
                <p className="text-xs text-slate-500">Dados trafegam via SSL e senhas são hash (bcrypt).</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <EyeOff className="text-blue-600 mb-2"/>
                <h4 className="font-bold text-slate-800">Confidencialidade</h4>
                <p className="text-xs text-slate-500">Não vendemos seus dados para terceiros.</p>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Dados que Coletamos</h2>
            <ul className="list-disc pl-6 text-slate-600 mt-2 space-y-2">
              <li><strong>Dados de Conta:</strong> Nome, e-mail e senha (criptografada).</li>
              <li><strong>Documentos Jurídicos:</strong> PDFs e textos que você envia para análise. Estes documentos são processados de forma efêmera pela nossa IA.</li>
              <li><strong>Dados de Pagamento:</strong> Processados externamente (Stripe/Mercado Pago). Não armazenamos números de cartão de crédito.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Uso de Inteligência Artificial</h2>
            <p className="text-slate-600 leading-relaxed">
              Utilizamos APIs de terceiros (como OpenAI/Google Gemini) para processar suas análises. 
              <br/><br/>
              <strong>Importante:</strong> Configuração de "Zero-Retention". Solicitamos aos nossos provedores de IA que não utilizem os dados enviados por nossa API para treinar seus modelos públicos, garantindo o sigilo profissional dos seus clientes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Seus Direitos (LGPD)</h2>
            <p className="text-slate-600 leading-relaxed">
              Você tem o direito de solicitar a qualquer momento:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mt-2 space-y-1">
              <li>A confirmação da existência de tratamento de dados.</li>
              <li>O acesso aos seus dados.</li>
              <li>A correção de dados incompletos ou desatualizados.</li>
              <li>A exclusão da sua conta e de todos os dados associados (Botão "Excluir Conta" no seu Perfil).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">
              Utilizamos apenas cookies essenciais para manter sua sessão de login ativa e segura. Não utilizamos cookies de rastreamento publicitário intrusivo.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-200 text-sm text-slate-500">
            Dúvidas sobre dados? Contate nosso DPO em privacy@legalmind.ai
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;