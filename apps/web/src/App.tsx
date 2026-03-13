import { TamaguiProvider, Theme } from "tamagui";
import { tamaguiConfig } from "@radio-lingo/ui";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";
import { Login } from "./Login";
import { Home } from "./Home";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Theme name="light">
        {session ? <Home session={session} /> : <Login />}
      </Theme>
    </TamaguiProvider>
  );
}
