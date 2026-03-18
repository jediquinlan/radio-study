import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { ScreenTitle, Subtitle, RoundedButton } from '@radio-lingo/ui';
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
      <Subtitle>Take a practice exam on-screen or export one as a PDF for printing.</Subtitle>
      <YStack gap={12} marginTop={32}>
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
