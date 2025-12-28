import React from 'react';
import Layout from '../components/Layout'; // <--- CORREÇÃO AQUI (Path Fix)

const Dashboard = () => {
  const stats = [
    { title: 'Análises Hoje', value: '12', color: 'bg-blue-500' },
    { title: 'Créditos Restantes', value: '5', color: 'bg-green-500' },
    { title: 'Processos Arquivados', value: '128', color: 'bg-purple-500' },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
        <p className="text-gray-500 text-sm mt-1">Bem-vindo de volta, Doutor(a).</p>
      </div>

      {/* Responsive Grid System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-full ${stat.color} bg-opacity-10 mr-4`}>
              <div className={`w-4 h-4 ${stat.color} rounded-full`}></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Atividades Recentes</h2>
          <button className="text-indigo-600 text-sm hover:underline">Ver tudo</button>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-400 py-8">
            <p>Nenhuma análise recente encontrada.</p>
            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition">
              Iniciar Nova Análise
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;