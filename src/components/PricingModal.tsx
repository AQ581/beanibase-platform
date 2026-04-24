import { FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Crown, Sparkles, Zap, Shield, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'monthly' | 'lifetime') => void;
  featureName?: string | null;
}

export const PricingModal: FC<PricingModalProps> = ({ isOpen, onClose, onSelect, featureName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-4xl bg-[#FDFCFB] rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-black/40" />
            </button>

            {/* Left Side: Benefits */}
            <div className="md:w-1/2 p-12 bg-orange-50/50 flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-3 h-3" />
                  <span>Premium Access</span>
                </div>
                {featureName ? (
                  <h2 className="text-4xl font-serif font-bold tracking-tight">
                    Unlock <br />
                    <span className="text-orange-600 italic">{featureName}.</span>
                  </h2>
                ) : (
                  <h2 className="text-4xl font-serif font-bold tracking-tight">
                    Your cushion <br />
                    <span className="text-orange-600 italic">needs a refill.</span>
                  </h2>
                )}
                <p className="text-gray-500 font-light leading-relaxed">
                  {featureName 
                    ? `Upgrade to Premium to access ${featureName} and unlock the full potential of Beanibase.` 
                    : `Wait until tomorrow for free, or upgrade to Premium now to keep going.`}
                </p>
              </div>

              <div className="space-y-4">
                <BenefitItem icon={<Sparkles className="w-5 h-5 text-orange-400" />} text="Unlimited sits" />
                <BenefitItem icon={<Shield className="w-5 h-5 text-green-400" />} text="Full memory & session summaries" />
                <BenefitItem icon={<Crown className="w-5 h-5 text-amber-500" />} text="Access to all coaches" />
                <BenefitItem icon={<Heart className="w-5 h-5 text-red-400" />} text="Trade Lab Deep Research" />
                <p className="mt-8 text-sm italic text-gray-500 font-light border-t border-orange-100 pt-4">
                  Cancel anytime. No pressure. Just growth.
                </p>
              </div>
            </div>

            {/* Right Side: Pricing Options */}
            <div className="md:w-1/2 p-12 flex flex-col justify-center space-y-6">
              <PricingCard 
                title="Premium"
                price="$7"
                period="/ mo"
                description="Unlimited sits, full memory, session summaries, and access to all coaches."
                onClick={() => onSelect('monthly')}
                highlight={true}
              />

              <PricingCard 
                title="Wait Until Tomorrow"
                price="$0"
                period=""
                description="Your cushion will refill tomorrow with 2 new free sessions."
                onClick={onClose}
                highlight={false}
              />

              <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                <Shield className="w-3 h-3" />
                Secure checkouts via Stripe • Cancel anytime • Data stays yours
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const BenefitItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center space-x-4">
    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-700">{text}</span>
  </div>
);

const PricingCard = ({ title, price, period, description, onClick, highlight }: any) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "w-full p-6 rounded-[32px] text-left transition-all border-2 flex flex-col space-y-2 relative overflow-hidden",
      highlight 
        ? "bg-black text-white border-black shadow-xl" 
        : "bg-white text-black border-black/5 hover:border-orange-200"
    )}
  >
    {highlight && (
      <div className="absolute top-0 right-0 p-4">
        <div className="px-3 py-1 bg-orange-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
          Best Value
        </div>
      </div>
    )}
    <h3 className={cn("text-lg font-bold", highlight ? "text-white" : "text-black")}>{title}</h3>
    <div className="flex items-baseline space-x-1">
      <span className="text-3xl font-serif font-bold">{price}</span>
      <span className={cn("text-sm opacity-60", highlight ? "text-white" : "text-black")}>{period}</span>
    </div>
    <p className={cn("text-xs font-light leading-relaxed", highlight ? "text-white/60" : "text-gray-400")}>
      {description}
    </p>
  </motion.button>
);
