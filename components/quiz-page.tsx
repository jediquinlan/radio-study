import React, { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

// These should eventually go into a shared theme file
const GREEN = "#58CC02";
const GREEN_DARK = "#46A302";
const BLUE = "#1CB0F6";
const BLUE_DARK = "#1899D6";
const GRAY_BORDER = "#E5E5E5";
const GRAY_TEXT = "#777";
const WHITE = "#FFFFFF";

interface QuizProps {
  question: string;
  answers: string[];
  rightAnswerIndex: number;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export default function MultipleChoiceQuiz({
  question,
  answers,
  rightAnswerIndex,
  onCorrect,
  onIncorrect,
}: QuizProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const handleCheck = () => {
    if (selectedIndex === null) return;

    setIsChecked(true);
    if (selectedIndex === rightAnswerIndex) {
      onCorrect?.();
    } else {
      onIncorrect?.();
    }
  };

  const reset = () => {
    setSelectedIndex(null);
    setIsChecked(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Question Section */}
        <Text style={styles.questionText}>{question}</Text>

        {/* Answers List */}
        <View style={styles.optionsContainer}>
          {answers.map((answer, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = index === rightAnswerIndex;

            // Determine border and background colors based on state
            let borderColor = GRAY_BORDER;
            let backgroundColor = WHITE;
            let shadowColor = GRAY_BORDER;

            if (isSelected) {
              borderColor = BLUE;
              backgroundColor = "#E5F6FF";
              shadowColor = BLUE_DARK;
            }

            if (isChecked) {
              if (isCorrect) {
                borderColor = GREEN;
                backgroundColor = "#D7FFB8";
                shadowColor = GREEN_DARK;
              } else if (isSelected) {
                borderColor = "#EE2A33";
                backgroundColor = "#FCDADA";
                shadowColor = "#CC2129";
              }
            }

            return (
              <Pressable
                key={index}
                disabled={isChecked}
                onPress={() => setSelectedIndex(index)}
                style={[
                  styles.optionButton,
                  {
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    borderBottomWidth: 4,
                    borderBottomColor: shadowColor,
                  },
                  isSelected &&
                    !isChecked && { transform: [{ translateY: 2 }] },
                ]}
              >
                <View
                  style={[styles.indexCircle, { borderColor: borderColor }]}
                >
                  <Text style={[styles.indexText, { color: borderColor }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={styles.answerText}>{answer}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Action Footer */}
        <View style={styles.footer}>
          {!isChecked ? (
            <Pressable
              onPress={handleCheck}
              disabled={selectedIndex === null}
              style={[
                styles.checkButton,
                selectedIndex === null
                  ? styles.disabledButton
                  : { backgroundColor: GREEN, borderBottomColor: GREEN_DARK },
              ]}
            >
              <Text style={styles.checkButtonText}>CHECK</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={reset}
              style={[
                styles.checkButton,
                { backgroundColor: BLUE, borderBottomColor: BLUE_DARK },
              ]}
            >
              <Text style={styles.checkButtonText}>CONTINUE</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  questionText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3C3C3C",
    marginTop: 20,
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 16,
    flex: 1,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    minHeight: 70,
  },
  indexCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  indexText: {
    fontWeight: "700",
    fontSize: 14,
  },
  answerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B4B4B",
    flex: 1,
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 2,
    borderTopColor: GRAY_BORDER,
  },
  checkButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 4,
  },
  disabledButton: {
    backgroundColor: GRAY_BORDER,
    borderBottomColor: "#C0C0C0",
  },
  checkButtonText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
});
