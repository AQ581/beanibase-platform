import { FC, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, BookOpen, Cpu, Wrench, ArrowRight } from 'lucide-react';
import { Coach } from '../types';
import { COACHES } from '../constants';
import { BeanibaseLogo } from './BeanibaseLogo';

interface ResearchSectionProps {
  onSelectCoach: (coach: Coach, initialQuery?: string) => void;
}

export const ResearchSection: FC<ResearchSectionProps> = ({ onSelectCoach }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const tradeCoach = COACHES.find(c => c.id === 'trade-skill-learning');

  if (!tradeCoach) return null;

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      onSelectCoach(tradeCoach, searchQuery.trim());
    } else {
      onSelectCoach(tradeCoach);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[48px] bg-slate-900 p-12 text-white shadow-2xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-slate-700 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-slate-800 rounded-full blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 backdrop-blur-md rounded-full border border-slate-700">
            <BeanibaseLogo size="sm" iconClassName="text-white" />
            <span className="text-xs font-bold uppercase tracking-widest">Beanibase Trade Lab</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-7xl font-serif font-bold tracking-tighter leading-[0.9]">
              Master any trade. <br />
              <span className="italic text-slate-400">Master the craft.</span>
            </h2>
            <p className="text-xl text-slate-300 font-light leading-relaxed max-w-md">
              Our <span className="font-bold text-white">Deep Research Engine</span> synthesizes technical manuals, industry standards, and expert blueprints in seconds.
            </p>
          </div>

          {/* Empty State / Quick Start */}
          <div className="space-y-6">
            <p className="text-slate-400 italic">
              "The lab is quiet. No projects running. No half-soldered wires. That changes now."
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onSelectCoach(tradeCoach, "How do I fix a dripping faucet?")}
                className="px-6 py-3 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-all text-sm font-medium"
              >
                Fix a dripping faucet
              </button>
              <button 
                onClick={() => onSelectCoach(tradeCoach, "Build a line-following robot from scratch")}
                className="px-6 py-3 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-all text-sm font-medium"
              >
                Build a robot
              </button>
              <button 
                onClick={() => onSelectCoach(tradeCoach, "What's the first tool every electrician buys?")}
                className="px-6 py-3 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-all text-sm font-medium"
              >
                Electrician tools
              </button>
            </div>
          </div>

          {/* Enter the Lab Button */}
          <button 
            onClick={() => onSelectCoach(tradeCoach)}
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg"
          >
            <span>Enter the Lab</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative hidden lg:block">
          <div className="aspect-square bg-white/5 backdrop-blur-sm rounded-[40px] border border-white/10 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold">User</span>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-sm font-light">
                  How do I build an AI robot from scratch?
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 text-purple-600" />
                </div>
                <div className="bg-white/20 rounded-2xl p-4 text-sm font-medium leading-relaxed">
                  Building an AI robot involves three core pillars: Hardware (Mechanical), Electronics (Sensors/Actuators), and Software (AI/Logic). Let's start with the mechanical structure...
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-1/3 h-full bg-white/40"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
