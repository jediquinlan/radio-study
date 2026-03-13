import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { supabase } from "./supabase";
export function Home({ session }) {
    return (_jsxs("div", { style: {
            padding: 24,
            maxWidth: 600,
            margin: "0 auto",
            fontFamily: "system-ui, sans-serif",
        }, children: [_jsx("h1", { style: { fontSize: 28, fontWeight: 800, color: "#333333" }, children: "Radio Lingo" }), _jsxs("p", { style: { color: "#777" }, children: ["Signed in as ", session.user.email] }), _jsx("button", { onClick: () => supabase.auth.signOut(), style: {
                    borderRadius: 16,
                    backgroundColor: "#FFFFFF",
                    border: "2px solid #E5E5E5",
                    padding: "14px 24px",
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    color: "#333333",
                }, children: "Sign Out" })] }));
}
