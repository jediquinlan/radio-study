import { useState } from "react";
import { supabase } from "./supabase";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: 360,
          padding: 24,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#333333",
            textAlign: "center",
            margin: 0,
          }}
        >
          Radio Lingo
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "#777",
            textAlign: "center",
            margin: "0 0 16px",
          }}
        >
          Sign in to continue
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            borderRadius: 16,
            border: "2px solid #E5E5E5",
            backgroundColor: "#F7F7F7",
            padding: "14px 16px",
            fontSize: 16,
            outline: "none",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            borderRadius: 16,
            border: "2px solid #E5E5E5",
            backgroundColor: "#F7F7F7",
            padding: "14px 16px",
            fontSize: 16,
            outline: "none",
          }}
        />

        {error && (
          <p style={{ color: "#EE2A33", fontSize: 14, margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
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
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
