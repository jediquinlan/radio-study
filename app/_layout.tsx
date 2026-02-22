import { Session } from '@supabase/supabase-js'; // 1. Import the type
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function RootLayout() {
  // 2. Add the type definition to useState
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // ... rest of your logic
}