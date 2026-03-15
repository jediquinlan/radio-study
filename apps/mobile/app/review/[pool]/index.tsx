import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { ScreenTitle, Subtitle, SectionLabel, RoundedButton } from '@radio-lingo/ui';
import { PoolId, POOL_LABELS, getSubelements, getSubelementMeta } from '../../../lib/questions';

export default function PoolModeScreen() {
  const { pool } = useLocalSearchParams<{ pool: PoolId }>();
  const router = useRouter();
  const subelements = getSubelements(pool);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenTitle>{POOL_LABELS[pool]}</ScreenTitle>
      <Subtitle>Choose a study mode</Subtitle>

      <YStack gap={12} marginTop={32}>
        <SectionLabel>Mode</SectionLabel>
        <RoundedButton
          title="RANDOM"
          onPress={() => router.push(`/review/${pool}/session?mode=random`)}
        />
        <RoundedButton
          title="MISSED ONLY"
          outline
          onPress={() => router.push(`/review/${pool}/session?mode=missed`)}
        />
      </YStack>

      <YStack gap={12} marginTop={32}>
        <SectionLabel>By Subelement</SectionLabel>
        {subelements.map((sub) => {
          const meta = getSubelementMeta(pool, sub);
          return (
            <Pressable
              key={sub}
              style={styles.card}
              onPress={() => router.push(`/review/${pool}/session?mode=subelement&subelement=${sub}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardId}>{sub}</Text>
                <Text style={styles.cardCount}>{meta?.exam_questions ?? '?'} exam Qs</Text>
              </View>
              <Text style={styles.cardTitle}>{meta?.title ?? ''}</Text>
            </Pressable>
          );
        })}
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
