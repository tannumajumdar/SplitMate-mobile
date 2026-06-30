import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { authApi } from '../../src/services/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim()) { setError('Enter your email'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-slate-950">
      <View className="flex-1 px-6 py-12 gap-8">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-xl bg-slate-800">
          <Ionicons name="arrow-back" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <View className="gap-1">
          <Text className="text-3xl font-bold text-white">Forgot password?</Text>
          <Text className="text-slate-400 text-base">We'll send a reset link to your email</Text>
        </View>

        {sent ? (
          <View className="bg-emerald-900/30 border border-emerald-700 rounded-2xl p-4 gap-2">
            <Text className="text-emerald-400 font-semibold">Email sent!</Text>
            <Text className="text-slate-300 text-sm">Check your inbox for the reset link. It may take a few minutes.</Text>
          </View>
        ) : (
          <View className="gap-4">
            <Input label="Email Address" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
            {error ? <Text className="text-rose-400 text-sm">{error}</Text> : null}
            <Button fullWidth size="lg" onPress={handleSend} loading={loading}>Send Reset Link</Button>
          </View>
        )}

        <TouchableOpacity onPress={() => router.back()} className="items-center">
          <Text className="text-slate-400 text-sm">Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
