import { Link } from 'react-router-dom';
import { ShieldCheck, BrainCircuit, FileText, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500 selection:text-white">
      {/* Navbar Simplificada */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold tracking-tighter text-blue-500">
          LegalMind<span className="text-white">AI</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
            Entrar
          </Link>
          <Link to="/register" className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-bold transition-all">
            Criar Conta
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 md:py-24 text-center">
        <div className="inline-flex items-center bg-slate-800/50 rounded-full px-4 py-1 mb-8 border border-slate-700 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-300">Inteligência Artificial v1.0 Online</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight">
          Análise Jurídica <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Instantânea e Precisa
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Otimize seu escritório. Nossa IA analisa contratos, identifica riscos ocultos e sugere melhorias baseadas na lei brasileira em segundos.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <Link 
            to="/register" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
          >
            Começar Gratuitamente <ArrowRight size={20} />
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-lg transition-all hover:text-white text-slate-300"
          >
            Acessar Demonstração
          </Link>
        </div>

        {/* Imagem/Demo Visual (Placeholder) */}
        <div className="relative mx-auto max-w-4xl rounded-xl border border-slate-800 bg-slate-950/50 shadow-2xl overflow-hidden p-2">
           <div className="bg-slate-900 rounded-lg p-8 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-4">
                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
                 <span className="ml-2 text-xs text-slate-500">Dashboard do Advogado</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                    <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
                      <p className="text-red-400 text-sm font-semibold flex items-center gap-2">⚠️ Risco Detectado</p>
                      <p className="text-slate-400 text-xs mt-1">Cláusula 4.2 abusiva conforme CDC Art. 51...</p>
                    </div>
                  </div>
                  <div className="space-y-3 hidden md:block">
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                    <div className="h-32 bg-slate-800/50 rounded w-full border border-slate-800 border-dashed flex items-center justify-center text-slate-600 text-sm">
                      Análise processada em 2.4s
                    </div>
                  </div>
              </div>
           </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-slate-950 py-24 border-t border-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Por que usar o LegalMind?</h2>
            <p className="text-slate-400">Tecnologia de ponta para profissionais do direito.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BrainCircuit className="w-10 h-10 text-purple-500" />}
              title="Análise Preditiva"
              desc="Nossa IA identifica cláusulas abusivas, riscos financeiros e ambiguidades antes que virem problemas judiciais."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-10 h-10 text-blue-500" />}
              title="Segurança Total"
              desc="Seus documentos são processados em ambiente criptografado e não são utilizados para treinar modelos públicos."
            />
            <FeatureCard 
              icon={<FileText className="w-10 h-10 text-green-500" />}
              title="Resumos Executivos"
              desc="Transforme 50 páginas de 'juridiquês' denso em um resumo executivo claro, direto e acionável."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© 2025 LegalMind AI. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-slate-300 cursor-pointer">Termos</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacidade</span>
            <span className="hover:text-slate-300 cursor-pointer">Suporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors group">
      <div className="mb-6 bg-slate-800 w-fit p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}