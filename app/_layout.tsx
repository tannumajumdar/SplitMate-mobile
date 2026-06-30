import '../src/global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { AppProvider } from '../src/context/AppContext';
import { ThemeProvider } from '../src/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

function RouteGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    SplashScreen.hideAsync();
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)');
    } else if (isAuthenticated && inAuth) {
      router.replace('/(app)/dashboard');
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <RouteGuard />
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
