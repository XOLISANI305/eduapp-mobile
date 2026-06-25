import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get<{ message: string }>(
          `http://10.3.21.77:5000/api/auth/verify/${token}`
        );
        Alert.alert("Success", res.data.message);
        router.replace("/login");
      } catch (err: any) {
        Alert.alert(
          "Error",
          err.response?.data?.message || "Verification failed"
        );
        router.replace("/login");
      }
    };

    if (token) verifyEmail();
  }, [token]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text>Verifying your email...</Text>
    </View>
  );
}
