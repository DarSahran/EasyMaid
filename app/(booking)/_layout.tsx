import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="services" />
      <Stack.Screen name="maid-selection" />
      <Stack.Screen name="datetime" />
      <Stack.Screen name="address" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="success" />
      <Stack.Screen name="tracking" />
    </Stack>
  );
}
