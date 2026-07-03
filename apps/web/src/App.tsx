import { TamaguiProvider, Theme } from "tamagui";
import { tamaguiConfig } from "@radio-lingo/ui";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";
import { Login } from "./Login";
import { Home } from "./Home";
import { Confirmed } from "./Confirmed";
import { Support } from "./Support";
import { Reset } from "./Reset";
import { Privacy } from "./Privacy";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [support, setSupport] = useState(false);
  const [reset, setReset] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  useEffect(() => {
    // Check if this is the email confirmation redirect
    if (window.location.pathname === "/confirmed") {
      setConfirmed(true);
    }
    // Public support page (used as the App Store "Support URL")
    if (window.location.pathname === "/support") {
      setSupport(true);
    }
    // Password-reset landing (from the reset email link)
    if (window.location.pathname === "/reset") {
      setReset(true);
    }
    // Public privacy policy (used as the App Store "Privacy Policy URL")
    if (window.location.pathname === "/privacy") {
      setPrivacy(true);
    }

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
        {reset ? (
          <Reset />
        ) : privacy ? (
          <Privacy />
        ) : support ? (
          <Support />
        ) : confirmed ? (
          <Confirmed />
        ) : session ? (
          <Home session={session} />
        ) : (
          <Login />
        )}
      </Theme>
    </TamaguiProvider>
  );
}
