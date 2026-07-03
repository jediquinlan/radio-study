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

export function Reset() {
  // The recovery token in the URL establishes a temporary session; we wait for
  // it before letting the user submit a new password.
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    // In case the session was already parsed from the URL before we subscribed.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      // Clear the recovery session so the next sign-in is a fresh login.
      await supabase.auth.signOut();
    }
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
      <YStack gap={12} maxWidth={360} width="100%" padding={24} alignItems="center">
        <WebCharacter width={140} height={168} mood={done ? "happy" : "normal"} />

        {done ? (
          <>
            <ScreenTitle>Password updated!</ScreenTitle>
            <Subtitle>
              You can now sign in with your new password — open the {APP_NAME} app
              on your phone, or sign in on the website.
            </Subtitle>
          </>
        ) : (
          <>
            <ScreenTitle>Reset password</ScreenTitle>
            <Subtitle>
              {ready
                ? "Enter a new password for your account."
                : "Validating your reset link…"}
            </Subtitle>

            <YStack gap={12} width="100%" marginTop={8}>
              <StyledInput
                placeholder="New password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <StyledInput
                placeholder="Confirm new password"
                value={confirm}
                onChangeText={setConfirm}
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
                title={loading ? "SAVING..." : "SET NEW PASSWORD"}
                onPress={handleReset}
                disabled={loading || !ready}
              />
            </YStack>
          </>
        )}
      </YStack>
    </YStack>
  );
}
