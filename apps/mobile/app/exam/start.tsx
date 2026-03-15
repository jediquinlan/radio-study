import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { ScreenTitle, Subtitle, RoundedButton, BackButton } from '@radio-lingo/ui';
import { PoolId, POOL_LABELS, buildPracticeExam, shuffleAnswerOrder } from '../../lib/questions';
import { supabase } from '../../lib/supabase';

export default function ExamStartScreen() {
  const { pool } = useLocalSearchParams<{ pool: PoolId }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startExam() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const questions = buildPracticeExam(pool);

    const { data: exam } = await supabase
      .from('practice_exams')
      .insert({ user_id: session.user.id, pool_id: pool, total: questions.length })
      .select('id')
      .single();

    if (!exam) { setLoading(false); return; }

    const rows = questions.map((q) => ({
      exam_id: exam.id,
      question_id: q.id,
      answer_order: shuffleAnswerOrder(q),
    }));

    await supabase.from('practice_exam_questions').insert(rows);

    setLoading(false);
    router.replace(`/exam/${exam.id}`);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}>
      <BackButton onPress={() => router.back()} />
      <ScreenTitle>{POOL_LABELS[pool]} Exam</ScreenTitle>
      <Subtitle>One question per group, answers scrambled — just like the real thing.</Subtitle>
      <YStack gap={12} marginTop={32}>
        <RoundedButton title="START EXAM" disabled={loading} onPress={startExam} />
        <RoundedButton title="CANCEL" outline onPress={() => router.back()} />
      </YStack>
    </ScrollView>
  );
}
