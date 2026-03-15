import { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { getQuestions, PoolId } from '../../lib/questions';
import { parseFigureRef, getFigureSource } from '../../lib/figures';

interface ExamQuestion {
  id: string;
  question_id: string;
  answer_order: number[];
  user_answer: number | null;
  is_correct: boolean | null;
}

interface Exam {
  id: string;
  pool_id: PoolId;
  score: number | null;
  total: number;
  completed_at: string | null;
}

export default function ExamSessionScreen() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [exam, setExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: examData }, { data: eqs }] = await Promise.all([
        supabase.from('practice_exams').select('*').eq('id', examId).single(),
        supabase.from('practice_exam_questions').select('*').eq('exam_id', examId),
      ]);
      setExam(examData);
      setExamQuestions(eqs ?? []);
      setLoading(false);
    }
    load();
  }, [examId]);

  if (loading || !exam) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  const allQuestions = getQuestions(exam.pool_id);
  const eq = examQuestions[index];
  const question = allQuestions.find((q) => q.id === eq.question_id);
  if (!question) return null;

  const order: number[] = eq.answer_order;
  const correctDisplayIdx = order.indexOf(question.correct);

  async function handleSelect(displayIdx: number) {
    if (showCorrect) return;
    const originalIdx = order[displayIdx];
    const isCorrect = originalIdx === question!.correct;
    setSelected(displayIdx);
    setShowCorrect(true);

    await supabase
      .from('practice_exam_questions')
      .update({ user_answer: displayIdx, is_correct: isCorrect })
      .eq('id', eq.id);

    await supabase.from('user_responses').insert({
      user_id: (await supabase.auth.getSession()).data.session?.user.id,
      question_id: question!.id,
      pool_id: exam!.pool_id,
      is_correct: isCorrect,
    });
  }

  async function handleNext() {
    if (index + 1 >= examQuestions.length) {
      // Score and complete
      const { data: finalQs } = await supabase
        .from('practice_exam_questions')
        .select('is_correct')
        .eq('exam_id', examId);
      const score = finalQs?.filter((q) => q.is_correct).length ?? 0;
      await supabase
        .from('practice_exams')
        .update({ completed_at: new Date().toISOString(), score })
        .eq('id', examId);
      router.replace(`/exam/results/${examId}`);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setShowCorrect(false);
  }

  const figureRef = parseFigureRef(question.question);
  const figureSource = figureRef ? getFigureSource(figureRef) : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.counter}>{index + 1} / {examQuestions.length}</Text>
      <Text style={styles.questionId}>{question.id}</Text>
      <Text style={styles.question}>{question.question}</Text>

      {figureSource && (
        <Image
          source={figureSource}
          style={{ width: width - 48, height: (width - 48) * 0.75, marginBottom: 16 }}
          resizeMode="contain"
        />
      )}

      <View style={styles.answers}>
        {order.map((originalIdx, displayIdx) => {
          const isSelected = selected === displayIdx;
          const isCorrectAnswer = displayIdx === correctDisplayIdx;
          let bg = '#F7F7F7';
          let border = '#E5E5E5';
          if (showCorrect && isCorrectAnswer) { bg = '#D7F5C0'; border = '#58CC02'; }
          else if (showCorrect && isSelected && !isCorrectAnswer) { bg = '#FFE0E0'; border = '#FF4B4B'; }

          return (
            <Pressable
              key={displayIdx}
              onPress={() => handleSelect(displayIdx)}
              style={[styles.answer, { backgroundColor: bg, borderColor: border }]}
            >
              <Text style={styles.answerText}>{question.answers[originalIdx]}</Text>
            </Pressable>
          );
        })}
      </View>

      {showCorrect && (
        <Pressable style={styles.next} onPress={handleNext}>
          <Text style={styles.nextText}>
            {index + 1 >= examQuestions.length ? 'FINISH' : 'NEXT'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  counter: { fontSize: 14, fontWeight: '700', color: '#777', marginBottom: 8, letterSpacing: 1 },
  questionId: { fontSize: 12, color: '#aaa', marginBottom: 4 },
  question: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 24, lineHeight: 26 },
  answers: { gap: 12 },
  answer: { borderRadius: 16, borderWidth: 2, padding: 16 },
  answerText: { fontSize: 16, color: '#333' },
  next: {
    marginTop: 24,
    backgroundColor: '#58CC02',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#46A302',
  },
  nextText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
});
