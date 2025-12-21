import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-inter py-12 px-4 md:px-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 mb-8 font-bold hover:underline">
            <ArrowLeft size={20} className="mr-2"/> Return Home
        </Link>
        
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>Last updated: December 2024</p>

          <h3>1. Acceptance of Terms</h3>
          <p>By accessing and using LegalMind AI, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h3>2. Description of Service</h3>
          <p>LegalMind AI provides AI-powered document analysis for legal professionals. The analysis provided is for informational purposes only and does not constitute legal advice.</p>

          <h3>3. User Accounts</h3>
          <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

          <h3>4. Data Privacy</h3>
          <p>Your documents are processed securely and deleted from our servers after analysis, unless you explicitly choose to save them in your history.</p>

          <h3>5. Limitation of Liability</h3>
          <p>LegalMind AI shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;