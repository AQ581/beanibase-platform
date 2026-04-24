import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isGuest: boolean;
  setIsGuest: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  error: null,
  isGuest: false,
  setIsGuest: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isGuest, setIsGuestState] = useState(() => {
    return localStorage.getItem('beanibase_guest_mode') === 'true';
  });

  const setIsGuest = (val: boolean) => {
    setIsGuestState(val);
    if (val) {
      localStorage.setItem('beanibase_guest_mode', 'true');
    } else {
      localStorage.removeItem('beanibase_guest_mode');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        if (user) setIsGuest(false); // Auth takes precedence
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, isGuest, setIsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
