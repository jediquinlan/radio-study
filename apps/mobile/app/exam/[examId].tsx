import { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator, Alert, Image, useWindowDimensions } from 'react-native';
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
  const [loading, setLoading] = useState(true);

  function confirmQuit() {
    Alert.alert(
      'Leave Exam?',
      'Your progress so far will be saved and the exam will be scored.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: handleQuit },
      ]
    );
  }

  async function handleQuit() {
    const { data: finalQs } = await supabase
      .from('practice_exam_questions')
      .select('is_correct')
      .eq('exam_id', examId);
    const answered = finalQs?.filter((q) => q.is_correct !== null) ?? [];
    const score = answered.filter((q) => q.is_correct).length;
    await supabase
      .from('practice_exams')
      .update({ completed_at: new Date().toISOString(), score })
      .eq('id', examId);
    router.replace(`/exam/results/${examId}`);
  }

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

  async function handleSelect(displayIdx: number) {
    const originalIdx = order[displayIdx];
    const isCorrect = originalIdx === question!.correct;
    setSelected(displayIdx);

    await supabase
      .from('practice_exam_questions')
      .update({ user_answer: displayIdx, is_correct: isCorrect })
      .eq('id', eq.id);
  }

  function handleNext() {
    if (index + 1 >= examQuestions.length) {
      finishExam();
      return;
    }
    setIndex(index + 1);
    // Restore previous answer if going forward to an already-answered question
    const nextEq = examQuestions[index + 1];
    setSelected(nextEq.user_answer);
  }

  function handlePrev() {
    if (index <= 0) return;
    setIndex(index - 1);
    const prevEq = examQuestions[index - 1];
    setSelected(prevEq.user_answer);
  }

  async function finishExam() {
    const { data: finalQs } = await supabase
      .from('practice_exam_questions')
      .select('is_correct, question_id')
      .eq('exam_id', examId);

    const answered = finalQs?.filter((q) => q.is_correct !== null) ?? [];
    const score = answered.filter((q) => q.is_correct).length;

    // Record user responses for progress tracking
    const userId = (await supabase.auth.getSession()).data.session?.user.id;
    if (userId && finalQs) {
      const responses = finalQs
        .filter((q) => q.is_correct !== null)
        .map((q) => ({
          user_id: userId,
          question_id: q.question_id,
          pool_id: exam!.pool_id,
          is_correct: q.is_correct,
        }));
      if (responses.length > 0) {
        await supabase.from('user_responses').insert(responses);
      }
    }

    await supabase
      .from('practice_exams')
      .update({ completed_at: new Date().toISOString(), score })
      .eq('id', examId);
    router.replace(`/exam/results/${examId}`);
  }

  const figureRef = parseFigureRef(question.question);
  const figureSource = figureRef ? getFigureSource(figureRef) : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.counter}>{index + 1} / {examQuestions.length}</Text>
        <Pressable onPress={confirmQuit} hitSlop={12}>
          <Text style={styles.quitBtn}>✕</Text>
        </Pressable>
      </View>
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
          return (
            <Pressable
              key={displayIdx}
              onPress={() => handleSelect(displayIdx)}
              style={[styles.answer, isSelected && styles.answerSelected]}
            >
              <Text style={styles.answerText}>{question.answers[originalIdx]}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.navRow}>
        <Pressable
          style={[styles.navBtn, index <= 0 && styles.navBtnDisabled]}
          onPress={handlePrev}
          disabled={index <= 0}
        >
          <Text style={[styles.navBtnText, index <= 0 && styles.navBtnTextDisabled]}>BACK</Text>
        </Pressable>
        <Pressable style={[styles.navBtn, selected !== null && styles.navBtnHighlight]} onPress={handleNext}>
          <Text style={[styles.navBtnText, selected !== null && styles.navBtnHighlightText]}>
            {index + 1 >= examQuestions.length ? 'FINISH' : 'NEXT'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  counter: { fontSize: 14, fontWeight: '700', color: '#777', letterSpacing: 1 },
  quitBtn: { fontSize: 22, color: '#999', fontWeight: '700' },
  questionId: { fontSize: 12, color: '#aaa', marginBottom: 4 },
  question: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 24, lineHeight: 26 },
  answers: { gap: 12 },
  answer: { borderRadius: 16, borderWidth: 2, borderColor: '#E5E5E5', backgroundColor: '#F7F7F7', padding: 16 },
  answerText: { fontSize: 16, color: '#333' },
  answerSelected: { backgroundColor: '#EDEDED', borderColor: '#DD614A', borderWidth: 3 },
  navRow: { flexDirection: 'row', marginTop: 24, gap: 12 },
  navBtn: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    flex: 1,
  },
  navBtnText: { color: '#777', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  navBtnDisabled: { opacity: 0.35 },
  navBtnTextDisabled: { color: '#bbb' },
  navBtnHighlight: { backgroundColor: '#DD614A', borderColor: '#C04535' },
  navBtnHighlightText: { color: '#fff' },
});
