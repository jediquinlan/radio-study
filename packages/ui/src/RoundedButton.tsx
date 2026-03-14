import { styled, Stack, Text } from "tamagui";
import { colors } from "./theme";

const ButtonFrame = styled(Stack, {
  borderRadius: 16,
  paddingVertical: 14,
  alignItems: "center",
  cursor: "pointer",
  pressStyle: {
    opacity: 0.85,
  },

  variants: {
    outline: {
      true: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.grayBorder,
      },
    },
    variant: {
      primary: {
        backgroundColor: colors.primary,
        borderBottomWidth: 4,
        borderBottomColor: colors.primaryDark,
      },
      secondary: {
        backgroundColor: colors.accent,
        borderBottomWidth: 4,
        borderBottomColor: colors.accentDark,
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
  } as const,

  defaultVariants: {
    variant: "primary",
  },
});

const ButtonText = styled(Text, {
  fontSize: 16,
  fontWeight: "800",
  letterSpacing: 1,
  color: colors.white,

  variants: {
    outline: {
      true: {
        color: colors.accent,
      },
    },
  } as const,
});

interface RoundedButtonProps {
  title: string;
  onPress: () => void;
  outline?: boolean;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export function RoundedButton({
  title,
  onPress,
  outline,
  variant = "primary",
  disabled,
}: RoundedButtonProps) {
  return (
    <ButtonFrame
      onPress={disabled ? undefined : onPress}
      outline={outline}
      variant={outline ? undefined : variant}
      disabled={disabled}
    >
      <ButtonText outline={outline}>{title}</ButtonText>
    </ButtonFrame>
  );
}
