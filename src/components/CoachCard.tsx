import { FC, memo } from 'react';
import { motion } from 'motion/react';
import { Coffee, Shield, Palette, Briefcase, Sparkles, Search } from 'lucide-react';
import { Coach } from '../types';
import { cn } from '../lib/utils';

interface CoachCardProps {
  coach: Coach;
  onClick: (coach: Coach) => void;
}

export const CoachCard: FC<CoachCardProps> = memo(({ coach, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={cn(
        "luxury-card p-8 flex flex-col justify-between h-[420px] cursor-pointer group",
        coach.color
      )}
      onClick={() => onClick(coach)}
    >
      <div className="space-y-6">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm", coach.accent)}>
          {coach.id === 'polyglot-pillow' && <Coffee className="w-7 h-7" />}
          {coach.id === 'stoic-chesterfield' && <Shield className="w-7 h-7" />}
          {coach.id === 'creative-beanbag' && <Palette className="w-7 h-7" />}
          {coach.id === 'executive-ottoman' && <Briefcase className="w-7 h-7" />}
          {coach.id === 'trade-skill-learning' && <Search className="w-7 h-7" />}
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-bold tracking-tight">{coach.name}</h3>
          <p className="text-sm font-medium opacity-60 uppercase tracking-widest">{coach.motto}</p>
        </div>
        <p className="text-gray-600 leading-relaxed font-light">{coach.description}</p>
      </div>
      
      <div className="pt-6 border-t border-black/5 flex items-center justify-between">
        <span className="text-sm font-bold group-hover:translate-x-1 transition-transform">Consult coach →</span>
        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Sparkles className={cn("w-4 h-4", coach.accent)} />
        </div>
      </div>
    </motion.div>
  );
});

CoachCard.displayName = 'CoachCard';
