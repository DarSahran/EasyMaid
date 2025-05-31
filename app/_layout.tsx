import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { BookingProvider } from '@/context/BookingContext';
import { soundManager } from '@/lib/soundManager';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '@/lib/constants';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Initialize sounds when app starts
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing MaidEasy App...');
        await soundManager.initializeSounds();
        console.log('✅ App initialization completed');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
      }
    };

    initializeApp();

    // Cleanup when app unmounts
    return () => {
      console.log('🛑 App unmounting, cleaning up...');
      soundManager.cleanup();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // User is not signed in and not in auth group, redirect to login
      console.log('🔄 Redirecting to login - no user');
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // User is signed in but in auth group, redirect to main app
      console.log('🔄 Redirecting to main app - user authenticated');
      router.replace('/(tabs)');
    }

    setIsNavigationReady(true);
  }, [user, loading, segments]);

  // Show loading screen while checking auth
  if (loading || !isNavigationReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(booking)" />
      <Stack.Screen name="(profile)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BookingProvider>
            <RootLayoutNav />
          </BookingProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
