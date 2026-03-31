import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { ScreenTitle, SectionLabel, RoundedButton, BackButton } from '@radio-lingo/ui';
import { PoolId, POOL_LABELS, getSubelements, getSubelementMeta } from '../../../lib/questions';
import { Character } from '@radio-lingo/character';
import { SpeechBubble } from '../../../components/SpeechBubble';

export default function PoolModeScreen() {
  const { pool } = useLocalSearchParams<{ pool: PoolId }>();
  const router = useRouter();
  const subelements = getSubelements(pool);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <BackButton onPress={() => router.back()} />
      <SpeechBubble>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#333', textAlign: 'center' }}>
          {POOL_LABELS[pool]}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#777', textAlign: 'center', marginTop: 4 }}>
          Choose a study mode
        </Text>
      </SpeechBubble>
      <View style={styles.characterContainer}>
        <Character width={120} height={144} />
      </View>

      <YStack gap={12} marginTop={32}>
        <SectionLabel>Mode</SectionLabel>
        <RoundedButton
          title="RANDOM"
          onPress={() => router.push(`/review/${pool}/session?mode=random`)}
        />
        <RoundedButton
          title="CORRECT ANSWERS ONLY"
          onPress={() => router.push(`/review/${pool}/session?mode=random&correctOnly=1`)}
        />
        <RoundedButton
          title="MISSED ONLY"
          onPress={() => router.push(`/review/${pool}/session?mode=missed`)}
        />
      </YStack>

      <YStack gap={12} marginTop={32}>
        <SectionLabel>By Subelement</SectionLabel>
        {subelements.map((sub) => {
          const meta = getSubelementMeta(pool, sub);
          return (
            <View key={sub} style={styles.card}>
              <Pressable
                onPress={() => router.push(`/review/${pool}/session?mode=subelement&subelement=${sub}`)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardId}>{sub}</Text>
                  <Text style={styles.cardCount}>{meta?.exam_questions ?? '?'} exam Qs</Text>
                </View>
                <Text style={styles.cardTitle}>{meta?.title ?? ''}</Text>
              </Pressable>
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => router.push(`/review/${pool}/session?mode=subelement&subelement=${sub}&correctOnly=1`)}
                  hitSlop={8}
                >
                  <Text style={styles.actionText}>Correct Only</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push(`/review/${pool}/session?mode=missed&subelement=${sub}`)}
                  hitSlop={8}
                >
                  <Text style={styles.actionText}>Missed Only</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  characterContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardId: {
    fontSize: 14,
    fontWeight: '800',
    color: '#58CC02',
    letterSpacing: 1,
  },
  cardCount: {
    fontSize: 12,
    color: '#777',
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DD614A',
  },
});
