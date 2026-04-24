import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId.trim() !== "")
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Use Local Persistence - This keeps the user logged in across multiple tabs on beanibase.com
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence setup failed:", err);
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  console.error(`Firestore Error [${operationType}] at [${path}]:`, error);
}
