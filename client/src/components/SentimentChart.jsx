import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

// Necessário para o Chart.js funcionar com o React
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale, 
  LinearScale, 
  BarElement
);

const SentimentChart = ({ score, verdict, keywords }) => {
  const chartColor = verdict === 'Positivo' ? '#10b981' : verdict === 'Negativo' ? '#ef4444' : '#f59e0b';
  
  // Dados para o Gráfico de Rosca (Doughnut)
  const dataDoughnut = {
    labels: ['Score', 'Restante'],
    datasets: [
      {
        data: [score, 1 - score], // Mostra o score e o que falta para 1
        backgroundColor: [chartColor, '#e5e7eb'],
        borderColor: [chartColor, '#e5e7eb'],
        borderWidth: 1,
      },
    ],
  };

  // Dados para o Gráfico de Barras (Keywords)
  const dataBar = {
    labels: ['Positivas', 'Negativas'],
    datasets: [
      {
        label: 'Contagem de Palavras-chave',
        data: [keywords.positive.length, keywords.negative.length],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#059669', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {/* Gráfico de Rosca (Score) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
        <h3 className="font-semibold text-gray-700 mb-4">Pontuação de Sentimento</h3>
        <div style={{ height: '250px', width: '250px' }}>
            <Doughnut data={dataDoughnut} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
        </div>
        <div className="mt-4 text-center">
            <span className={`text-4xl font-bold ${verdict === 'Positivo' ? 'text-green-500' : verdict === 'Negativo' ? 'text-red-500' : 'text-yellow-500'}`}>
                {(score * 100).toFixed(0)}%
            </span>
            <p className="text-sm text-gray-500">Tom: {verdict}</p>
        </div>
      </div>

      {/* Gráfico de Barras (Keywords) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4 text-center">Distribuição de Termos</h3>
        <Bar data={dataBar} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
      </div>
    </div>
  );
};

export default SentimentChart;