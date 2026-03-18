'use client';

import {useEffect} from 'react';
import {useToast} from '@/hooks/use-toast';
import {errorEmitter} from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

export function FirebaseErrorListener() {
  const {toast} = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.toString());
      toast({
        variant: 'destructive',
        title: 'Error de Permiso',
        description: error.toString(),
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
