import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { colors } from "@radio-lingo/ui";
import { supabase } from "./supabase";
import { ProgressChart } from "./ProgressChart";
import { POOL_LABELS, getSubelements, getSubelementMeta, getQuestionCountBySubelement, } from "./questions";
export function AdminPanel({ onBack }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [poolData, setPoolData] = useState([]);
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
        const userMap = new Map();
        for (const r of responses) {
            const u = userMap.get(r.user_id) ?? { total: 0, correct: 0 };
            u.total++;
            if (r.is_correct)
                u.correct++;
            userMap.set(r.user_id, u);
        }
        // Get user profiles
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, email, call_sign, first_name, last_name");
        const profileMap = new Map();
        for (const p of profiles ?? []) {
            profileMap.set(p.id, p);
        }
        const userList = [];
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
    async function selectUser(user) {
        setSelectedUser(user);
        setLoadingStats(true);
        const { data: responses } = await supabase
            .from("user_responses")
            .select("question_id, is_correct")
            .eq("user_id", user.id);
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
        const pools = ["technician", "general", "extra"].map((pool) => {
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
    const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);
    return (_jsxs("div", { style: {
            padding: 16,
            paddingTop: 32,
            maxWidth: 900,
            margin: "0 auto",
            fontFamily: "system-ui, sans-serif",
            boxSizing: "border-box",
        }, children: [_jsxs("div", { className: "admin-header", style: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }, children: [_jsx("button", { onClick: onBack, style: styles.backBtn, children: "\u2190 Dashboard" }), _jsx("h1", { style: { fontSize: 28, fontWeight: 800, color: colors.textPrimary, margin: 0 }, children: "Admin Panel" })] }), _jsxs("div", { className: "admin-layout", style: { display: "flex", gap: 24 }, children: [_jsxs("div", { className: "admin-user-list", style: { width: 320, flexShrink: 0 }, children: [_jsxs("h3", { style: styles.sectionLabel, children: ["Users (", users.length, ")"] }), loading ? (_jsx("p", { style: { color: colors.grayText }, children: "Loading users..." })) : users.length === 0 ? (_jsx("p", { style: { color: colors.grayText }, children: "No users with study data." })) : (_jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: users.map((user) => (_jsxs("button", { onClick: () => selectUser(user), style: {
                                        ...styles.userCard,
                                        borderColor: selectedUser?.id === user.id ? colors.primary : colors.grayBorder,
                                        backgroundColor: selectedUser?.id === user.id ? "#FFF5F3" : colors.white,
                                    }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx("span", { style: { fontWeight: 700, color: colors.textPrimary, fontSize: 14 }, children: user.email }), _jsxs("span", { style: { fontSize: 12, color: colors.grayText, fontWeight: 700 }, children: [pct(user.totalCorrect, user.totalResponses), "%"] })] }), (user.firstName || user.callSign) && (_jsxs("div", { style: { fontSize: 12, color: colors.grayText, marginTop: 2 }, children: [[user.firstName, user.lastName].filter(Boolean).join(" "), user.callSign && ` (${user.callSign})`] })), _jsxs("div", { style: { fontSize: 11, color: colors.grayText, marginTop: 4 }, children: [user.totalResponses, " answers \u00B7 ", user.totalCorrect, " correct"] })] }, user.id))) }))] }), _jsx("div", { className: "admin-stats", style: { flex: 1, minWidth: 0 }, children: selectedUser ? (_jsxs(_Fragment, { children: [_jsxs("h3", { style: styles.sectionLabel, children: ["Stats for ", selectedUser.email] }), loadingStats ? (_jsx("p", { style: { color: colors.grayText }, children: "Loading stats..." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: "flex", gap: 16, marginBottom: 24 }, children: [_jsx(LegendItem, { color: colors.primary, label: "Correct" }), _jsx(LegendItem, { color: colors.peach, label: "Seen" }), _jsx(LegendItem, { color: colors.grayBg, border: colors.grayBorder, label: "Unseen" })] }), _jsx(ProgressChart, { data: poolData })] }))] })) : (_jsx("div", { style: { padding: 48, textAlign: "center", color: colors.grayText }, children: "Select a user to view their stats." })) })] })] }));
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
const styles = {
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
        textAlign: "left",
        borderRadius: 12,
        border: `2px solid`,
        padding: 12,
        cursor: "pointer",
        backgroundColor: colors.white,
        width: "100%",
    },
};
