import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { supabase } from "./supabase";
export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
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
    return (_jsx("div", { style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#FFFFFF",
            fontFamily: "system-ui, sans-serif",
        }, children: _jsxs("form", { onSubmit: handleLogin, style: {
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: 360,
                padding: 24,
            }, children: [_jsx("h1", { style: {
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#333333",
                        textAlign: "center",
                        margin: 0,
                    }, children: "Radio Lingo" }), _jsx("p", { style: {
                        fontSize: 16,
                        color: "#777",
                        textAlign: "center",
                        margin: "0 0 16px",
                    }, children: "Sign in to continue" }), _jsx("input", { type: "email", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), style: {
                        borderRadius: 16,
                        border: "2px solid #E5E5E5",
                        backgroundColor: "#F7F7F7",
                        padding: "14px 16px",
                        fontSize: 16,
                        outline: "none",
                    } }), _jsx("input", { type: "password", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), style: {
                        borderRadius: 16,
                        border: "2px solid #E5E5E5",
                        backgroundColor: "#F7F7F7",
                        padding: "14px 16px",
                        fontSize: 16,
                        outline: "none",
                    } }), error && (_jsx("p", { style: { color: "#EE2A33", fontSize: 14, margin: 0 }, children: error })), _jsx("button", { type: "submit", disabled: loading, style: {
                        borderRadius: 16,
                        backgroundColor: "#58CC02",
                        borderBottom: "4px solid #46A302",
                        border: "none",
                        borderBottomStyle: "solid",
                        borderBottomWidth: 4,
                        borderBottomColor: "#46A302",
                        color: "#FFFFFF",
                        padding: "16px",
                        fontSize: 16,
                        fontWeight: 800,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1,
                    }, children: loading ? "Signing in..." : "Sign In" })] }) }));
}
