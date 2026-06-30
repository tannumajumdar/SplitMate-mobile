import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { authApi, tokenStore } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Fill in all fields'); return; }
    setError(''); setLoading(true);
    try {
      const { user, accessToken } = await authApi.login(email.trim().toLowerCase(), password);
      tokenStore.set(accessToken);
      login(user, accessToken);
      router.replace('/(app)/dashboard');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-slate-950">
      <ScrollView contentContainerClassName="flex-1" keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 py-12 gap-8">
          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-xl bg-slate-800">
            <Ionicons name="arrow-back" size={20} color="#94a3b8" />
          </TouchableOpacity>

          {/* Header */}
          <View className="gap-1">
            <Text className="text-3xl font-bold text-white">Welcome back</Text>
            <Text className="text-slate-400 text-base">Sign in to your account</Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Input label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} isPassword />
            {error ? <Text className="text-rose-400 text-sm">{error}</Text> : null}
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} className="items-end">
              <Text className="text-primary-400 text-sm">Forgot password?</Text>
            </TouchableOpacity>
            <Button fullWidth size="lg" onPress={handleLogin} loading={loading}>Sign In</Button>
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-center gap-1 mt-auto">
            <Text className="text-slate-400 text-sm">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
              <Text className="text-primary-400 font-semibold text-sm"> Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
