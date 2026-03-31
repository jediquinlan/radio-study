import { useState, useEffect } from "react";
import { YStack, Text } from "tamagui";
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

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      backgroundColor={colors.white}
    >
      <YStack gap={12} width={360} padding={24} alignItems="center">
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

        <YStack width="100%" marginTop={12}>
          <RoundedButton
            title={loading ? "SIGNING IN..." : "SIGN IN"}
            onPress={handleLogin}
            disabled={loading}
          />
        </YStack>
      </YStack>
    </YStack>
  );
}
