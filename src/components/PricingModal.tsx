import { FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Crown, Sparkles, Zap, Shield, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'monthly' | 'lifetime') => void;
}

export const PricingModal: FC<PricingModalProps> = ({ isOpen, onClose, onSelect }) => {
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
                <h2 className="text-4xl font-serif font-bold tracking-tight">
                  Fair prices. <br />
                  <span className="text-orange-600 italic">No fine-print surprises.</span>
                </h2>
                <p className="text-gray-500 font-light leading-relaxed">
                  Like a good cushion should be.
                </p>
              </div>

              <div className="space-y-4">
                <BenefitItem icon={<Sparkles className="w-5 h-5 text-orange-400" />} text="All coaches included" />
                <BenefitItem icon={<Zap className="w-5 h-5 text-blue-400" />} text="Fluff levels 1–10" />
                <BenefitItem icon={<Shield className="w-5 h-5 text-green-400" />} text="Saved chats & custom voice" />
                <BenefitItem icon={<Heart className="w-5 h-5 text-red-400" />} text="Trade Lab Pro included" />
              </div>
            </div>

            {/* Right Side: Pricing Options */}
            <div className="md:w-1/2 p-12 flex flex-col justify-center space-y-6">
              <PricingCard 
                title="Free"
                price="$0"
                period=""
                description="Forever free. Fluff levels 1–5. All coaches. Trade Lab included. No card needed."
                onClick={() => onSelect('monthly')}
                highlight={false}
              />
              
              <PricingCard 
                title="Beanbag Plus"
                price="$7"
                period="/ mo"
                description="Fluff levels 6–10. Crisp/Fluffy toggle. Saved chats. Custom coach voice. For the dedicated sitter."
                onClick={() => onSelect('monthly')}
                highlight={true}
              />

              <PricingCard 
                title="Trade Lab Pro"
                price="$15"
                period="/ mo"
                description="Parts lists. Wiring diagrams. Code exports. For builders, not just thinkers."
                onClick={() => onSelect('monthly')}
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
