import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { YStack, Text } from "tamagui";
import { RoundedButton, StyledInput, ScreenTitle, Subtitle, colors, } from "@radio-lingo/ui";
import { supabase } from "./supabase";
export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
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
    return (_jsx(YStack, { flex: 1, justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: colors.white, children: _jsxs(YStack, { gap: 12, width: 360, padding: 24, children: [_jsx(ScreenTitle, { children: "Radio Lingo" }), _jsx(Subtitle, { children: "Sign in to continue" }), _jsx(StyledInput, { placeholder: "Email", value: email, onChangeText: setEmail, autoCapitalize: "none", keyboardType: "email-address" }), _jsx(StyledInput, { placeholder: "Password", value: password, onChangeText: setPassword, secureTextEntry: true, autoCapitalize: "none" }), error && (_jsx(Text, { color: colors.red, fontSize: 14, children: error })), _jsx(RoundedButton, { title: loading ? "SIGNING IN..." : "SIGN IN", onPress: handleLogin, disabled: loading })] }) }));
}
