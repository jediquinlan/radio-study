import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { colors, APP_NAME } from "@radio-lingo/ui";
import { supabase } from "./supabase";
import { ProgressChart } from "./ProgressChart";
import { AdminPanel } from "./AdminPanel";
import { POOL_LABELS, getSubelements, getSubelementMeta, getQuestionCountBySubelement, } from "./questions";
export function Home({ session }) {
    const [poolData, setPoolData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdmin, setShowAdmin] = useState(false);
    const isAdmin = session.user.user_metadata?.is_admin === true;
    useEffect(() => {
        loadProgress();
    }, [session]);
    async function loadProgress() {
        const { data: responses } = await supabase
            .from("user_responses")
            .select("question_id, is_correct")
            .eq("user_id", session.user.id);
        const grouped = {};
        for (const r of responses ?? []) {
            const sub = r.question_id.slice(0, 2);
            if (!grouped[sub])
                grouped[sub] = { correct: 0, total: 0, seen: new Set() };
            grouped[sub].total++;
            grouped[sub].seen.add(r.question_id);
            if (r.is_correct)
                grouped[sub].correct++;
        }
        const pools = ["technician", "general", "extra"]
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
    if (showAdmin) {
        return _jsx(AdminPanel, { onBack: () => setShowAdmin(false) });
    }
    return (_jsxs("div", { style: {
            padding: 24,
            paddingTop: 48,
            maxWidth: 700,
            margin: "0 auto",
            fontFamily: "system-ui, sans-serif",
        }, children: [_jsx("h1", { style: { fontSize: 28, fontWeight: 800, color: colors.textPrimary, margin: "0 0 4px 0" }, children: APP_NAME }), _jsxs("p", { style: { color: colors.grayText, margin: "0 0 24px 0", fontSize: 16 }, children: ["Signed in as ", session.user.email] }), loading ? (_jsx("p", { style: { color: colors.grayText }, children: "Loading progress..." })) : poolData.length === 0 ? (_jsx("p", { style: { color: colors.grayText, fontSize: 16 }, children: "No study data yet. Start reviewing questions in the app to see your progress here." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: "flex", gap: 16, marginBottom: 24 }, children: [_jsx(LegendItem, { color: colors.primary, label: "Correct" }), _jsx(LegendItem, { color: colors.peach, label: "Seen" }), _jsx(LegendItem, { color: colors.grayBg, border: colors.grayBorder, label: "Unseen" })] }), _jsx(ProgressChart, { data: poolData })] })), _jsxs("div", { style: { display: "flex", gap: 12, marginTop: 32 }, children: [isAdmin && (_jsx("button", { onClick: () => setShowAdmin(true), style: {
                            borderRadius: 16,
                            backgroundColor: colors.primary,
                            border: "none",
                            borderBottomWidth: 4,
                            borderBottomStyle: "solid",
                            borderBottomColor: colors.primaryDark,
                            padding: "14px 24px",
                            fontSize: 16,
                            fontWeight: 800,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            cursor: "pointer",
                            color: colors.white,
                        }, children: "Admin Panel" })), _jsx("button", { onClick: () => supabase.auth.signOut(), style: {
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
                        }, children: "Sign Out" })] })] }));
}
function LegendItem({ color, label, border }) {
    return (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [_jsx("div", { style: {
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    backgroundColor: color,
                    border: border ? `1px solid ${border}` : undefined,
                } }), _jsx("span", { style: { fontSize: 12, color: colors.grayText, fontFamily: "system-ui, sans-serif" }, children: label })] }));
}
