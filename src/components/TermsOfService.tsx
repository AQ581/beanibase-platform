import { FC } from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft } from 'lucide-react';
import { BeanibaseLogo } from './BeanibaseLogo';

interface LegalPageProps {
  onBack: () => void;
}

export const TermsOfService: FC<LegalPageProps> = ({ onBack }) => {
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
            <h1 className="text-4xl font-serif font-bold italic">Terms of Service</h1>
          </div>
          <p className="text-gray-500 font-light">Last Updated: April 22, 2026</p>
        </div>

        <section className="space-y-8 bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 leading-relaxed text-gray-800">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-orange-600">
              <Shield className="w-5 h-5" />
              <h2 className="text-xl font-bold font-serif italic">1. Agreement to Terms</h2>
            </div>
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Beanibase ("we," "us," or "our"), concerning your access to and use of the website as well as any other media form, media channel, mobile website, or mobile application related, linked, or otherwise connected thereto.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold font-serif italic">2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold font-serif italic">3. Subscriptions & Payments</h2>
            <p>
              Premium features require a subscription. We accept payments through Stripe. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. We reserve the right to refuse any order placed through the Site. Pricing for Beanibase subscriptions is subject to change. Cancel at any time via the User Dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold font-serif italic">4. Disclaimers</h2>
            <p>
              The AI coaching provided on Beanibase is for educational and self-improvement purposes. It does not constitute medical, clinical, legal, or professional advice. The Site is provided on an AS-IS and AS-AVAILABLE basis. You agree that your use of the Site and our services will be at your sole risk.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold font-serif italic">5. Limitations of Liability</h2>
            <p>
              In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the Site.
            </p>
          </div>
        </section>

        <footer className="text-center pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            Questions? Contact humanrise602@gmail.com
          </p>
        </footer>
      </motion.div>
    </div>
  );
};
