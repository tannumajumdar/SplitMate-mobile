import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Button from '../../src/components/Button';

export default function Landing() {
  const router = useRouter();
  const [googleLoading] = useState(false);

  return (
    <View className="flex-1 bg-slate-950 items-center justify-center px-6 gap-14">
      {/* Logo + Brand */}
      <View className="items-center gap-5">
        <Image
          source={require('../../assets/icon.png')}
          className="w-32 h-32 rounded-3xl"
          resizeMode="contain"
        />
        <View className="items-center gap-2">
          <Text className="text-[40px] font-black tracking-tight">
            <Text className="text-white">Split</Text>
            <Text className="text-primary-500">Mate</Text>
          </Text>
          <Text className="text-slate-400 text-base text-center">
            Split expenses with roommates, fairly and instantly.
          </Text>
        </View>
      </View>

      {/* Auth Buttons */}
      <View className="w-full gap-3">
        <Button fullWidth size="lg" onPress={() => router.push('/(auth)/signup')}>
          Sign Up
        </Button>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          className="w-full h-14 rounded-2xl border border-slate-600 items-center justify-center"
        >
          <Text className="text-white font-semibold text-base">Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={googleLoading}
          className="w-full h-14 rounded-2xl border border-slate-600 bg-white flex-row items-center justify-center gap-3 opacity-90"
        >
          {googleLoading ? (
            <ActivityIndicator color="#475569" />
          ) : (
            <Text className="text-slate-800 font-semibold text-base">Continue with Google</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} className="items-center pt-1">
          <Text className="text-xs text-slate-500">
            By continuing, you agree to our{' '}
            <Text className="text-indigo-400">Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
