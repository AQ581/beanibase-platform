import { FC } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { BeanibaseLogo } from './BeanibaseLogo';

interface LegalPageProps {
  onBack: () => void;
}

export const PrivacyPolicy: FC<LegalPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#F5F2ED] p-6 md:p-12 font-sans overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-12"
      >
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-500 hover:text-black transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <BeanibaseLogo size="sm" />
            <h1 className="text-4xl font-serif font-bold italic">Privacy Policy</h1>
          </div>
          <p className="text-gray-500 font-light">Last Updated: April 22, 2026</p>
        </div>

        <section className="space-y-8 bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 leading-relaxed text-gray-800">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-orange-600">
              <Shield className="w-5 h-5" />
              <h2 className="text-xl font-bold font-serif italic">1. Introduction</h2>
            </div>
            <p>
              Beanibase ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, mobile application, or use our AI coaching services.
            </p>
            <p>
              Please read this Privacy Policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-orange-600">
              <Lock className="w-5 h-5" />
              <h2 className="text-xl font-bold font-serif italic">2. Information We Collect</h2>
            </div>
            <p>
              We may collect information about you in a variety of ways. The information we may collect on the Site includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
              <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor, Stripe, and you are encouraged to review their privacy policy and contact them directly for responses to your questions.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-orange-600">
              <Eye className="w-5 h-5" />
              <h2 className="text-xl font-bold font-serif italic">3. Use of Your Information</h2>
            </div>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and manage your account.</li>
              <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions and the Site to you.</li>
              <li>Email you regarding your account or order.</li>
              <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
              <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
              <li>Process AI coaching context and conversational memory to return highly relevant context.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-orange-600">
              <FileText className="w-5 h-5" />
              <h2 className="text-xl font-bold font-serif italic">4. Disclosure of Your Information</h2>
            </div>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
              <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance. Specifically, we utilize Google Cloud and Firebase for data storage and Google Gemini for AI generation.</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-orange-600">
              <Shield className="w-5 h-5" />
              <h2 className="text-xl font-bold font-serif italic">5. Data retention and Security</h2>
            </div>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </div>
        </section>

        <footer className="text-center pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            Questions about your sanctuary? Reach out to humanrise602@gmail.com
          </p>
        </footer>
      </motion.div>
    </div>
  );
};
