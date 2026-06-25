import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const seenOnboarding = await AsyncStorage.getItem("seenOnboarding");

        console.log('Token:', token);
        console.log('Seen onboarding:', seenOnboarding);

        await new Promise(resolve => setTimeout(resolve, 100));

        if (!seenOnboarding) {
          console.log('→ Going to onboarding');
          router.replace("/onboarding1"as any);
        } else if (token) {
          console.log('→ Going to home');
          router.replace("/home"as any);
        } else {
          console.log('→ Going to login');
          router.replace("/login"as any);
        }
      } catch (error) {
        console.error('Error:', error);
        router.replace("/login"as any);
      }
    };

    checkAuth();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0B0B44",
      }}
    >
      <ActivityIndicator size="large" color="#CC5500" />
    </View>
  );
}