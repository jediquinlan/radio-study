import { YStack, Text } from "tamagui";
import { ScreenTitle, colors, APP_NAME } from "@radio-lingo/ui";

const SUPPORT_EMAIL = "support@rogerthatradio.org";
const LAST_UPDATED = "July 3, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <YStack gap={6} marginTop={20} width="100%">
      <Text fontSize={16} fontWeight="800" color={colors.textPrimary}>
        {title}
      </Text>
      <Text fontSize={15} lineHeight={22} color={colors.textPrimary}>
        {children}
      </Text>
    </YStack>
  );
}

export function Privacy() {
  return (
    <YStack
      alignItems="center"
      minHeight="100vh"
      backgroundColor={colors.white}
      paddingVertical={48}
      paddingHorizontal={24}
    >
      <YStack maxWidth={640} width="100%">
        <ScreenTitle>Privacy Policy</ScreenTitle>
        <Text fontSize={14} color={colors.grayText} marginTop={4}>
          Last updated: {LAST_UPDATED}
        </Text>

        <Text fontSize={15} lineHeight={22} color={colors.textPrimary} marginTop={16}>
          {APP_NAME} helps you study for U.S. amateur radio license exams. This
          policy explains what information we collect, how we use it, and the
          choices you have.
        </Text>

        <Section title="Information We Collect">
          • Account information: your email address and password. Passwords are
          stored securely (hashed) by our authentication provider, Supabase — we
          never see your plain-text password.{"\n"}
          • Optional profile: during sign-up you may choose to provide your call
          sign, name, mailing address, city, state/province, ZIP/postal code, and
          country. These fields are optional.{"\n"}
          • Study activity: your practice exams and answers, so we can save and
          show your progress.
        </Section>

        <Section title="How We Use Your Information">
          We use your information to create and manage your account, save your
          study progress and practice-exam history, and operate and improve the
          app. We do not sell your personal information, and we do not use it for
          advertising.
        </Section>

        <Section title="Data Storage & Security">
          Your data is stored with Supabase, our backend and authentication
          provider, which protects it in transit and at rest.
        </Section>

        <Section title="Sharing">
          We do not share your personal information with third parties except as
          needed to operate the app (for example, our hosting and authentication
          provider, Supabase) or when required by law.
        </Section>

        <Section title="Data Retention & Deletion">
          We keep your data while your account is active. You can delete your
          account and its associated data at any time from within the app, or by
          emailing us at {SUPPORT_EMAIL} and we will delete it for you.
        </Section>

        <Section title="Children's Privacy">
          {APP_NAME} is not directed to children under 13, and we do not knowingly
          collect personal information from them.
        </Section>

        <Section title="Changes to This Policy">
          We may update this policy from time to time. We will post any changes on
          this page and update the "last updated" date above.
        </Section>

        <Section title="Contact">
          Questions about this policy? Email us at {SUPPORT_EMAIL}.
        </Section>
      </YStack>
    </YStack>
  );
}
