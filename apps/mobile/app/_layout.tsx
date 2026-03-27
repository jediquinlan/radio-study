import { Session } from '@supabase/supabase-js';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { TamaguiProvider, Theme } from 'tamagui';
import { tamaguiConfig } from '../tamagui.config';
import AuthGate from './auth';
import { supabase } from '../lib/supabase';
import { Character } from '@radio-lingo/character';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Character width={160} height={192} />
      </View>
    );
  }

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
