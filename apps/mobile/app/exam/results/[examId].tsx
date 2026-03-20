import { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { ScreenTitle, Subtitle, SectionLabel, RoundedButton } from '@radio-lingo/ui';
import { supabase } from '../../../lib/supabase';
import { POOL_LABELS, PoolId, getQuestions, getHintData } from '../../../lib/questions';

interface Exam {
  pool_id: PoolId;
  score: number;
  total: number;
  completed_at: string;
}

interface ExamQuestionResult {
  question_id: string;
  answer_order: number[];
  user_answer: number | null;
  is_correct: boolean | null;
}

export default function ExamResultsScreen() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestionResult[]>([]);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: examData }, { data: eqs }] = await Promise.all([
        supabase.from('practice_exams').select('pool_id, score, total, completed_at').eq('id', examId).single(),
        supabase.from('practice_exam_questions').select('question_id, answer_order, user_answer, is_correct').eq('exam_id', examId),
      ]);
      setExam(examData);
      setExamQuestions(eqs ?? []);
    }
    load();
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
          title="REVIEW QUESTIONS"
          onPress={() => setShowReview(!showReview)}
        />
        <RoundedButton
          title="TAKE ANOTHER EXAM"
          outline
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

      {showReview && exam && (
        <View style={rs.reviewSection}>
          <Text style={rs.reviewTitle}>Question Review</Text>
          {examQuestions.map((eq) => {
            const allQuestions = getQuestions(exam.pool_id);
            const q = allQuestions.find((x) => x.id === eq.question_id);
            if (!q) return null;
            const hintData = getHintData(exam.pool_id, q.id);
            const order: number[] = eq.answer_order;


            return (
              <View key={eq.question_id} style={rs.reviewCard}>
                <View style={rs.reviewHeader}>
                  <Text style={rs.reviewQid}>{q.id}</Text>
                  <Text style={eq.is_correct ? rs.reviewCorrect : rs.reviewWrong}>
                    {eq.is_correct ? '✓' : '✗'}
                  </Text>
                </View>
                <Text style={rs.reviewQuestion}>{q.question}</Text>
                {order.map((origIdx, i) => {
                  const isCorrect = origIdx === q.correct;
                  const isUserPick = i === eq.user_answer;
                  let bg = '#F7F7F7';
                  let border = '#E5E5E5';
                  if (isCorrect) { bg = '#D7F5C0'; border = '#58CC02'; }
                  else if (isUserPick && !isCorrect) { bg = '#FFE0E0'; border = '#FF4B4B'; }
                  return (
                    <View key={i} style={[rs.reviewAnswer, { backgroundColor: bg, borderColor: border }]}>
                      <Text style={rs.reviewAnswerText}>{q.answers[origIdx]}</Text>
                    </View>
                  );
                })}
                {hintData && (
                  <View style={rs.explanationBox}>
                    <Text style={rs.explanationLabel}>Explanation</Text>
                    <Text style={rs.explanationText}>{hintData.explanation}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const rs = StyleSheet.create({
  reviewSection: { marginTop: 32 },
  reviewTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 16 },
  reviewCard: { marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewQid: { fontSize: 12, color: '#aaa' },
  reviewCorrect: { fontSize: 18, fontWeight: '800', color: '#58CC02' },
  reviewWrong: { fontSize: 18, fontWeight: '800', color: '#FF4B4B' },
  reviewQuestion: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12, lineHeight: 22 },
  reviewAnswer: { borderRadius: 12, borderWidth: 2, padding: 12, marginBottom: 8 },
  reviewAnswerText: { fontSize: 14, color: '#333' },
  explanationBox: { marginTop: 8, backgroundColor: '#F0F7F2', borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: '#73A580' },
  explanationLabel: { fontSize: 13, fontWeight: '700', color: '#73A580', marginBottom: 4, letterSpacing: 0.5 },
  explanationText: { fontSize: 15, color: '#444', lineHeight: 22 },
});
