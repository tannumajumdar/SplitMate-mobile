import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Button from '../../src/components/Button';
import { authApi, tokenStore } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

// Required so the OAuth browser tab can redirect back into the app on Android
WebBrowser.maybeCompleteAuthSession();

export default function Landing() {
  const router = useRouter();
  const { login } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // expo-auth-session Google provider — reads client IDs from env vars.
  // Fill in EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID (and iOS / web) in .env
  // and eas.json env sections for this to work in production builds.
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  const signInWithToken = useCallback(async (googleToken: string) => {
    setGoogleLoading(true);
    setError('');
    try {
      const { user, accessToken } = await authApi.googleAuth(googleToken);
      tokenStore.set(accessToken);
      login(user, accessToken);
      router.replace('/(app)/dashboard');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Google sign-in failed. Try again.');
    } finally {
      setGoogleLoading(false);
    }
  }, [login, router]);

  useEffect(() => {
    if (!response) return;

    if (response.type === 'error') {
      setError(response.error?.message ?? 'Google sign-in was cancelled or failed.');
      return;
    }

    if (response.type !== 'success') return;

    // Prefer idToken (verified by backend); fall back to accessToken
    const token =
      response.authentication?.idToken ??
      response.authentication?.accessToken;

    if (token) {
      signInWithToken(token);
    } else {
      setError('Google sign-in returned no token. Please try again.');
    }
  }, [response, signInWithToken]);

  const handleGooglePress = () => {
    setError('');
    promptAsync();
  };

  return (
    <View className="flex-1 bg-slate-950 items-center justify-center px-6 gap-14">
      {/* Logo + Brand */}
      <View className="items-center gap-5">
        <Image
          source={require('../../assets/icon.png')}
          style={{ width: 128, height: 128, borderRadius: 24, alignSelf: 'center' }}
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

        {/* Google Sign-In */}
        <TouchableOpacity
          onPress={handleGooglePress}
          disabled={googleLoading || !request}
          className="w-full h-14 rounded-2xl border border-slate-600 bg-white flex-row items-center justify-center gap-3"
          style={{ opacity: googleLoading || !request ? 0.7 : 1 }}
        >
          {googleLoading ? (
            <ActivityIndicator color="#475569" />
          ) : (
            <>
              {/* Google "G" mark */}
              <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#4285F4', lineHeight: 22 }}>G</Text>
              </View>
              <Text className="text-slate-800 font-semibold text-base">Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {error ? (
          <Text className="text-rose-400 text-sm text-center">{error}</Text>
        ) : null}

        <TouchableOpacity className="items-center pt-1">
          <Text className="text-xs text-slate-500">
            By continuing, you agree to our{' '}
            <Text className="text-indigo-400">Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
