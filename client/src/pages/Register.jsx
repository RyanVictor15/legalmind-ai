import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Scale } from 'lucide-react';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    const toastId = toast.loading('Creating professional account...');
    setLoading(true);

    try {
      // Backend expects: firstName, lastName, email, password
      const { data } = await api.post('/users/register', { 
        firstName, 
        lastName, 
        email, 
        password 
      });
      
      // Save session directly after register
      if (data.token) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      
      toast.success(`Welcome, Dr. ${lastName}!`, { id: toastId });
      navigate('/dashboard');

    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-inter">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              <Scale size={24} />
           </div>
          <h1 className="text-2xl font-bold text-slate-900">Attorney Registration</h1>
          <p className="text-slate-500 text-sm">Create your professional identity.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">First Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="John" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Last Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Doe" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                />
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Corporate Email</label>
            <input 
              type="email" 
              required 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="lawyer@firm.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Password</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Confirm Password</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg mt-2 disabled:opacity-70"
          >
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login here</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;