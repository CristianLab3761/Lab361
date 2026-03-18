'use client';

import {useEffect, useState, useMemo} from 'react';
import type {
  CollectionReference,
  DocumentData,
  Query,
} from 'firebase/firestore';
import {onSnapshot} from 'firebase/firestore';
import {errorEmitter} from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

export function useCollection<T extends DocumentData>(
  query: CollectionReference<T> | Query<T> | null
) {
  const [data, setData] = useState<
    (T & {
      id: string;
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedQuery = useMemo(() => query, [query?.path, query?.type]);

  useEffect(() => {
    if (!memoizedQuery) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as T & {id: string}
        );
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: memoizedQuery.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery]);

  return {data, loading, error};
}
