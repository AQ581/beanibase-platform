import { FC } from 'react';
import { BeanibaseLogo } from './BeanibaseLogo';

export const NotFound: FC = () => (
  <div className="h-screen flex flex-col items-center justify-center p-6 bg-[#F5F2ED] text-center space-y-8">
    <BeanibaseLogo size="lg" />
    <div className="space-y-4">
      <h1 className="text-4xl font-serif font-bold">This cushion has a hole in it.</h1>
      <p className="text-gray-500 max-w-sm">
        Page doesn't exist. Maybe it rolled away. Maybe you typed something wrong. Maybe we messed up.
      </p>
    </div>
    <div className="flex flex-col space-y-4">
      <button 
        onClick={() => window.history.back()}
        className="px-8 py-4 bg-black text-white rounded-full font-bold hover:scale-105 transition-all"
      >
        Go back to your cushion →
      </button>
      <button 
        onClick={() => window.location.href = '/'}
        className="text-orange-600 font-bold hover:underline"
      >
        Pick a coach →
      </button>
    </div>
  </div>
);
