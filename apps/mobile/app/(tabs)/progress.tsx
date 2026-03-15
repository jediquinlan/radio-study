import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';
import { ScreenTitle, Subtitle } from '@radio-lingo/ui';

export default function ProgressScreen() {
  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}
    >
      <ScreenTitle>Progress</ScreenTitle>
      <Subtitle>Your performance by subelement</Subtitle>
      <YStack gap={12} marginTop={32} />
    </ScrollView>
  );
}
