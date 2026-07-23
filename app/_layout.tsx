import React, { useEffect, useRef } from "react";
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import {
  setupPushNotifications,
  addNotificationResponseListener,
} from "./services/notifications";

export default function RootLayout() {
  const router = useRouter();
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const userId = String(user.id || user.user_id || user.userId);
        setupPushNotifications(userId);
      }
    })();

    responseListener.current = addNotificationResponseListener((subjectId) => {
      router.push({
        pathname: "/Dashboards/QnAChat",
        params: { subjectId },
      } as any);
    });

    return () => {
      responseListener.current?.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}