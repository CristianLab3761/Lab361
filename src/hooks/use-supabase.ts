import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error.message);
        // Si el refresh token no se encuentra o es inválido, forzamos limpieza
        if (error.message.includes('Refresh Token') || error.message.includes('not found')) {
          supabase.auth.signOut().then(() => {
            setUser(null);
            setLoading(false);
            window.location.href = '/login'; // Forzamos redirección para limpiar estado global
          });
          return;
        }
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useSupabaseCollection<T = any>(table: string | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!table) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchData = async () => {
      let allData: any[] = [];
      let from = 0;
      const step = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: result, error: fetchError } = await supabase
          .from(table)
          .select('*')
          .range(from, from + step - 1);

        if (fetchError) {
          setError(fetchError);
          setData(null);
          setIsLoading(false);
          return;
        }

        if (result && result.length > 0) {
          allData = [...allData, ...result];
          if (result.length < step) {
            hasMore = false;
          } else {
            from += step;
          }
        } else {
          hasMore = false;
        }
      }

      setData(allData as T[]);
      setError(null);
      setIsLoading(false);
    };

    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        // Redo fetch on any change for simplicity, or handle payload manually
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

  return { data, isLoading, error };
}

export function useSupabaseDoc<T = any>(table: string | null, id: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!table || !id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchData = async () => {
      const { data: result, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        setError(fetchError);
        setData(null);
      } else {
        setData(result as T);
        setError(null);
      }
      setIsLoading(false);
    };

    fetchData();

    // Real-time subscription for this specific document
    const channel = supabase
      .channel(`public:${table}:id=eq.${id}`)
      .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table,
          filter: `id=eq.${id}` 
      }, (payload) => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, id]);

  return { data, isLoading, error };
}
