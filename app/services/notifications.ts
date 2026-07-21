// services/notifications.ts
//
// Requires: expo install expo-notifications expo-device expo-constants
//
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api"; // adjust to wherever your base URL constant lives

// How notifications behave while the app is open/foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Ask the user for permission and return an Expo push token.
 * Returns null if permission was denied or this isn't a physical device
 * (push tokens don't work on simulators/emulators).
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission was denied.");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4E54C8",
    });
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );

  return tokenResponse.data; // looks like "ExponentPushToken[xxxxxxxx]"
}

/**
 * Registers the device for push and sends the token to your backend
 * so it can be associated with the logged-in user. Call this once,
 * right after login / on app start when a user session exists.
 */
export async function setupPushNotifications(userId: string) {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) return;

    const authToken = await AsyncStorage.getItem("authToken"); // adjust to your auth storage key

    await fetch(`${api}/notifications/register-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ userId, expoPushToken: token }),
    });
  } catch (error) {
    console.error("Failed to register for push notifications:", error);
  }
}

/**
 * Call once near the root of the app (e.g. in app/_layout.tsx) to handle
 * a notification tap and deep-link into the right screen — e.g. straight
 * into the Q&A chat for the subject the notification was about.
 */
export function addNotificationResponseListener(
  onOpenSubjectChat: (subjectId: string) => void
) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as {
      type?: string;
      subjectId?: string;
    };

    if (data?.type === "qna_message" && data.subjectId) {
      onOpenSubjectChat(data.subjectId);
    }
  });
}