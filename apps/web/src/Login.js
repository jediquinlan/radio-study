import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { YStack, Text } from "tamagui";
import { RoundedButton, StyledInput, ScreenTitle, Subtitle, colors, APP_NAME, } from "@radio-lingo/ui";
import { supabase } from "./supabase";
import { WebCharacter } from "./WebCharacter";
export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mood, setMood] = useState("normal");
    // Cycle between normal and happy every few seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setMood("happy");
            setTimeout(() => setMood("normal"), 1500);
        }, 4000);
        return () => clearInterval(interval);
    }, []);
    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error)
            setError(error.message);
        setLoading(false);
    };
    return (_jsx(YStack, { flex: 1, justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: colors.white, children: _jsxs(YStack, { gap: 12, maxWidth: 360, width: "100%", padding: 24, alignItems: "center", children: [_jsx(WebCharacter, { width: 140, height: 168, mood: mood }), _jsx(ScreenTitle, { children: APP_NAME }), _jsx(Subtitle, { children: "Sign in to continue" }), _jsxs(YStack, { gap: 12, width: "100%", marginTop: 8, children: [_jsx(StyledInput, { placeholder: "Email", value: email, onChangeText: setEmail, autoCapitalize: "none", keyboardType: "email-address" }), _jsx(StyledInput, { placeholder: "Password", value: password, onChangeText: setPassword, secureTextEntry: true, autoCapitalize: "none" })] }), error && (_jsx(Text, { color: colors.red, fontSize: 14, children: error })), _jsx(YStack, { width: "100%", marginTop: 12, children: _jsx(RoundedButton, { title: loading ? "SIGNING IN..." : "SIGN IN", onPress: handleLogin, disabled: loading }) })] }) }));
}
