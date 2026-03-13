import { useState } from "react";
import { YStack, Text } from "tamagui";
import {
  RoundedButton,
  StyledInput,
  ScreenTitle,
  Subtitle,
  colors,
} from "@radio-lingo/ui";
import { supabase } from "./supabase";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      <YStack gap={12} width={360} padding={24}>
        <ScreenTitle>Radio Lingo</ScreenTitle>
        <Subtitle>Sign in to continue</Subtitle>

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

        {error && (
          <Text color={colors.red} fontSize={14}>
            {error}
          </Text>
        )}

        <RoundedButton
          title={loading ? "SIGNING IN..." : "SIGN IN"}
          onPress={handleLogin}
          disabled={loading}
        />
      </YStack>
    </YStack>
  );
}
