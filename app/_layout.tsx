import '../src/global.css';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { AppProvider } from '../src/context/AppContext';
import { ThemeProvider } from '../src/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#020617' }}>
          <Text style={{ color: '#f87171', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Something went wrong
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
            {this.state.error.message}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ error: null })}
            style={{ marginTop: 24, backgroundColor: '#7C5CFF', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <RouteGuard />
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
