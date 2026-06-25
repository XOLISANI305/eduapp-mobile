import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import GestureRecognizer from "react-native-swipe-gestures";
import onboarding1Img from "../assets/images/onboarding1.png";

export default function Onboarding1() {
  const router = useRouter();

  const onSwipeLeft = () => router.replace("/onboarding2"as any);

  return (
    <GestureRecognizer onSwipeLeft={onSwipeLeft} style={styles.container}>
      <View style={styles.inner}>
        <Image source={onboarding1Img} style={styles.image} />
        <Text style={styles.title}>Welcome to EduApp</Text>
        <Text style={styles.subtitle}>Your journey to smart learning begins here!</Text>
        <TouchableOpacity onPress={onSwipeLeft}>
          <Text style={styles.next}>Next →</Text>
        </TouchableOpacity>
      </View>
    </GestureRecognizer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#A7E7CE", justifyContent: "center", alignItems: "center" },
  inner: { alignItems: "center", padding: 20 },
  image: { width: 250, height: 250, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: "bold", color: "#0B0B44", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#0B0B44", marginBottom: 30, textAlign: "center" },
  next: { fontSize: 18, color: "#CC5500", fontWeight: "bold" },
});