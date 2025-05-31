import { Stack } from 'expo-router';
import { LanguageProvider } from '@/context/LanguageContext';

export default function AuthLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="profile-setup" />
      </Stack>
    </LanguageProvider>
  );
}
