import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

const GREEN = '#58CC02';
const GREEN_DARK = '#46A302';
const BLUE = '#1CB0F6';
const BLUE_DARK = '#1899D6';
const GRAY_BG = '#F7F7F7';
const GRAY_BORDER = '#E5E5E5';
const GRAY_TEXT = '#777';

function RoundedButton({
  title,
  onPress,
  color = GREEN,
  shadowColor = GREEN_DARK,
  textColor = '#fff',
  disabled = false,
  outline = false,
}: {
  title: string;
  onPress: () => void;
  color?: string;
  shadowColor?: string;
  textColor?: string;
  disabled?: boolean;
  outline?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        outline
          ? { backgroundColor: '#fff', borderWidth: 2, borderColor: GRAY_BORDER }
          : { backgroundColor: color, borderBottomColor: shadowColor, borderBottomWidth: 4 },
        pressed && { opacity: 0.85, transform: [{ translateY: 1 }] },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          { color: outline ? BLUE : textColor },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {mode === 'signIn' ? 'Welcome back!' : 'Create Account'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'signIn' ? 'Sign in to continue learning' : 'Join the radio community'}
        </Text>

        <View style={styles.inputGroup}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={GRAY_TEXT}
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={GRAY_TEXT}
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {mode === 'signUp' && (
          <View style={styles.inputGroup}>
            <Text style={styles.sectionLabel}>Optional Info</Text>
            <TextInput placeholder="Call Sign" placeholderTextColor={GRAY_TEXT} onChangeText={setCallSign} value={callSign} autoCapitalize="characters" style={styles.input} />
            <View style={styles.row}>
              <TextInput placeholder="First Name" placeholderTextColor={GRAY_TEXT} onChangeText={setFirstName} value={firstName} style={[styles.input, styles.halfInput]} />
              <TextInput placeholder="Last Name" placeholderTextColor={GRAY_TEXT} onChangeText={setLastName} value={lastName} style={[styles.input, styles.halfInput]} />
            </View>
            <TextInput placeholder="Street Address 1" placeholderTextColor={GRAY_TEXT} onChangeText={setAddress1} value={address1} style={styles.input} />
            <TextInput placeholder="Street Address 2" placeholderTextColor={GRAY_TEXT} onChangeText={setAddress2} value={address2} style={styles.input} />
            <View style={styles.row}>
              <TextInput placeholder="City" placeholderTextColor={GRAY_TEXT} onChangeText={setCity} value={city} style={[styles.input, styles.halfInput]} />
              <TextInput placeholder="State / Province" placeholderTextColor={GRAY_TEXT} onChangeText={setStateProvince} value={stateProvince} style={[styles.input, styles.halfInput]} />
            </View>
            <View style={styles.row}>
              <TextInput placeholder="ZIP / Postal Code" placeholderTextColor={GRAY_TEXT} onChangeText={setZip} value={zip} keyboardType="numbers-and-punctuation" style={[styles.input, styles.halfInput]} />
              <TextInput placeholder="Country" placeholderTextColor={GRAY_TEXT} onChangeText={setCountry} value={country} style={[styles.input, styles.halfInput]} />
            </View>
          </View>
        )}

        <View style={styles.buttonGroup}>
          <RoundedButton
            title={mode === 'signIn' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            disabled={loading}
            onPress={mode === 'signIn' ? signInWithEmail : signUpWithEmail}
            color={GREEN}
            shadowColor={GREEN_DARK}
          />
          <RoundedButton
            title={mode === 'signIn' ? "I DON'T HAVE AN ACCOUNT" : 'I ALREADY HAVE AN ACCOUNT'}
            onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            outline
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: GRAY_TEXT,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 12,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: GRAY_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  input: {
    backgroundColor: GRAY_BG,
    borderWidth: 2,
    borderColor: GRAY_BORDER,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
