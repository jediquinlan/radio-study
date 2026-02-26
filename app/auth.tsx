import React, { useState } from 'react';
import { Alert, Button, ScrollView, Text, TextInput, View } from 'react-native';
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
    <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
        {mode === 'signIn' ? 'Sign In' : 'Create Account'}
      </Text>

      <TextInput
        placeholder="Email *"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password *"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        autoCapitalize="none"
      />

      {mode === 'signUp' && (
        <View>
          <Text style={{ marginTop: 16, marginBottom: 8, color: '#666' }}>Optional</Text>
          <TextInput placeholder="Call Sign" onChangeText={setCallSign} value={callSign} autoCapitalize="characters" />
          <TextInput placeholder="First Name" onChangeText={setFirstName} value={firstName} />
          <TextInput placeholder="Last Name" onChangeText={setLastName} value={lastName} />
          <TextInput placeholder="Street Address 1" onChangeText={setAddress1} value={address1} />
          <TextInput placeholder="Street Address 2" onChangeText={setAddress2} value={address2} />
          <TextInput placeholder="City" onChangeText={setCity} value={city} />
          <TextInput placeholder="State / Province" onChangeText={setStateProvince} value={stateProvince} />
          <TextInput placeholder="ZIP / Postal Code" onChangeText={setZip} value={zip} keyboardType="numbers-and-punctuation" />
          <TextInput placeholder="Country" onChangeText={setCountry} value={country} />
        </View>
      )}

      <View style={{ marginTop: 24, gap: 12 }}>
        <Button
          title={mode === 'signIn' ? 'Sign In' : 'Sign Up'}
          disabled={loading}
          onPress={mode === 'signIn' ? signInWithEmail : signUpWithEmail}
        />
        <Button
          title={mode === 'signIn' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
        />
      </View>
    </ScrollView>
  );
}
