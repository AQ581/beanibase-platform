import { FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, MessageSquare, Zap } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
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
            className="w-full max-w-lg bg-[#FDFCFB] rounded-[48px] shadow-2xl overflow-hidden p-10 relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-black/40" />
            </button>

            <h2 className="text-3xl font-serif font-bold mb-8">How Beanibase Works</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-bold">1. Pick a Coach</h4>
                  <p className="text-sm text-gray-500">Choose an AI persona that matches your current goal.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold">2. Consult & Chat</h4>
                  <p className="text-sm text-gray-500">Engage in low-pressure conversation to grow at your own pace.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="font-bold">3. Fluff Your Cushion</h4>
                  <p className="text-sm text-gray-500">Every interaction increases your "Cushion Fluffiness," unlocking deeper insights.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
