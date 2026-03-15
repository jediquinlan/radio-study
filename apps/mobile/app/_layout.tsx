import { Session } from '@supabase/supabase-js';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { TamaguiProvider, Theme } from 'tamagui';
import { tamaguiConfig } from '../tamagui.config';
import AuthGate from './auth';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setSession(session);
    });
  }, []);

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Theme name="light">
        {!session ? (
          <AuthGate />
        ) : (
          <Stack screenOptions={{ headerShown: false }} />
        )}
      </Theme>
    </TamaguiProvider>
  );
}
