import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface HomeProps {
  session: Session;
}

export function Home({ session }: HomeProps) {
  return (
    <div
      style={{
        padding: 24,
        maxWidth: 600,
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#333333" }}>
        Radio Lingo
      </h1>
      <p style={{ color: "#777" }}>
        Signed in as {session.user.email}
      </p>
      <button
        onClick={() => supabase.auth.signOut()}
        style={{
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
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
