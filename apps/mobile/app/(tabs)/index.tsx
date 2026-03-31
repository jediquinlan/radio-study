import { ScrollView, View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { ScreenTitle, SectionLabel, RoundedButton, APP_NAME } from '@radio-lingo/ui';
import { Character } from '@radio-lingo/character';
import { SpeechBubble } from '../../components/SpeechBubble';

const RESOURCES = [
  { label: 'Order ARRL Study Guides', url: 'https://www.arrl.org/shop/Licensing-Education/' },
  { label: 'Find an Exam Session', url: 'https://www.arrl.org/find-an-amateur-radio-license-exam-session' },
  { label: 'Get Your FRN', url: 'https://apps.fcc.gov/coresWeb/regEntityType.do' },
  { label: 'Find a Radio Club', url: 'https://www.arrl.org/find-a-club' },
  { label: 'Join ARRL', url: 'https://www.arrl.org/join' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <SpeechBubble>
        <Text style={styles.bubbleText}>
          Welcome to {APP_NAME}!
          {'\n\n'}Use the tabs below to get started:
        </Text>
        <Pressable onPress={() => router.push('/(tabs)/study')}>
          <Text style={styles.bubbleLink}>📖 Study — Review questions by chapter or randomly</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/exam')}>
          <Text style={styles.bubbleLink}>📝 Exam — Take timed practice exams</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/progress')}>
          <Text style={styles.bubbleLink}>📊 Progress — Track how you're doing</Text>
        </Pressable>
      </SpeechBubble>
      <View style={styles.characterContainer}>
        <Character width={140} height={171} />
      </View>

      <ScreenTitle>{APP_NAME}</ScreenTitle>

      <YStack gap={12} marginTop={24}>
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

const styles = StyleSheet.create({
  characterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 23,
    textAlign: 'center',
  },
  bubbleLink: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DD614A',
    lineHeight: 23,
    textAlign: 'center',
    paddingVertical: 4,
  },
});
