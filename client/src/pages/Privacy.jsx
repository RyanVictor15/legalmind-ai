import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-inter py-12 px-4 md:px-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 mb-8 font-bold hover:underline">
            <ArrowLeft size={20} className="mr-2"/> Return Home
        </Link>
        
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>Effective Date: December 2024</p>

          <h3>1. Information We Collect</h3>
          <p>We collect information you provide directly to us, such as your name, email address, and the documents you upload for analysis.</p>

          <h3>2. How We Use Your Information</h3>
          <p>We use the information to provide, maintain, and improve our services, including the AI analysis features.</p>

          <h3>3. Document Security</h3>
          <p>Uploaded documents are encrypted in transit and at rest. They are processed by our secure AI engine and are not used to train public models.</p>

          <h3>4. Sharing of Information</h3>
          <p>We do not share your personal information with third parties except as described in this policy (e.g., service providers).</p>

          <h3>5. Your Rights</h3>
          <p>You have the right to access, correct, or delete your personal information at any time via your profile settings.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;