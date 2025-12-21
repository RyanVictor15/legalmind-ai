import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle, Scale, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(''); // New State for 2FA Code
  
  const [step, setStep] = useState(1); // 1 = Password, 2 = 2FA Code
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Access context to update user state

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
        // STEP 1: Send password and check for 2FA
        const { data } = await api.post('/users/login', { email, password });
        
        if (data.requires2FA) {
          setStep(2); // Switch to code input
          toast.success("Security code sent to your email!");
        } else {
            // Direct Login Success
            localStorage.setItem('userInfo', JSON.stringify(data));
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            setUser(data);
            
            toast.success(`Welcome back, ${data.firstName}!`);
            navigate(data.isAdmin ? '/admin' : '/dashboard');
        }

      } else {
        // STEP 2: Verify 2FA Code
        const { data } = await api.post('/users/verify-2fa', { email, code });
        
        localStorage.setItem('userInfo', JSON.stringify(data));
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data);

        toast.success(`Welcome, ${data.firstName}!`);
        navigate(data.isAdmin ? '/admin' : '/dashboard');
      }

    } catch (err) {
      console.error(err);
      // Handle standardized backend error messages
      const msg = err.response?.data?.message || "Connection error.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800">
        
        <div className="text-center mb-8">
          <Link to="/">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white mb-4 shadow-lg cursor-pointer hover:scale-105 transition transform">
               {step === 1 ? <Scale size={24} /> : <ShieldCheck size={24} />}
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">
            {step === 1 ? 'Welcome Back' : 'Security Check'}
          </h2>
          <p className="text-slate-500 mt-2">
            {step === 1 ? 'Access your LegalMind AI account' : `Enter the code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Corporate Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition text-slate-800 bg-slate-50"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition text-slate-800 bg-slate-50"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-end mt-2">
                    <Link to="/forgot-password" class="text-xs font-medium text-blue-600 hover:underline">Forgot password?</Link>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-2 text-center">6-Digit Code</label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  className="w-full text-center text-2xl tracking-widest py-4 rounded-lg border-2 border-blue-100 focus:border-blue-600 outline-none transition text-slate-800 font-mono"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Numbers only
                  autoFocus
                />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-lg transition-all transform hover:scale-[1.02] flex justify-center items-center disabled:opacity-70 shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : (step === 1 ? "Continue" : "Verify Access")}
          </button>
        </form>

        {step === 1 && (
            <p className="mt-8 text-center text-slate-600 text-sm">
            Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register for free</Link>
            </p>
        )}
        
        {step === 2 && (
            <button onClick={() => setStep(1)} className="mt-6 w-full text-center text-slate-500 text-sm hover:text-slate-800">
                Back to Login
            </button>
        )}
      </div>
    </div>
  );
}