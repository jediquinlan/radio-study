import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  PoolId,
  Question,
  PerformanceRecord,
  getRandomQuestions,
  getQuestionsBySubelement,
  shuffleAnswerOrder,
  weightedPickQuestion,
  getHintData,
} from '../../../lib/questions';
import { parseFigureRef, getFigureSource } from '../../../lib/figures';
import { supabase } from '../../../lib/supabase';

type Mode = 'random' | 'subelement' | 'missed';

function loadQuestionPool(pool: PoolId, mode: Mode, subelement?: string): Question[] {
  if (mode === 'subelement' && subelement) {
    return getQuestionsBySubelement(pool, subelement);
  }
  return getRandomQuestions(pool);
}

export default function ReviewSession() {
  const { pool, mode, subelement, correctOnly } = useLocalSearchParams<{
    pool: PoolId;
    mode: Mode;
    subelement?: string;
    correctOnly?: string;
  }>();
  const isCorrectOnly = correctOnly === '1';
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [questionPool] = useState<Question[]>(() =>
    loadQuestionPool(pool, mode as Mode, subelement)
  );
  const [performance, setPerformance] = useState<Map<string, PerformanceRecord>>(new Map());
  const [recentIds, setRecentIds] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState<Question>(() => questionPool[0]);
  const [order, setOrder] = useState<number[]>(() => shuffleAnswerOrder(questionPool[0]));
  const [selected, setSelected] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Load existing performance data on mount
  useEffect(() => {
    async function loadPerformance() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const qIds = questionPool.map((q) => q.id);
      const { data } = await supabase
        .from('user_responses')
        .select('question_id, is_correct')
        .eq('user_id', session.user.id)
        .in('question_id', qIds);
      if (!data) return;

      const map = new Map<string, PerformanceRecord>();
      for (const row of data) {
        const rec = map.get(row.question_id) ?? { question_id: row.question_id, total: 0, correct: 0 };
        rec.total++;
        if (row.is_correct) rec.correct++;
        map.set(row.question_id, rec);
      }
      setPerformance(map);

      // Pick first question using weights
      const first = weightedPickQuestion(questionPool, map, new Set());
      setQuestion(first);
      setOrder(shuffleAnswerOrder(first));
    }
    loadPerformance();
  }, []);

  const pickNext = useCallback(() => {
    const newRecent = new Set(recentIds);
    newRecent.add(question.id);
    // Keep only last 3 to avoid repeats
    if (newRecent.size > 3) {
      const first = newRecent.values().next().value!;
      newRecent.delete(first);
    }
    setRecentIds(newRecent);

    const next = weightedPickQuestion(questionPool, performance, newRecent);
    setQuestion(next);
    setOrder(shuffleAnswerOrder(next));
    setSelected(null);
    setShowCorrect(false);
    setShowHint(false);
  }, [questionPool, performance, recentIds, question.id]);

  async function handleSelect(displayIdx: number) {
    if (showCorrect) return;
    const originalIdx = order[displayIdx];
    setSelected(displayIdx);
    setShowCorrect(true);
    const isCorrect = originalIdx === question.correct;

    // Update local performance map
    const rec = performance.get(question.id) ?? { question_id: question.id, total: 0, correct: 0 };
    rec.total++;
    if (isCorrect) rec.correct++;
    setPerformance(new Map(performance).set(question.id, rec));

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
    pickNext();
  }

  const correctDisplayIdx = order.indexOf(question.correct);
  const figureRef = parseFigureRef(question.question);
  const figureSource = figureRef ? getFigureSource(figureRef) : null;
  const hintData = getHintData(pool, question.id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
        <Text style={{ fontSize: 28, color: '#333' }}>←</Text>
      </Pressable>
      <Text style={styles.questionId}>{question.id}</Text>
      <Text style={styles.question}>{question.question}</Text>

      {figureSource && (
        <Image
          source={figureSource}
          style={{ width: width - 48, height: (width - 48) * 0.75, marginBottom: 16 }}
          resizeMode="contain"
        />
      )}

      {isCorrectOnly ? (
        <>
          <View style={[styles.answer, { backgroundColor: '#F7F7F7', borderColor: '#E5E5E5' }]}>
            <Text style={styles.answerText}>{question.answers[question.correct]}</Text>
          </View>
          {hintData && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationLabel}>Explanation</Text>
              <Text style={styles.explanationText}>{hintData.explanation}</Text>
            </View>
          )}
          <Pressable style={styles.next} onPress={handleNext}>
            <Text style={styles.nextText}>NEXT</Text>
          </Pressable>
        </>
      ) : (
        <>
          {!showCorrect && !showHint && hintData && (
            <Pressable style={styles.hintBtn} onPress={() => setShowHint(true)}>
              <Text style={styles.hintBtnText}>SHOW HINT</Text>
            </Pressable>
          )}

          {showHint && hintData && !showCorrect && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>{hintData.hint}</Text>
            </View>
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

          {showCorrect && hintData && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationLabel}>Explanation</Text>
              <Text style={styles.explanationText}>{hintData.explanation}</Text>
            </View>
          )}

          {showCorrect && (
            <Pressable style={styles.next} onPress={handleNext}>
              <Text style={styles.nextText}>NEXT</Text>
            </Pressable>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  questionId: { fontSize: 12, color: '#aaa', marginBottom: 4 },
  question: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 24, lineHeight: 26 },
  answers: { gap: 12 },
  answer: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
  },
  answerText: { fontSize: 16, color: '#333' },
  hintBtn: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F4A698',
    padding: 12,
    alignItems: 'center',
  },
  hintBtnText: { color: '#DD614A', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  hintBox: {
    marginBottom: 16,
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#F4A698',
  },
  hintText: { fontSize: 15, color: '#555', lineHeight: 22, fontStyle: 'italic' },
  explanationBox: {
    marginTop: 16,
    backgroundColor: '#F0F7F2',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#73A580',
  },
  explanationLabel: { fontSize: 13, fontWeight: '700', color: '#73A580', marginBottom: 4, letterSpacing: 0.5 },
  explanationText: { fontSize: 15, color: '#444', lineHeight: 22 },
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
