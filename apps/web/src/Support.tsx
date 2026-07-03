import { YStack, Anchor, Text } from "tamagui";
import { ScreenTitle, Subtitle, colors, APP_NAME } from "@radio-lingo/ui";
import { WebCharacter } from "./WebCharacter";

// Change this one line if you ever switch support addresses.
const SUPPORT_EMAIL = "support@rogerthatradio.org";

export function Support() {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      backgroundColor={colors.white}
    >
      <YStack gap={16} maxWidth={420} width="100%" padding={24} alignItems="center">
        <WebCharacter width={140} height={168} mood="happy" />
        <ScreenTitle>Support</ScreenTitle>
        <Subtitle>
          Need a hand with {APP_NAME}? We're glad to help with account questions,
          bug reports, or feedback on the study material.
        </Subtitle>
        <YStack gap={4} alignItems="center" marginTop={8}>
          <Text fontSize={16} color={colors.grayText}>
            Email us at
          </Text>
          <Anchor
            href={`mailto:${SUPPORT_EMAIL}`}
            fontSize={18}
            fontWeight="700"
            color={colors.primary}
          >
            {SUPPORT_EMAIL}
          </Anchor>
        </YStack>
        <Subtitle>We usually reply within a couple of days.</Subtitle>
      </YStack>
    </YStack>
  );
}
