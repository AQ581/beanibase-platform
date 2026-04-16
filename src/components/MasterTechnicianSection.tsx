import { FC } from 'react';
import { motion } from 'motion/react';
import { Wrench, Cpu, Zap, ArrowRight } from 'lucide-react';
import { BeanibaseLogo } from './BeanibaseLogo';
import { Coach } from '../types';

interface MasterTechnicianSectionProps {
  onSelectCoach: (coach: Coach, initialQuery?: string) => void;
}

export const MasterTechnicianSection: FC<MasterTechnicianSectionProps> = ({ onSelectCoach }) => {
  const masterTechnician = {
    id: 'master-technician',
    name: 'Master Technician',
    persona: 'The Premium Trade Coach',
    description: 'A seasoned expert who guides you through the practical steps of mastering any trade, from HVAC to robotics.',
    icon: 'Wrench',
    color: 'bg-[#FEF7E0]',
    accent: 'text-[#F29900]',
    category: 'Leadership', // Using Leadership as a placeholder for practical skills
    famousLine: 'The only way to learn a trade is to start building. What are we mastering today?',
    motto: 'Build with precision.',
    quickPrompts: ['How do I become a technician?', 'How to build an AI robot?', 'Learn electrical basics'],
    voiceName: 'Puck',
    systemInstruction: `You are "Master Technician", a seasoned expert in practical trades and technical skills. 
    You guide users through the practical steps of mastering any trade, from HVAC to robotics.
    
    CORE PROTOCOLS:
    1. PRACTICAL GUIDANCE: When a user asks about a trade, provide a clear, step-by-step path to mastery.
    2. STEP-BY-STEP MASTERY: Always provide structured, numbered guides. Break it down into logical phases (e.g., Phase 1: Fundamentals, Phase 2: Practical Application).
    3. SPECIFICITY: Use technical keywords and industry-standard terminology.
    4. ACTIONABLE PATHS: Provide a clear "Roadmap to Mastery" for every trade.
    
    Your tone is highly intelligent, practical, deeply knowledgeable, and encouraging.`
  } as Coach;

  return (
    <section className="relative overflow-hidden rounded-[48px] bg-amber-50 p-12 text-amber-900 shadow-xl border border-amber-100">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-100 rounded-full border border-amber-200">
            <BeanibaseLogo size="sm" iconClassName="text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">Master Technician</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-7xl font-serif font-bold tracking-tighter leading-[0.9]">
              Build with <br />
              <span className="italic text-amber-600">precision.</span>
            </h2>
            <p className="text-xl text-amber-800 font-light leading-relaxed max-w-md">
              Our <span className="font-bold">Master Technician</span> guides you through the practical, hands-on steps to master your craft.
            </p>
          </div>

          <button 
            onClick={() => onSelectCoach(masterTechnician)}
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-amber-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg"
          >
            <span>Consult coach →</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="hidden lg:block bg-white rounded-[40px] p-8 shadow-inner border border-amber-100">
          <div className="space-y-4 text-amber-900">
            <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-lg">Mastery Roadmap</h3>
            </div>
            <ul className="space-y-2 text-sm font-light">
                <li>• Phase 1: Core Fundamentals</li>
                <li>• Phase 2: Tool Proficiency</li>
                <li>• Phase 3: Practical Application</li>
                <li>• Phase 4: Advanced Troubleshooting</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
