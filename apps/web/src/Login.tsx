import { useState, useEffect } from "react";
import { YStack, XStack, Text, Anchor } from "tamagui";
import {
  RoundedButton,
  StyledInput,
  ScreenTitle,
  Subtitle,
  colors,
  APP_NAME,
} from "@radio-lingo/ui";
import { supabase } from "./supabase";
import { WebCharacter } from "./WebCharacter";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState<"normal" | "happy">("normal");

  // Cycle between normal and happy every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMood("happy");
      setTimeout(() => setMood("normal"), 1500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  const handleForgot = async () => {
    setError(null);
    setInfo(null);
    if (!email) {
      setError("Enter your email above, then tap “Forgot password?”");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setInfo("Check your email for a password reset link.");
  };

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      backgroundColor={colors.white}
    >
      <YStack gap={12} maxWidth={360} width="100%" padding={24} alignItems="center">
        <WebCharacter width={140} height={168} mood={mood} />
        <ScreenTitle>{APP_NAME}</ScreenTitle>
        <Subtitle>Sign in to continue</Subtitle>

        <YStack gap={12} width="100%" marginTop={8}>
          <StyledInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <StyledInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </YStack>

        {error && (
          <Text color={colors.red} fontSize={14}>
            {error}
          </Text>
        )}
        {info && (
          <Text color={colors.accent} fontSize={14}>
            {info}
          </Text>
        )}

        <YStack width="100%" marginTop={12}>
          <RoundedButton
            title={loading ? "SIGNING IN..." : "SIGN IN"}
            onPress={handleLogin}
            disabled={loading}
          />
        </YStack>

        <Text
          onPress={handleForgot}
          color={colors.grayText}
          fontSize={14}
          marginTop={4}
          cursor="pointer"
          hoverStyle={{ color: colors.primary }}
        >
          Forgot password?
        </Text>
      </YStack>

      <XStack position="absolute" bottom={24} gap={8} alignItems="center">
        <Anchor
          href="/privacy"
          fontSize={13}
          color={colors.grayText}
          hoverStyle={{ color: colors.primary }}
        >
          Privacy Policy
        </Anchor>
        <Text fontSize={13} color={colors.grayText}>
          ·
        </Text>
        <Anchor
          href="/support"
          fontSize={13}
          color={colors.grayText}
          hoverStyle={{ color: colors.primary }}
        >
          Support
        </Anchor>
      </XStack>
    </YStack>
  );
}
