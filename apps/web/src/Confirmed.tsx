import { YStack, Text } from "tamagui";
import { ScreenTitle, Subtitle, colors, APP_NAME } from "@radio-lingo/ui";
import { WebCharacter } from "./WebCharacter";

export function Confirmed() {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      backgroundColor={colors.white}
    >
      <YStack gap={12} width={360} padding={24} alignItems="center">
        <WebCharacter width={140} height={168} mood="happy" />
        <ScreenTitle>You're Confirmed!</ScreenTitle>
        <Subtitle>Your email has been verified. Open the {APP_NAME} app on your phone to start studying.</Subtitle>
      </YStack>
    </YStack>
  );
}
