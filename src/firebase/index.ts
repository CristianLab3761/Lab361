'use client';

import {initializeApp, getApps, type FirebaseApp} from 'firebase/app';
import {getAuth, type Auth} from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import {firebaseConfig} from './config';

// Provider and context
export {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from './provider';

// Client-side provider
export {FirebaseClientProvider} from './client-provider';

// Hooks
export {useUser} from './auth/use-user';
export {useCollection} from './firestore/use-collection';
export {useDoc} from './firestore/use-doc';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  firestore = getFirestore(app);

  return {app, auth, firestore};
}
