import { FC } from 'react';
import { motion } from 'motion/react';
import { Crown, Calendar, CheckCircle2, CreditCard, ArrowRight, ShieldCheck, Zap, LogIn, Loader2 as LucideLoader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface SubscriptionManagementProps {
  profile: UserProfile | null;
  onUpgrade: () => void;
  onLogin: () => void;
  isLoggingIn?: boolean;
}

export const SubscriptionManagement: FC<SubscriptionManagementProps> = ({ 
  profile, 
  onUpgrade, 
  onLogin, 
  isLoggingIn
}) => {
  const isPremium = profile?.subscriptionType && profile.subscriptionType !== 'free';
  const expiryDate = profile?.subscriptionExpiry ? new Date(profile.subscriptionExpiry).toLocaleDateString() : null;

  if (!profile) {
    return (
      <section className="bg-white rounded-[40px] p-10 shadow-sm border border-black/5 space-y-6 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8 text-orange-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-bold tracking-tight">Membership Access</h3>
          <p className="text-sm text-gray-400 font-light max-w-md mx-auto">
            Log in to unlock premium features, track your growth, and manage your sanctuary subscription.
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <button 
            onClick={onLogin}
            disabled={isLoggingIn}
            className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-black text-white rounded-full shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoggingIn ? (
              <LucideLoader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span className="text-sm font-bold">{isLoggingIn ? 'Connecting...' : 'Log in to Beanibase'}</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-[40px] p-10 shadow-sm border border-black/5 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-2xl font-display font-bold tracking-tight">Your Membership</h3>
            {isPremium && (
              <div className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center space-x-1">
                <Crown className="w-3 h-3" />
                <span>Premium</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400 font-light">Manage your access and billing details.</p>
        </div>

        {!isPremium && (
          <button 
            onClick={onUpgrade}
            className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-full shadow-lg hover:scale-105 transition-all group"
          >
            <Zap className="w-4 h-4 text-orange-400 group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold">Upgrade to Premium</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="p-6 rounded-3xl bg-gray-50 border border-black/5 space-y-4">
          <div className="flex items-center space-x-3 text-gray-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Status</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className={cn("w-5 h-5", isPremium ? "text-green-500" : "text-gray-300")} />
            <span className="text-lg font-bold capitalize">{profile?.subscriptionType || 'Free'} Plan</span>
          </div>
        </div>

        {/* Billing Cycle Card */}
        <div className="p-6 rounded-3xl bg-gray-50 border border-black/5 space-y-4">
          <div className="flex items-center space-x-3 text-gray-400">
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Renewal</span>
          </div>
          <p className="text-lg font-bold">
            {profile?.subscriptionType === 'lifetime' ? 'Never Expires' : expiryDate || 'No active cycle'}
          </p>
        </div>

        {/* Payment Method Card */}
        <div className="p-6 rounded-3xl bg-gray-50 border border-black/5 space-y-4">
          <div className="flex items-center space-x-3 text-gray-400">
            <CreditCard className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Payment</span>
          </div>
          <p className="text-lg font-bold">
            {isPremium ? 'Stripe Secure' : 'None linked'}
          </p>
        </div>
      </div>

      {isPremium && (
        <div className="pt-4 border-t border-black/5">
          <p className="text-xs text-gray-400 italic">
            To cancel or update your payment method, please check your email for the Stripe Customer Portal link sent during your first sit.
          </p>
        </div>
      )}
    </section>
  );
};
