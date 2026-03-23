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

interface HomeProps {
  session: Session;
}

export function Home({ session }: HomeProps) {
  const [poolData, setPoolData] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [session]);

  async function loadProgress() {
    const { data: responses } = await supabase
      .from("user_responses")
      .select("question_id, is_correct")
      .eq("user_id", session.user.id);

    const grouped: Record<string, { correct: number; total: number; seen: Set<string> }> = {};
    for (const r of responses ?? []) {
      const sub = r.question_id.slice(0, 2);
      if (!grouped[sub]) grouped[sub] = { correct: 0, total: 0, seen: new Set() };
      grouped[sub].total++;
      grouped[sub].seen.add(r.question_id);
      if (r.is_correct) grouped[sub].correct++;
    }

    const pools: PoolData[] = (["technician", "general", "extra"] as PoolId[])
      .map((pool) => {
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
        return {
          pool,
          label: POOL_LABELS[pool],
          subelements,
        };
      })
      .filter((p) => p.subelements.some((s) => s.seen > 0));

    setPoolData(pools);
    setLoading(false);
  }

  return (
    <div
      style={{
        padding: 24,
        paddingTop: 48,
        maxWidth: 700,
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800, color: colors.textPrimary, margin: "0 0 4px 0" }}>
        Radio Lingo
      </h1>
      <p style={{ color: colors.grayText, margin: "0 0 24px 0", fontSize: 16 }}>
        Signed in as {session.user.email}
      </p>

      {loading ? (
        <p style={{ color: colors.grayText }}>Loading progress...</p>
      ) : poolData.length === 0 ? (
        <p style={{ color: colors.grayText, fontSize: 16 }}>
          No study data yet. Start reviewing questions in the app to see your progress here.
        </p>
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

      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          marginTop: 32,
          borderRadius: 16,
          backgroundColor: colors.white,
          border: `2px solid ${colors.grayBorder}`,
          padding: "14px 24px",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: 1,
          textTransform: "uppercase",
          cursor: "pointer",
          color: colors.textPrimary,
        }}
      >
        Sign Out
      </button>
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
