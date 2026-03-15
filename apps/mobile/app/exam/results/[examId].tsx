import { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { ScreenTitle, Subtitle, SectionLabel, RoundedButton } from '@radio-lingo/ui';
import { supabase } from '../../../lib/supabase';
import { POOL_LABELS, PoolId } from '../../../lib/questions';

interface Exam {
  pool_id: PoolId;
  score: number;
  total: number;
  completed_at: string;
}

export default function ExamResultsScreen() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);

  useEffect(() => {
    supabase
      .from('practice_exams')
      .select('pool_id, score, total, completed_at')
      .eq('id', examId)
      .single()
      .then(({ data }) => setExam(data));
  }, [examId]);

  if (!exam) return <ActivityIndicator style={{ flex: 1 }} />;

  const pct = Math.round((exam.score / exam.total) * 100);
  const passed = pct >= 74; // FCC passing threshold

  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}>
      <ScreenTitle>{passed ? 'You Passed!' : 'Keep Studying'}</ScreenTitle>
      <Subtitle>{POOL_LABELS[exam.pool_id]} Practice Exam</Subtitle>

      <YStack gap={12} marginTop={32}>
        <SectionLabel>Score</SectionLabel>
        <Subtitle>
          {exam.score} / {exam.total} correct ({pct}%)
        </Subtitle>
        <Subtitle>{passed ? '74% or higher — you\'re ready!' : 'You need 74% to pass.'}</Subtitle>
      </YStack>

      <YStack gap={12} marginTop={32}>
        <RoundedButton
          title="TAKE ANOTHER EXAM"
          onPress={() => router.replace('/exam')}
        />
        <RoundedButton
          title="STUDY MISSED QUESTIONS"
          outline
          onPress={() => router.replace(`/review/${exam.pool_id}/session?mode=missed`)}
        />
        <RoundedButton
          title="HOME"
          outline
          onPress={() => router.replace('/')}
        />
      </YStack>
    </ScrollView>
  );
}
