'use client';

import {useEffect, useState} from 'react';
import type {FirebaseApp} from 'firebase/app';
import type {Auth} from 'firebase/auth';
import { signInAnonymously } from 'firebase/auth';
import type {Firestore} from 'firebase/firestore';

import {initializeFirebase, FirebaseProvider} from '@/firebase';
import {Skeleton} from '@/components/ui/skeleton';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebaseInstances, setFirebaseInstances] = useState<{
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    const instances = initializeFirebase();
    // Sign in anonymously to satisfy security rules
    signInAnonymously(instances.auth)
      .then(() => {
        setFirebaseInstances(instances);
      })
      .catch((error) => {
        console.error("Anonymous sign-in failed:", error);
        // Still set instances so the app doesn't hang, but auth-required features will fail
        setFirebaseInstances(instances);
      });
  }, []);

  if (!firebaseInstances) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-6">
          <Skeleton className="h-12 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      app={firebaseInstances.app}
      auth={firebaseInstances.auth}
      firestore={firebaseInstances.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
