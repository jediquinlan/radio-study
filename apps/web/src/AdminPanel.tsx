import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { colors } from "@radio-lingo/ui";
import { supabase } from "./supabase";
import { ProgressChart, type PoolData } from "./ProgressChart";
import {
  type PoolId,
  POOL_LABELS,
  getSubelements,
  getSubelementMeta,
  getQuestionCountBySubelement,
} from "./questions";

interface AdminPanelProps {
  session: Session;
  onBack: () => void;
}

interface UserSummary {
  id: string;
  email: string;
  callSign?: string;
  firstName?: string;
  lastName?: string;
  totalResponses: number;
  totalCorrect: number;
}

export function AdminPanel({ session, onBack }: AdminPanelProps) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [poolData, setPoolData] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    // Get all responses grouped by user
    const { data: responses } = await supabase
      .from("user_responses")
      .select("user_id, is_correct");

    if (!responses) {
      setLoading(false);
      return;
    }

    // Group by user
    const userMap = new Map<string, { total: number; correct: number }>();
    for (const r of responses) {
      const u = userMap.get(r.user_id) ?? { total: 0, correct: 0 };
      u.total++;
      if (r.is_correct) u.correct++;
      userMap.set(r.user_id, u);
    }

    // Get user profiles from auth (via user metadata in responses)
    // We'll fetch profiles from the profiles table if it exists,
    // otherwise just show user IDs
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, call_sign, first_name, last_name");

    const profileMap = new Map<string, any>();
    for (const p of profiles ?? []) {
      profileMap.set(p.id, p);
    }

    const userList: UserSummary[] = [];
    for (const [userId, stats] of userMap) {
      const profile = profileMap.get(userId);
      userList.push({
        id: userId,
        email: profile?.email ?? userId.slice(0, 8) + "...",
        callSign: profile?.call_sign,
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        totalResponses: stats.total,
        totalCorrect: stats.correct,
      });
    }

    // Sort by most active
    userList.sort((a, b) => b.totalResponses - a.totalResponses);
    setUsers(userList);
    setLoading(false);
  }

  async function selectUser(user: UserSummary) {
    setSelectedUser(user);
    setLoadingStats(true);

    const { data: responses } = await supabase
      .from("user_responses")
      .select("question_id, is_correct")
      .eq("user_id", user.id);

    const grouped: Record<string, { correct: number; total: number; seen: Set<string> }> = {};
    for (const r of responses ?? []) {
      const sub = r.question_id.slice(0, 2);
      if (!grouped[sub]) grouped[sub] = { correct: 0, total: 0, seen: new Set() };
      grouped[sub].total++;
      grouped[sub].seen.add(r.question_id);
      if (r.is_correct) grouped[sub].correct++;
    }

    const pools: PoolData[] = (["technician", "general", "extra"] as PoolId[]).map((pool) => {
      const subs = getSubelements(pool);
      const subelements = subs.map((sub) => {
        const meta = getSubelementMeta(pool, sub);
        const poolTotal = getQuestionCountBySubelement(pool, sub);
        const s = grouped[sub] ?? { correct: 0, total: 0, seen: new Set() };
        return {
          subelement: sub,
          title: meta?.title ?? sub,
          correct: s.correct,
          seen: s.seen.size,
          poolTotal,
        };
      });
      return { pool, label: POOL_LABELS[pool], subelements };
    });

    setPoolData(pools);
    setLoadingStats(false);
  }

  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

  return (
    <div
      style={{
        padding: 24,
        paddingTop: 48,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={onBack} style={styles.backBtn}>
          ← Dashboard
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
          Admin Panel
        </h1>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* User list */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <h3 style={styles.sectionLabel}>
            Users ({users.length})
          </h3>
          {loading ? (
            <p style={{ color: colors.grayText }}>Loading users...</p>
          ) : users.length === 0 ? (
            <p style={{ color: colors.grayText }}>No users with study data.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => selectUser(user)}
                  style={{
                    ...styles.userCard,
                    borderColor: selectedUser?.id === user.id ? colors.primary : colors.grayBorder,
                    backgroundColor: selectedUser?.id === user.id ? "#FFF5F3" : colors.white,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: colors.textPrimary, fontSize: 14 }}>
                      {user.email}
                    </span>
                    <span style={{ fontSize: 12, color: colors.grayText, fontWeight: 700 }}>
                      {pct(user.totalCorrect, user.totalResponses)}%
                    </span>
                  </div>
                  {(user.firstName || user.callSign) && (
                    <div style={{ fontSize: 12, color: colors.grayText, marginTop: 2 }}>
                      {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                      {user.callSign && ` (${user.callSign})`}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: colors.grayText, marginTop: 4 }}>
                    {user.totalResponses} answers · {user.totalCorrect} correct
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedUser ? (
            <>
              <h3 style={styles.sectionLabel}>
                Stats for {selectedUser.email}
              </h3>
              {loadingStats ? (
                <p style={{ color: colors.grayText }}>Loading stats...</p>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                    <LegendItem color={colors.primary} label="Correct" />
                    <LegendItem color={colors.peach} label="Seen" />
                    <LegendItem color={colors.grayBg} border={colors.grayBorder} label="Unseen" />
                  </div>
                  <ProgressChart data={poolData} />
                </>
              )}
            </>
          ) : (
            <div style={{ padding: 48, textAlign: "center", color: colors.grayText }}>
              Select a user to view their stats.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, border }: { color: string; label: string; border?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          backgroundColor: color,
          border: border ? `1px solid ${border}` : undefined,
        }}
      />
      <span style={{ fontSize: 12, color: colors.grayText, fontFamily: "system-ui, sans-serif" }}>
        {label}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backBtn: {
    borderRadius: 12,
    backgroundColor: colors.white,
    border: `2px solid ${colors.grayBorder}`,
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    color: colors.textPrimary,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.textPrimary,
    margin: "0 0 12px 0",
  },
  userCard: {
    textAlign: "left" as const,
    borderRadius: 12,
    border: `2px solid`,
    padding: 12,
    cursor: "pointer",
    backgroundColor: colors.white,
    width: "100%",
  },
};
