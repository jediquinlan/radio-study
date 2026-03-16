import { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { YStack } from 'tamagui';
import { ScreenTitle, Subtitle, colors } from '@radio-lingo/ui';
import { supabase } from '../../lib/supabase';
import {
  PoolId,
  POOL_LABELS,
  getSubelements,
  getSubelementMeta,
  getQuestionsBySubelement,
} from '../../lib/questions';

interface SubelementStats {
  subelement: string;
  title: string;
  correct: number;
  total: number;
  seen: number;       // unique questions attempted
  poolTotal: number;  // total questions in pool for this subelement
}

type PoolStats = Record<PoolId, SubelementStats[]>;

export default function ProgressScreen() {
  const [stats, setStats] = useState<PoolStats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  async function loadStats() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data: responses } = await supabase
      .from('user_responses')
      .select('question_id, is_correct')
      .eq('user_id', session.user.id);

    const grouped: Record<string, { correct: number; total: number; seen: Set<string> }> = {};
    for (const r of responses ?? []) {
      const sub = r.question_id.slice(0, 2);
      if (!grouped[sub]) grouped[sub] = { correct: 0, total: 0, seen: new Set() };
      grouped[sub].total++;
      grouped[sub].seen.add(r.question_id);
      if (r.is_correct) grouped[sub].correct++;
    }

    const poolStats: PoolStats = { technician: [], general: [], extra: [] };
    for (const pool of ['technician', 'general', 'extra'] as PoolId[]) {
      const subs = getSubelements(pool);
      poolStats[pool] = subs.map((sub) => {
        const meta = getSubelementMeta(pool, sub);
        const poolTotal = getQuestionsBySubelement(pool, sub).length;
        const s = grouped[sub] ?? { correct: 0, total: 0, seen: new Set() };
        return {
          subelement: sub,
          title: meta?.title ?? sub,
          correct: s.correct,
          total: s.total,
          seen: s.seen.size,
          poolTotal,
        };
      });
    }

    setStats(poolStats);
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!stats) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenTitle>Progress</ScreenTitle>
        <Subtitle>Sign in to track your progress</Subtitle>
      </ScrollView>
    );
  }

  const pools = (['technician', 'general', 'extra'] as PoolId[]).filter(
    (p) => stats[p].some((s) => s.total > 0)
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenTitle>Progress</ScreenTitle>
      <Subtitle>Your performance by subelement</Subtitle>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Correct</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: colors.peach }]} />
          <Text style={styles.legendText}>Seen</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: colors.grayBg, borderWidth: 1, borderColor: colors.grayBorder }]} />
          <Text style={styles.legendText}>Unseen</Text>
        </View>
      </View>

      {pools.length === 0 && (
        <Text style={styles.empty}>
          No study data yet. Start reviewing questions to see your progress here.
        </Text>
      )}

      {pools.map((pool) => (
        <YStack key={pool} gap={8} marginTop={24}>
          <Text style={styles.poolLabel}>{POOL_LABELS[pool]}</Text>
          {stats[pool].map((s) => {
            const seenPct = s.poolTotal > 0 ? Math.round((s.seen / s.poolTotal) * 100) : 0;
            const correctPct = s.poolTotal > 0 ? Math.round((s.correct / s.poolTotal) * 100) : 0;

            return (
              <View key={s.subelement} style={styles.row}>
                <View style={styles.labelCol}>
                  <Text style={styles.subId}>{s.subelement}</Text>
                  <Text style={styles.subTitle} numberOfLines={1}>{s.title}</Text>
                </View>
                <View style={styles.barCol}>
                  <View style={styles.barBg}>
                    <View style={[styles.barSeen, { width: `${seenPct}%` }]} />
                    <View style={[styles.barCorrect, { width: `${correctPct}%` }]} />
                  </View>
                  <Text style={styles.pctText}>
                    {s.seen > 0 ? `${s.seen}/${s.poolTotal}` : '—'}
                  </Text>
                </View>
              </View>
            );
          })}
          <Text style={styles.summary}>
            {stats[pool].reduce((a, s) => a + s.correct, 0)} / {stats[pool].reduce((a, s) => a + s.total, 0)} correct
          </Text>
        </YStack>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 80, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12, color: colors.grayText },
  empty: { fontSize: 16, color: colors.grayText, marginTop: 32, textAlign: 'center' },
  poolLabel: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  labelCol: { width: 100 },
  subId: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  subTitle: { fontSize: 11, color: colors.grayText },
  barCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  barBg: {
    flex: 1,
    height: 12,
    backgroundColor: colors.grayBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.grayBorder,
    overflow: 'hidden',
  },
  barSeen: { position: 'absolute', height: '100%', borderRadius: 6, backgroundColor: colors.peach },
  barCorrect: { position: 'absolute', height: '100%', borderRadius: 6, backgroundColor: colors.primary },
  pctText: { fontSize: 12, fontWeight: '700', color: colors.grayText, width: 46, textAlign: 'right' },
  summary: { fontSize: 13, color: colors.grayText, marginTop: 4 },
});
