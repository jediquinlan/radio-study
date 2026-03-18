import { ScrollView, Linking } from 'react-native';
import { YStack } from 'tamagui';
import { ScreenTitle, Subtitle, SectionLabel, RoundedButton } from '@radio-lingo/ui';

const RESOURCES = [
  { label: 'Order ARRL Study Guides', url: 'https://www.arrl.org/shop/Licensing-Education/' },
  { label: 'Find an Exam Session', url: 'https://www.arrl.org/find-an-amateur-radio-license-exam-session' },
  { label: 'Get Your FRN', url: 'https://apps.fcc.gov/coresWeb/regEntityType.do' },
  { label: 'Find a Radio Club', url: 'https://www.arrl.org/find-a-club' },
  { label: 'Join ARRL', url: 'https://www.arrl.org/join' },
];

export default function HomeScreen() {
  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenTitle>Radio Lingo</ScreenTitle>
      <Subtitle>Study for your amateur radio license</Subtitle>

      <YStack gap={12} marginTop={32}>
        <SectionLabel>Resources</SectionLabel>
        {RESOURCES.map((r) => (
          <RoundedButton
            key={r.url}
            title={r.label}
            onPress={() => Linking.openURL(r.url)}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
