import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/lib/constants';

export default function Index() {
  const { user, loading } = useAuth();

  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Redirect based on authentication status
  if (user) {
    // If user is authenticated, go to main app tabs
    return <Redirect href="/(tabs)" />;
  } else {
    // If user is not authenticated, go to auth flow
    return <Redirect href="/(auth)/login" />;
  }
}