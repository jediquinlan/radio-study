import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { ScreenTitle, Subtitle, SectionLabel, RoundedButton } from '@radio-lingo/ui';
import { POOL_LABELS, PoolId } from '../../lib/questions';

const POOLS: PoolId[] = ['technician', 'general', 'extra'];

export default function ExamScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenTitle>Practice Exam</ScreenTitle>
      <Subtitle>One question drawn from each group — just like the real test</Subtitle>

      <YStack gap={12} marginTop={32}>
        <SectionLabel>License Class</SectionLabel>
        {POOLS.map((pool) => (
          <RoundedButton
            key={pool}
            title={POOL_LABELS[pool].toUpperCase()}
            onPress={() => router.push(`/exam/start?pool=${pool}`)}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
