import { useState, useEffect, lazy, Suspense } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, db, onAuthStateChanged, User, handleFirestoreError, OperationType } from './firebase';
import { getRedirectResult } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { COACHES } from './constants';
import { Coach, UserProfile, CheckIn } from './types';
import { CoachCard } from './components/CoachCard';
import { ResearchSection } from './components/ResearchSection';
import { MasterTechnicianSection } from './components/MasterTechnicianSection';
import { SubscriptionManagement } from './components/SubscriptionManagement';
import { HowItWorksModal } from './components/HowItWorksModal';
import { BeanibaseLogo } from './components/BeanibaseLogo';
import { NotFound } from './components/NotFound';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Sparkles, Coffee, Shield, Palette, Briefcase, TrendingUp, History, Loader2 as LucideLoader2, Crown } from 'lucide-react';

const ChatSession = lazy(() => import('./components/ChatSession').then(m => ({ default: m.ChatSession })));
const PricingModal = lazy(() => import('./components/PricingModal').then(m => ({ default: m.PricingModal })));

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [initialQuery, setInitialQuery] = useState<string | undefined>(undefined);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        console.log("DEBUG: Authenticated user UID:", u.uid);
        const unsubProfile = onSnapshot(userRef, (docSnap) => {
          console.log("DEBUG: Snapshot for path:", userRef.path, "exists:", docSnap.exists());
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || 'Coach Potato',
              photoURL: u.photoURL || '',
              cushionFluffiness: 0,
              trialMessagesUsed: 0,
              subscriptionType: 'free',
              createdAt: new Date().toISOString(),
            };
            setDoc(userRef, newProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${u.uid}`));
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, `users/${u.uid}`));

        const checkInsRef = collection(db, 'users', u.uid, 'checkIns');
        const q = query(checkInsRef, orderBy('timestamp', 'desc'), limit(10));
        const unsubCheckIns = onSnapshot(q, (snap) => {
          setCheckIns(snap.docs.map(d => d.data() as CheckIn));
        }, (err) => handleFirestoreError(err, OperationType.GET, `users/${u.uid}/checkIns`));

        return () => {
          unsubProfile();
          unsubCheckIns();
        };
      } else {
        setProfile(null);
        setCheckIns([]);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId && user) {
      // In a real app, you'd verify the session on the backend
      // For this demo, we'll just update the user profile
      const updateSubscription = async () => {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { 
          subscriptionType: 'monthly', // Defaulting to monthly for session success
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }, { merge: true }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
        
        // Clean up URL
        window.history.replaceState({}, document.title, "/");
      };
      updateSubscription();
    }
  }, [user]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login failed:", err);
      setLoginError(err.message || "An unexpected error occurred during login.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubscription = async (type: 'monthly' | 'lifetime') => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error(session.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error("Subscription failed:", err);
      // Fallback for demo if Stripe is not configured
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { 
        subscriptionType: type,
        subscriptionExpiry: type === 'monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
      }, { merge: true }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`));
      setIsPricingOpen(false);
    }
  };

  const handleCheckIn = async (reflection: string) => {
    if (!user || !selectedCoach) return;
    
    // Optimistic Update
    const currentFluff = profile?.cushionFluffiness || 0;
    const currentUsed = profile?.trialMessagesUsed || 0;
    setProfile(prev => prev ? { 
      ...prev, 
      cushionFluffiness: currentFluff + 1,
      trialMessagesUsed: currentUsed + 1
    } : null);

    const checkIn: CheckIn = {
      uid: user.uid,
      coachId: selectedCoach.id,
      timestamp: new Date().toISOString(),
      reflection,
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'checkIns'), checkIn).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/checkIns`));
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { 
        cushionFluffiness: currentFluff + 1,
        trialMessagesUsed: currentUsed + 1
      }, { merge: true }).catch(e => {
        // Rollback on error
        setProfile(prev => prev ? { ...prev, cushionFluffiness: currentFluff } : null);
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
      });
    } catch (err) {
      console.error("Check-in failed:", err);
      setProfile(prev => prev ? { ...prev, cushionFluffiness: currentFluff } : null);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F5F2ED]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F5F2ED] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 relative z-10"
        >
          <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
            <BeanibaseLogo size="sm" />
            <span className="text-sm font-medium tracking-tight">Beanibase</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter leading-none">
            Become 1% better,<br />
            <span className="italic text-orange-600">comfortably.</span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
            A supportive space where AI personas don't yell at you, but sit with you through the journey of growth.
          </p>

          {loginError && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-3 rounded-2xl text-sm max-w-md mx-auto">
              {loginError}
            </div>
          )}

          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoggingIn ? (
              <LucideLoader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{isLoggingIn ? 'Connecting...' : 'Start your Beanibase Sit'}</span>
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] pb-24 text-[#1A1A1A]">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-black/5">
        <div className="flex items-center space-x-3">
          <BeanibaseLogo size="sm" />
          <span className="text-xl font-display font-bold tracking-tight">Beanibase</span>
        </div>

        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setIsHowItWorksOpen(true)}
            className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"
          >
            <span className="text-sm font-medium">How it works</span>
          </button>

          {profile?.subscriptionType === 'free' && (
            <button 
              onClick={() => setIsPricingOpen(true)}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-full shadow-lg hover:scale-105 transition-all group"
            >
              <Crown className="w-4 h-4 text-orange-400 group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-bold">Go Premium</span>
            </button>
          )}
          <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
            <Crown className={cn("w-4 h-4", profile?.subscriptionType === 'free' ? "text-gray-300" : "text-orange-400")} />
            <span className="text-sm font-medium">
              {profile?.subscriptionType === 'free' ? 'Free Plan' : 'Beanbag Plus'}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium">
              Fluffiness: {profile?.cushionFluffiness || 0} 
              <span className="text-gray-400 ml-1">
                (Level {Math.floor((profile?.cushionFluffiness || 0) / 10) + 1})
              </span>
            </span>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 text-gray-500" />
          </button>
          <img 
            src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach'} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12 space-y-16">
        {/* Hero Section */}
        <section className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">
              Welcome home, <span className="italic text-orange-600">{profile?.displayName?.split(' ')[0]}</span>.
            </h2>
            <p className="text-xl text-gray-500 font-light">Which coach are we sitting with today?</p>
          </motion.div>
        </section>

        {/* Coach Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {COACHES.filter(c => c.id !== 'trade-skill-learning' && c.id !== 'original-beanbag').map((coach, i) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <CoachCard 
                coach={coach} 
                onClick={setSelectedCoach} 
              />
            </motion.div>
          ))}
        </section>

        {/* Original Beanbag */}
        <section className="bg-orange-50 rounded-[40px] p-10 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold tracking-tight text-black">The Original Beanbag</h3>
              <p className="text-sm text-gray-500 font-light">No specialty. Just a good chat.</p>
            </div>
            <button 
              onClick={() => setSelectedCoach(COACHES.find(c => c.id === 'original-beanbag')!)}
              className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-sm border border-orange-100"
            >
              Start Chat
            </button>
          </div>
        </section>

        <ResearchSection onSelectCoach={(coach, query) => {
          setSelectedCoach(coach);
          setInitialQuery(query);
        }} />
        <MasterTechnicianSection onSelectCoach={setSelectedCoach} />

        {/* Subscription Management */}
        <SubscriptionManagement 
          profile={profile} 
          onUpgrade={() => setIsPricingOpen(true)} 
          onLogin={handleLogin}
          isLoggingIn={isLoggingIn}
        />

        {/* Progress Card */}
        <section className="bg-white rounded-[40px] p-10 shadow-sm border border-black/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BeanibaseLogo size="xl" className="bg-transparent shadow-none rotate-12" iconClassName="text-orange-600" />
          </div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="space-y-1">
              <h3 className="text-2xl font-display font-bold tracking-tight">Cushion Fluffiness</h3>
              <p className="text-sm text-gray-400 font-light">Fluff = unlocks deeper answers + personalized style</p>
            </div>
            <div className="px-6 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-bold uppercase tracking-widest">
              Level {Math.floor((profile?.cushionFluffiness || 0) / 10) + 1}
            </div>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest">
              <span>Current Fluff</span>
              <span>{profile?.cushionFluffiness || 0} / {((Math.floor((profile?.cushionFluffiness || 0) / 10) + 1) * 10)}</span>
            </div>
            <div className="h-6 bg-gray-50 rounded-full overflow-hidden border border-black/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((profile?.cushionFluffiness || 0) % 10) * 10}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 shadow-lg shadow-orange-200"
              />
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-400 italic font-light">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <p>Keep sitting with your coaches to unlock new insights and fluff your cushion.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-black/5">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
              <span className="text-xl font-serif font-bold text-orange-600">1</span>
            </div>
            <h4 className="text-lg font-bold">Pick a Coach</h4>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              Choose an AI persona that matches your current goal—whether it's learning a language or solving a logic puzzle.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <span className="text-xl font-serif font-bold text-blue-600">2</span>
            </div>
            <h4 className="text-lg font-bold">Consult & Chat</h4>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              Engage in low-pressure conversation. No streaks, no pressure—just a supportive space to grow at your own pace.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
              <span className="text-xl font-serif font-bold text-green-600">3</span>
            </div>
            <h4 className="text-lg font-bold">Fluff Your Cushion</h4>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              Every interaction increases your "Cushion Fluffiness," unlocking deeper insights and more personalized coaching.
            </p>
          </div>
        </section>

        {/* Stats & History */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[40px] p-10 shadow-sm border border-black/5 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h3 className="text-xl font-display font-bold tracking-tight">Consistency Flow</h3>
              </div>
              <span className="text-sm text-gray-400">Last 14 days</span>
            </div>
            
            <div className="h-48 flex items-end justify-between px-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-3 rounded-full transition-all duration-1000",
                    i % 3 === 0 ? "bg-orange-200 h-24" : "bg-gray-100 h-12",
                    i === 13 && "bg-orange-500 h-32 shadow-lg shadow-orange-200"
                  )}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-400 font-light italic">
              "No streaks that punish you. Just cushions to return to."
            </p>
          </div>

          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-black/5 space-y-8">
            <div className="flex items-center space-x-3">
              <History className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-display font-bold tracking-tight">Recent Sits</h3>
            </div>
            
            <div className="space-y-6">
              {checkIns.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Your coach is waiting for its first session.</p>
              ) : (
                checkIns.map((ci, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-2" />
                    <div>
                      <p className="text-sm font-bold">{COACHES.find(c => c.id === ci.coachId)?.name}</p>
                      <p className="text-xs text-gray-400 mb-1">{new Date(ci.timestamp).toLocaleDateString()}</p>
                      {ci.reflection && (
                        <p className="text-xs text-gray-500 line-clamp-2 font-light italic">
                          "{ci.reflection}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 pb-10 border-t border-black/5 pt-10 text-center">
          <div className="flex items-center justify-center space-x-3">
            <BeanibaseLogo className="w-6 h-6 opacity-40" />
            <span className="text-sm text-gray-400 font-medium">© 2026 Beanibase. All rights reserved.</span>
          </div>
        </footer>
      </main>

      {/* Chat Session Modal */}
      <AnimatePresence mode="wait">
        {selectedCoach && (
          <Suspense fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <LucideLoader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          }>
            <ChatSession 
              coach={selectedCoach} 
              onClose={() => {
                setSelectedCoach(null);
                setInitialQuery(undefined);
              }}
              onCheckIn={handleCheckIn}
              initialMessage={initialQuery}
              subscriptionType={profile?.subscriptionType}
              onUpgrade={() => setIsPricingOpen(true)}
              messagesUsed={profile?.trialMessagesUsed || 0}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <PricingModal 
          isOpen={isPricingOpen} 
          onClose={() => setIsPricingOpen(false)} 
          onSelect={handleSubscription}
        />
      </Suspense>

      <HowItWorksModal 
        isOpen={isHowItWorksOpen} 
        onClose={() => setIsHowItWorksOpen(false)} 
      />
    </div>
  );
}

// Loader component defined at the top

