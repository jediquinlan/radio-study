import { config } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";
import { colors } from "./theme";

const appConfig = {
  ...config,
  tokens: {
    ...config.tokens,
    color: {
      ...config.tokens.color,
      primary: colors.primary,
      primaryDark: colors.primaryDark,
      accent: colors.accent,
      accentDark: colors.accentDark,
      grayBg: colors.grayBg,
      grayBorder: colors.grayBorder,
      grayText: colors.grayText,
      textPrimary: colors.textPrimary,
      coral: colors.coral,
      salmon: colors.salmon,
      peach: colors.peach,
      sage: colors.sage,
      green: colors.green,
      red: colors.red,
    },
  },
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      background: colors.white,
      color: colors.textPrimary,
      borderColor: colors.grayBorder,
      placeholderColor: colors.grayText,
      accentBackground: colors.primary,
      accentColor: colors.white,
    },
  },
};

export const tamaguiConfig = createTamagui(appConfig);

export default tamaguiConfig;

export type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}
