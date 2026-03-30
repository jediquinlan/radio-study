import { View, Text, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';

interface SpeechBubbleProps {
  children: ReactNode;
}

export function SpeechBubble({ children }: SpeechBubbleProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bubble}>
        {typeof children === 'string' ? (
          <Text style={styles.text}>{children}</Text>
        ) : (
          children
        )}
      </View>
      {/* Triangle tail pointing down */}
      <View style={styles.tailContainer}>
        {/* Outer border triangle */}
        <View style={styles.tailBorder} />
        {/* Inner white triangle */}
        <View style={styles.tail} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: -6,
  },
  bubble: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#E5E5E5',
    paddingHorizontal: 18,
    paddingVertical: 14,
    maxWidth: '92%',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 23,
    textAlign: 'center',
  },
  tailContainer: {
    alignItems: 'center',
    height: 14,
  },
  tailBorder: {
    position: 'absolute',
    top: -2,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E5E5E5',
  },
  tail: {
    position: 'absolute',
    top: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
});
