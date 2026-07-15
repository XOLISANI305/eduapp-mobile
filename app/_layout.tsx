import { Stack } from "expo-router";
import { SubscriptionProvider } from "./context/SubscriptionContext";

export default function RootLayout() {
  return (
    <SubscriptionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="onboarding1" />
        <Stack.Screen name="onboarding2" />
        <Stack.Screen name="onboarding3" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="subjects" />
        <Stack.Screen name="topics" />
        <Stack.Screen name="assessments" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="chats" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="screens" />
        <Stack.Screen name="subject-details" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="checkout" />
      </Stack>
    </SubscriptionProvider>
  );
}