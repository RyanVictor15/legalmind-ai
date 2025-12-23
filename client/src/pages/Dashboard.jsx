import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize'; // SECURITY: Prevents XSS
import { useDropzone } from 'react-dropzone';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import { LogOut, FileText, BarChart2, UploadCloud, User, Zap, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

// Chart Registration
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (location.state && location.state.document) {
      setResult(location.state.document);
      // Clear state to prevent loop
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      alert("⚠️ File too large! Max size is 10MB.");
      return; 
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const { data } = await api.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.data); 
    } catch (error) {
      console.error("Analysis Error", error);
      alert("Error processing document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'] } 
  });

  // Safe access for charts
  const chartData = result ? {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [{
      data: [
        result.keywords?.positive?.length || 3,
        result.keywords?.negative?.length || 1,
        2
      ],
      backgroundColor: ['#10B981', '#EF4444', '#64748B'],
      borderWidth: 0,
    }]
  } : null;

  const getRiskColor = (score) => {
      if (score >= 70) return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'; 
      if (score >= 40) return 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]'; 
      return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'; 
  };

  const analysisContent = result?.analysis || result?.aiSummary || "Summary unavailable.";
  const riskScore = result?.riskAnalysis || 75;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-inter relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-white transition-all duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:flex flex-col h-screen shadow-2xl
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Legal<span className="text-blue-500">Mind</span> AI</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Enterprise</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="flex items-center gap-3 p-3 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg cursor-pointer">
            <BarChart2 size={20} /> <span className="font-medium">Dashboard</span>
          </div>
          <div onClick={() => navigate('/history')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg cursor-pointer transition">
            <FileText size={20} /> <span>My Cases</span>
          </div>
          <div onClick={() => navigate('/profile')} className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg cursor-pointer transition">
            <User size={20} /> <span>My Profile</span>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <button onClick={logout} className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition text-sm w-full font-medium">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-slate-400">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                Hello, Dr. {user?.lastName || 'Advocate'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 hidden md:block">
                Smart Control Panel
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <ThemeToggle />

             {user?.isPro ? (
                <span className="hidden md:flex bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-4 py-2 rounded-full text-sm font-bold items-center gap-2">
                  👑 Enterprise
                </span>
             ) : (
                <button onClick={() => navigate('/pricing')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700">
                  💎 Upgrade
                </button>
             )}
          </div>
        </header>

        {/* UPLOAD BOX */}
        {!result ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-10 text-center animate-fade-in transition-colors duration-300">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 md:p-12 transition-all cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-slate-500'}`}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-5">
                <div className="bg-slate-100 dark:bg-slate-900 p-5 rounded-full text-blue-600 dark:text-blue-500"><UploadCloud size={32} /></div>
                <div>
                  <p className="text-lg font-medium text-slate-700 dark:text-white">Drag your Petition or Document here</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Supports PDF & TXT (Max 10MB)</p>
                </div>
                <button className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition">
                  {loading ? "Processing..." : "Select File"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-6 pb-10">
             {/* RESULT HEADER */}
             <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{result.metadata?.filename || "Analyzed Document"}</h3>
                    <span className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold">Report Generated</span>
                </div>
                <button onClick={() => setResult(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline">New Analysis</button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* AI TEXT ANALYSIS - NOW SANITIZED */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-sm border-l-4 border-blue-600 dark:border-blue-500 transition-colors duration-300">
                        <h4 className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-lg mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                            <FileText size={20} className="text-blue-600 dark:text-blue-500"/> Legal Analysis
                        </h4>
                        
                        <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-justify mb-6 prose prose-slate dark:prose-invert max-w-none">
                            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                              {analysisContent}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* CHARTS */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                        <h4 className="flex items-center justify-center gap-2 text-slate-800 dark:text-white font-bold mb-4">
                            <Zap size={18} className="text-yellow-500"/> Success Probability
                        </h4>
                        <div className="flex justify-center items-end gap-1 mb-2">
                            <span className="text-5xl font-bold text-slate-800 dark:text-white">{riskScore}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-4 overflow-hidden">
                            <div className={`h-full ${getRiskColor(riskScore)}`} style={{ width: `${riskScore}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                        <h4 className="text-slate-800 dark:text-white font-bold mb-4 text-center">Emotional Tone</h4>
                        <div className="h-48 relative">
                            <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;