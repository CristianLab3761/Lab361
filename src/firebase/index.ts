import {initializeApp, getApps, type FirebaseApp} from 'firebase/app';
import {getAuth, type Auth, connectAuthEmulator} from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
  connectFirestoreEmulator,
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
    auth = getAuth(app);
    firestore = getFirestore(app);

    // After initializing, you can connect to emulators if you're in a dev environment
    if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
      const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || 'localhost';
      // It's important to check if the emulators are already running to avoid errors
      // @ts-ignore - _isInitialized is not in the type definition
      if (!auth.emulatorConfig) {
        connectAuthEmulator(auth, `http://${host}:9099`, {
          disableWarnings: true,
        });
      }
      // @ts-ignore - _isInitialized is not in the type definition
      if (!firestore._isInitialized) {
        connectFirestoreEmulator(firestore, host, 8080);
      }
    }
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    firestore = getFirestore(app);
  }

  return {app, auth, firestore};
}
