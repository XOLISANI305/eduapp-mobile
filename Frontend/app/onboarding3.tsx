import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import onboarding3Img from "../assets/images/onboarding3.png";

export default function Onboarding3() {
  const router = useRouter();

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('seenOnboarding', 'true');
    router.replace('/login' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Image source={onboarding3Img} style={styles.image} />
        <Text style={styles.title}>Track Your Progress</Text>
        <Text style={styles.subtitle}>Monitor your achievements and grow!</Text>
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDCAE1", justifyContent: "center", alignItems: "center" },
  inner: { alignItems: "center", padding: 20 },
  image: { width: 250, height: 250, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: "bold", color: "#0B0B44", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#0B0B44", marginBottom: 30, textAlign: "center" },
  button: { backgroundColor: "#CC5500", padding: 15, borderRadius: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});