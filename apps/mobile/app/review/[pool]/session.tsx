import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  PoolId,
  Question,
  getRandomQuestions,
  getQuestionsBySubelement,
  shuffleAnswerOrder,
} from '../../../lib/questions';
import { parseFigureRef, getFigureSource } from '../../../lib/figures';
import { supabase } from '../../../lib/supabase';

type Mode = 'random' | 'subelement' | 'missed';

function loadQuestions(pool: PoolId, mode: Mode, subelement?: string): Question[] {
  if (mode === 'subelement' && subelement) {
    return getQuestionsBySubelement(pool, subelement);
  }
  return getRandomQuestions(pool);
}

export default function ReviewSession() {
  const { pool, mode, subelement } = useLocalSearchParams<{
    pool: PoolId;
    mode: Mode;
    subelement?: string;
  }>();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [questions] = useState<Question[]>(() =>
    loadQuestions(pool, mode as Mode, subelement)
  );
  const [index, setIndex] = useState(0);
  const [answerOrder] = useState<number[][]>(() =>
    questions.map((q) => shuffleAnswerOrder(q))
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);

  const question = questions[index];
  const order = answerOrder[index];

  async function handleSelect(displayIdx: number) {
    if (showCorrect) return;
    const originalIdx = order[displayIdx];
    setSelected(displayIdx);
    setShowCorrect(true);
    const isCorrect = originalIdx === question.correct;

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('user_responses').insert({
        user_id: session.user.id,
        question_id: question.id,
        pool_id: pool,
        is_correct: isCorrect,
      });
    }
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      router.back();
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setShowCorrect(false);
  }

  const correctDisplayIdx = order.indexOf(question.correct);
  const figureRef = parseFigureRef(question.question);
  const figureSource = figureRef ? getFigureSource(figureRef) : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
        <Text style={{ fontSize: 28, color: '#333' }}>←</Text>
      </Pressable>
      <Text style={styles.counter}>{index + 1} / {questions.length}</Text>
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
            {index + 1 >= questions.length ? 'FINISH' : 'NEXT'}
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
  answer: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
  },
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
