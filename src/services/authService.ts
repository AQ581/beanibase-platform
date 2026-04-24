import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth as firebaseAuth } from '../firebase';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export const auth = firebaseAuth;

export const loginWithGoogle = async (): Promise<User> => {
  try {
    console.log("DEBUG: Initiating Google Login Popup...");
    const result = await signInWithPopup(auth, provider);
    console.log("DEBUG: Login Successful for:", result.user.email);
    return result.user;
  } catch (error: any) {
    console.error("DEBUG: AuthService Popup Error:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
