import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { authApi, tokenStore } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

export default function SignUp() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) { setError('Fill in all fields'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(''); setLoading(true);
    try {
      const { user, accessToken } = await authApi.register(name.trim(), email.trim().toLowerCase(), password);
      tokenStore.set(accessToken);
      login(user, accessToken);
      router.replace('/(app)/dashboard');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-slate-950">
      <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
        <View className="px-6 py-12 gap-8">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-xl bg-slate-800">
            <Ionicons name="arrow-back" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <View className="gap-1">
            <Text className="text-3xl font-bold text-white">Create account</Text>
            <Text className="text-slate-400 text-base">Join SplitMate for free</Text>
          </View>

          <View className="gap-4">
            <Input label="Full Name" placeholder="Tannu Majumdar" value={name} onChangeText={setName} autoCapitalize="words" />
            <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Input label="Password" placeholder="Min. 8 characters" value={password} onChangeText={setPassword} isPassword />
            <Input label="Confirm Password" placeholder="Re-enter password" value={confirm} onChangeText={setConfirm} isPassword />
            {error ? <Text className="text-rose-400 text-sm">{error}</Text> : null}
            <Button fullWidth size="lg" onPress={handleRegister} loading={loading}>Create Account</Button>
          </View>

          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-slate-400 text-sm">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text className="text-primary-400 font-semibold text-sm"> Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
