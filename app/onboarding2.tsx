import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import GestureRecognizer from "react-native-swipe-gestures";
import onboarding2Img from "../assets/images/onboarding2.png";

export default function Onboarding2() {
  const router = useRouter();

  const onSwipeLeft = () => router.replace("/onboarding3"as any);

  return (
    <GestureRecognizer onSwipeLeft={onSwipeLeft} style={styles.container}>
      <View style={styles.inner}>
        <Image source={onboarding2Img} style={styles.image} />
        <Text style={styles.title}>Interactive Learning</Text>
        <Text style={styles.subtitle}>Engage with videos, quizzes, and more!</Text>
        <TouchableOpacity onPress={onSwipeLeft}>
          <Text style={styles.next}>Next →</Text>
        </TouchableOpacity>
      </View>
    </GestureRecognizer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD6A5", justifyContent: "center", alignItems: "center" },
  inner: { alignItems: "center", padding: 20 },
  image: { width: 250, height: 250, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: "bold", color: "#0B0B44", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#0B0B44", marginBottom: 30, textAlign: "center" },
  next: { fontSize: 18, color: "#CC5500", fontWeight: "bold" },
});