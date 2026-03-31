import { jsx as _jsx } from "react/jsx-runtime";
import { TamaguiProvider, Theme } from "tamagui";
import { tamaguiConfig } from "@radio-lingo/ui";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { Login } from "./Login";
import { Home } from "./Home";
import { Confirmed } from "./Confirmed";
export default function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmed, setConfirmed] = useState(false);
    useEffect(() => {
        // Check if this is the email confirmation redirect
        if (window.location.pathname === "/confirmed") {
            setConfirmed(true);
        }
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);
    if (loading)
        return null;
    return (_jsx(TamaguiProvider, { config: tamaguiConfig, children: _jsx(Theme, { name: "light", children: confirmed ? _jsx(Confirmed, {}) : session ? _jsx(Home, { session: session }) : _jsx(Login, {}) }) }));
}
