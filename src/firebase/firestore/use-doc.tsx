'use client';

import {useEffect, useState, useMemo} from 'react';
import type {DocumentReference, DocumentData} from 'firebase/firestore';
import {onSnapshot} from 'firebase/firestore';
import {errorEmitter} from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

export function useDoc<T extends DocumentData>(
  ref: DocumentReference<T> | null
) {
  const [data, setData] = useState<(T & {id: string}) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedRef = useMemo(() => ref, [ref?.path, ref?.type]);

  useEffect(() => {
    if (!memoizedRef) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      memoizedRef,
      (doc) => {
        if (doc.exists()) {
          setData({id: doc.id, ...doc.data()} as T & {id: string});
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: memoizedRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedRef]);

  return {data, loading, error};
}
