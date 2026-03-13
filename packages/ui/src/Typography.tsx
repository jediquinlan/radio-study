import { styled, Text } from "tamagui";
import { colors } from "./theme";

export const ScreenTitle = styled(Text, {
  fontSize: 28,
  fontWeight: "800",
  color: colors.textPrimary,
  textAlign: "center",
});

export const Subtitle = styled(Text, {
  fontSize: 16,
  color: colors.grayText,
  textAlign: "center",
  marginTop: 8,
  marginBottom: 32,
});

export const SectionLabel = styled(Text, {
  fontSize: 14,
  fontWeight: "700",
  color: colors.grayText,
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: 4,
});
