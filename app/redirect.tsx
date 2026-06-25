import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Redirect() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const token = params.token as string;

    if (token) {
      AsyncStorage.setItem("token", token);
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  }, []);

  return null;
}