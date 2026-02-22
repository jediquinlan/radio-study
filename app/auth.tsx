import React, { useState } from 'react';
import { Alert, Button, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign Up
  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { full_name: 'New User' }, // This goes to our 'profiles' table via trigger
      },
    });

    if (error) Alert.alert(error.message);
    else Alert.alert('Check your email for the confirmation link!');
    setLoading(false);
  }

  // Log In
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <TextInput
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
        autoCapitalize={'none'}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
        value={password}
        autoCapitalize={'none'}
      />
      <Button title="Sign In" disabled={loading} onPress={() => signInWithEmail()} />
      <Button title="Sign Up" disabled={loading} onPress={() => signUpWithEmail()} />
    </View>
  );
}