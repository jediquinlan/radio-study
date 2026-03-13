import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TamaguiProvider, Theme, XStack, YStack } from 'tamagui';
import {
  tamaguiConfig,
  RoundedButton,
  StyledInput,
  ScreenTitle,
  Subtitle,
  SectionLabel,
} from '@radio-lingo/ui';
import { supabase } from '../lib/supabase';

export default function AuthGate() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [callSign, setCallSign] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');

  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          call_sign: callSign,
          first_name: firstName,
          last_name: lastName,
          address_1: address1,
          address_2: address2,
          city,
          state_province: stateProvince,
          zip,
          country,
        },
      },
    });
    if (error) Alert.alert(error.message);
    else Alert.alert('Check your email for the confirmation link!');
    setLoading(false);
  }

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Theme name="light">
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#fff' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <ScreenTitle>
              {mode === 'signIn' ? 'Welcome back!' : 'Create Account'}
            </ScreenTitle>
            <Subtitle>
              {mode === 'signIn' ? 'Sign in to continue learning' : 'Join the radio community'}
            </Subtitle>

            <YStack gap={12} marginBottom={24}>
              <StyledInput
                placeholder="Email"
                onChangeText={setEmail}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <StyledInput
                placeholder="Password"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
                autoCapitalize="none"
              />
            </YStack>

            {mode === 'signUp' && (
              <YStack gap={12} marginBottom={24}>
                <SectionLabel>Optional Info</SectionLabel>
                <StyledInput
                  placeholder="Call Sign"
                  onChangeText={setCallSign}
                  value={callSign}
                  autoCapitalize="characters"
                />
                <XStack gap={12}>
                  <StyledInput placeholder="First Name" onChangeText={setFirstName} value={firstName} flex={1} />
                  <StyledInput placeholder="Last Name" onChangeText={setLastName} value={lastName} flex={1} />
                </XStack>
                <StyledInput placeholder="Street Address 1" onChangeText={setAddress1} value={address1} />
                <StyledInput placeholder="Street Address 2" onChangeText={setAddress2} value={address2} />
                <XStack gap={12}>
                  <StyledInput placeholder="City" onChangeText={setCity} value={city} flex={1} />
                  <StyledInput placeholder="State / Province" onChangeText={setStateProvince} value={stateProvince} flex={1} />
                </XStack>
                <XStack gap={12}>
                  <StyledInput placeholder="ZIP / Postal Code" onChangeText={setZip} value={zip} keyboardType="numbers-and-punctuation" flex={1} />
                  <StyledInput placeholder="Country" onChangeText={setCountry} value={country} flex={1} />
                </XStack>
              </YStack>
            )}

            <YStack gap={12} marginTop={8}>
              <RoundedButton
                title={mode === 'signIn' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                disabled={loading}
                onPress={mode === 'signIn' ? signInWithEmail : signUpWithEmail}
              />
              <RoundedButton
                title={mode === 'signIn' ? "I DON'T HAVE AN ACCOUNT" : 'I ALREADY HAVE AN ACCOUNT'}
                onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
                outline
              />
            </YStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </Theme>
    </TamaguiProvider>
  );
}
