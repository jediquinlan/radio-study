import { styled, Input } from "tamagui";
import { colors } from "./theme";

export const StyledInput = styled(Input, {
  backgroundColor: colors.grayBg,
  borderWidth: 2,
  borderColor: colors.grayBorder,
  borderRadius: 16,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 16,
  color: colors.textPrimary,
  placeholderTextColor: colors.grayText,
});
