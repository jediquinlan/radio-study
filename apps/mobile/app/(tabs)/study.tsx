import { ScrollView, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { SectionLabel, RoundedButton } from '@radio-lingo/ui';
import { POOL_LABELS, PoolId } from '../../lib/questions';
import { Character } from '@radio-lingo/character';
import { SpeechBubble } from '../../components/SpeechBubble';

const POOLS: PoolId[] = ['technician', 'general', 'extra'];

export default function StudyScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <SpeechBubble>
        {"Review questions by subelement or randomly. Questions you miss will appear more often."}
      </SpeechBubble>
      <View style={styles.characterContainer}>
        <Character width={120} height={144} />
      </View>

      <YStack gap={12} marginTop={32}>
        <SectionLabel>License Class</SectionLabel>
        {POOLS.map((pool) => (
          <RoundedButton
            key={pool}
            title={POOL_LABELS[pool].toUpperCase()}
            onPress={() => router.push(`/review/${pool}`)}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  characterContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
});
