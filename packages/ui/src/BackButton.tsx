import { Pressable, Text, StyleSheet } from 'react-native';

interface BackButtonProps {
  onPress: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.button} hitSlop={12}>
      <Text style={styles.arrow}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  arrow: {
    fontSize: 28,
    color: '#333',
  },
});
